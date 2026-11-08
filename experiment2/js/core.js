window.LG2Core = (() => {
  function shuffle(items) {
    const list = items.slice();
    for (let i = list.length - 1; i > 0; i--) {
      const value = new Uint32Array(1); crypto.getRandomValues(value);
      const j = value[0] % (i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  function ageAt(birth, date = new Date()) {
    const match = /^(\d{4})(\d{2})$/.exec(String(birth).replace(/[- /]/g, ''));
    if (!match) throw Error('出生年月请填六位数字，如 199005');
    const year = Number(match[1]), month = Number(match[2]);
    if (year < 1900 || month < 1 || month > 12 || year > date.getFullYear() ||
        year === date.getFullYear() && month > date.getMonth() + 1) throw Error('请检查出生年月');
    return { year, month, age: date.getFullYear() - year - (date.getMonth() + 1 < month ? 1 : 0) };
  }
  function eligibility(screen, phq) {
    const total = Array.from({ length: 9 }, (_, i) => Number(phq['phq' + (i + 1)])).reduce((a, b) => a + b, 0);
    return {
      eligible: screen.age >= 18 && ['1', '2'].includes(String(screen.employ)) &&
        ['bereave', 'illness', 'treat', 'prior'].every(k => Number(screen[k]) === 0) &&
        total < 15 && Number(phq.phq9) < 1,
      phqSum: total, phqItem9: Number(phq.phq9)
    };
  }
  function stationMap(birthYear, expectancy, year = new Date().getFullYear()) {
    const end = birthYear + expectancy;
    const span = end - year;
    if (span <= 0) throw Error('主观预期寿命应大于当前年龄');
    return Array.from({ length: 10 }, (_, i) => {
      const exact = end - span * i / 10;
      const value = Math.floor(exact + 1e-9);
      const season = span < 10 ? ['春', '夏', '秋', '冬'][Math.min(3, Math.floor((1 - (exact - value)) * 4) % 4)] : '';
      return { id: 'R' + String(i + 1).padStart(2, '0'), year: value, age: value - birthYear,
        label: value + '年' + season };
    });
  }
  function derive(data) {
    const pre = data.emotion_pre?.values || {}, a = data.emotion_A?.values || {}, b = data.emotion_B?.values || {};
    const shares = data.garden_post?.shares;
    const result = {
      primary_A: a.e_unease ?? null, baseline_A: pre.e_unease ?? null,
      primary_B: shares ? shares.P1 + shares.P2 + shares.P3 : null,
      poignancy_A: a.e_happy == null ? null : Math.min(a.e_happy, a.e_sad),
      poignancy_B: b.e_happy == null ? null : Math.min(b.e_happy, b.e_sad)
    };
    if (shares) {
      const others = ['P1', 'P2', 'P3'].map(k => Math.log(shares[k] + .5));
      result.garden_log_ratio = Math.log((shares.F + .5) / (shares.S + .5));
      result.gS = Math.log(shares.S + .5) - (others.reduce((x, y) => x + y, 0) + Math.log(shares.F + .5)) / 4;
      result.gOF = others.reduce((x, y) => x + y, 0) / 3 - Math.log(shares.F + .5);
    }
    return result;
  }
  async function hash(text) {
    const result = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(result), v => v.toString(16).padStart(2, '0')).join('');
  }
  return { shuffle, ageAt, eligibility, stationMap, derive, hash };
})();
