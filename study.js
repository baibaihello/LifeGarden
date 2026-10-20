/* 生命花园 · 研究一 网页版 v24（脑岛）· study.js
   会话由网址参数 session= 决定：d0（第一天）、d1（第二天）。
   流程按已批准的伦理方案 v21.4 与新实验计划：主要结局（延迟折扣、花园）在第一天练习后测完；第二天照批文进行。
   数据经 DataPipe 保存：每个会话一份研究数据 JSON；第一天的主要结局与第二天的花园提交后各立即单独上传一份。
   微信号只写进单独的联系文件，研究数据里没有；安全标记触发时立即上传一份安全记录（不含微信号）。
*/
(function () {
  const CFG = window.LG_CONFIG;
  const qs = new URLSearchParams(location.search);
  const SESSION = (window.LG_SESSION || qs.get('session') || 'd0').toLowerCase();
  const PLATFORM = (window.LG_PLATFORM || qs.get('platform') || CFG.PLATFORM || 'naodao').toLowerCase();
  const unset = (v) => String(v || '').startsWith('REPLACE');
  const DD_PLACEHOLDER = ['A', 'B', 'C'].some((k) => !(CFG.DD_SETS && CFG.DD_SETS[k]));
  const WARN = [unset(CFG.DATAPIPE_ID) ? 'DataPipe 实验号未设置' : '', DD_PLACEHOLDER ? '延迟折扣题未填' : '', unset(CFG.ETHICS_NO) ? '伦理批件号未填' : '', unset(CFG.PROF_EMAIL) ? '导师邮箱未填' : ''].filter(Boolean);
  const CONFIG_WARN = WARN.length ? `<div class="lg-card" style="background:#4A1F1F;border-color:#8A3A3A;color:#FFD7CF">测试配置：${WARN.join('、')}。正式上线前请在 config.js 中填好。</div>` : '';
  const ETHICS_NO = unset(CFG.ETHICS_NO) ? '（待填）' : CFG.ETHICS_NO;
  const PROF_EMAIL = unset(CFG.PROF_EMAIL) ? '（待填）' : CFG.PROF_EMAIL;
  // 页面上是否显示研究者与导师的姓名（SHOW_NAMES: false 时只写单位；见伦理第二次修改）
  const NAMED = CFG.SHOW_NAMES !== false;
  const WHO_LINE = NAMED ? '<b>调研人员</b>：白娅靖（博士研究生）；导师：王晓田教授' : `<b>调研单位</b>：${CFG.INSTITUTION || '香港中文大学（深圳）'}`;
  const WHO_CONTACT = NAMED ? `白娅靖（邮箱：${CFG.CONTACT_EMAIL}），或王晓田教授（邮箱：${PROF_EMAIL}）` : `研究者（邮箱：${CFG.CONTACT_EMAIL}），或研究负责人（邮箱：${PROF_EMAIL}）`;
  const WHO_FOOT = NAMED ? `白娅靖（${CFG.CONTACT_EMAIL}）或王晓田教授（${PROF_EMAIL}）` : `研究者（${CFG.CONTACT_EMAIL}）或研究负责人（${PROF_EMAIL}）`;

  // 研究介绍书：已批准的 v21.4 文本；改动只在两次接触的内容与报酬次数（见报备邮件）
  const INFO_SHEET_HTML = `<div style="font-size:15px;line-height:1.7">
<p><b>项目名称</b>：引导练习与日常时间安排：一项线上行为实验（生命花园·研究一）<br>${WHO_LINE}<br><b>调研人员联系邮箱</b>：${CFG.CONTACT_EMAIL}<br><b>伦理审批号</b>：${ETHICS_NO}</p>
<p><b>研究目标</b>：本研究想了解一段约 11 分钟的线上引导练习会不会影响人们当天和第二天对时间、精力和钱的安排——分给现在的自己、将来的自己和重要的人各多少。研究结果将有助于开发低成本、可推广的时间管理练习。</p>
<p><b>入选标准</b>：22–55 岁、目前在职（全职或稳定兼职）的成年人；能使用微信和手机浏览器，有耳机（或能在安静处用外放收听）；第一天能在安静环境一次完成约 30 分钟，第二天能完成约 10 分钟。以下情况不建议参加：过去六个月有至亲去世；过去一年被诊断危及生命的疾病；目前正在接受精神科药物治疗、心理治疗或危机干预；有听力问题；过去三个月参加过涉及死亡或寿命、跨期选择、冥想训练或"生命花园"的研究。</p>
<p><b>研究过程与参与时间</b>：本研究全部在手机或电脑浏览器中完成，不需要到场，共有两次接触。第一天（约 30 分钟，任意时段，一次完成）：阅读研究介绍与知情同意 → 几道筛查题 → 基本信息与几份简短问卷 → 一个"把 100 份养分分给五棵树"的小任务和几道"现在拿钱还是以后拿钱"的二选一 → 写一句此刻的感受并对几个词打分 → 戴耳机听一段约 11 分钟的引导练习（先安定呼吸，再想象来到人生中的某一天，在那一天停留片刻或从那一天回望自己的经历，最后回到当下；练习有几个版本，您会随机听到其中一个，第二天结束时我们会告诉您）→ 再次打分、分配与选择 → 几道关于练习体验的题 → 用语音或文字说一段感受（可跳过）。结束时页面会显示一个 8 位码，请截图保存。第二天（约 10 分钟，第一天完成后 12 小时至 7 天内，任意时间，越早越好）：输入 8 位码（或第一天留下的微信号）→ 打分、分配任务、几道二选一、一笔小额报酬的领取方式选择，以及几道简短问题 → 语音或文字记录（可跳过）→ 结束说明。完成全部任务后，部分参与者可能受邀参加一次约 20 分钟的自愿线上访谈，届时另行说明、另行征求同意并另付报酬；不参加没有任何影响。</p>
<p><b>参与研究的风险与不适</b>：参与本次项目不会给您带来超出日常生活范围的风险。想象人生中的某一天有可能引起短暂、轻度的忧伤或不安，通常很快过去，程度不超出日常回忆往事时的范围。练习前后页面都会显示一张"资源卡"，写明可以怎么做和如何联系我们；您随时可以暂停或退出。请在安静、安全的环境中完成练习，练习期间请不要开车或做需要注意力的事。</p>
<p><b>参与研究的好处</b>：参与本项研究没有直接的好处。研究结束后，您可以获得练习中"呼吸安顿"部分的单独音频作为回馈。</p>
<p><b>受试者资料的保密</b>：您在试验中的任何内容均属保密。本次研究所发表或出版的任何结果，将只以集体性的统计数据呈现或完全作匿名处理，即不会有您的个人身份信息。本研究需要您提供个人可识别信息（出生年月、性别、职业类别、工作年限，以及一个用于次日提醒和必要时联系您的微信号；您也可以选择录制一段语音）。只有本项目的调研人员可获取您的个人可识别信息，而这些信息将会与您在研究中提供的其他内容分开，并得以安全地保存：微信号只保存在课题组内部记录表中，不进入研究数据；研究数据以程序生成的编号标识，经加密通道存入调研人员私密的云端文件夹（开放科学框架 OSF 上不公开的项目，服务器位于中国大陆以外）；微信号单独存放于另一份文件，只以编号对应；语音只由调研人员访问，转成文字并去除可识别信息后分析，原始录音在研究结束后 12 个月内删除，去标识的研究数据按学校规定保存 5 年。去掉可识别信息后，您的文字作答可能由人工智能语言模型辅助整理；是否同意在知情同意页单独选择，不同意完全不影响参加。调研人员在资料分析和发表时不会使用您的个人身份信息。</p>
<p><b>报酬</b>：报酬分次发放：第一天完成后一笔，第二天完成后一笔，每笔 2–5 元，通过招募平台或研究者微信发放；第二天还有一笔小额报酬，由您选择现在领取、一个月后领取或捐赠给公益项目，三种方式金额相同，"一个月后领取"的部分在 30 天后发放。报酬按完成的天数发放（以完成码为凭），已发放的报酬不收回；某一天中途退出则该天无报酬，不影响其他。</p>
<p><b>自愿性参与</b>：您对本研究的参与完全基于自愿的原则。即便您同意参与并开始本研究之后，仍可以随时退出而无需提供任何理由：只退出这次练习或退出整个研究都可以，已完成部分的报酬照常发放。请注意，当您的资料已经包括在发表的研究结果或在线数据库中，它们将无法被撤销。如果您有需求，调研人员可以为您提供知情同意书副本。若对本研究有任何问题，请联系${WHO_CONTACT}。若您对本研究有任何疑问或不满，可以直接以书面形式与应用心理学大学伦理委员会联系，邮箱为：psyethics@cuhk.edu.cn。</p></div>`;

  // ---------- 连接码 / 完成码：5 位随机 + 2 位完成小时 + 1 位校验（无 0/O/1/I）----------
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const EPOCH = Date.UTC(2026, 8, 1);
  const hoursNow = () => Math.floor((Date.now() - EPOCH) / 3.6e6);
  const rand5 = () => { const a = new Uint32Array(5); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => a[i] = Math.floor(Math.random() * 4e9)); return Array.from(a, x => ALPHA[x % 32]).join(''); };
  const checkChar = (s7) => ALPHA[[...s7].reduce((acc, ch, i) => acc + ALPHA.indexOf(ch) * (i + 1), 0) % 32];
  const makeCode = (r5, hours) => { const h = ((hours % 1024) + 1024) % 1024; const s7 = r5 + ALPHA[Math.floor(h / 32)] + ALPHA[h % 32]; return s7 + checkChar(s7); };
  const parseCode = (raw) => { const c = (raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/0/g, 'O').replace(/1/g, 'I'); if (c.length !== 8 || [...c].some(ch => ALPHA.indexOf(ch) < 0)) return { ok: false, reason: 'format' }; if (checkChar(c.slice(0, 7)) !== c[7]) return { ok: false, reason: 'check' }; const hours = ALPHA.indexOf(c[5]) * 32 + ALPHA.indexOf(c[6]); return { ok: true, code: c, hours }; };
  const fmt = (c) => c.slice(0, 4) + '-' + c.slice(4);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const normWx = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, '');
  let PAIR = null;
  const RETURN_URL = qs.get(CFG.RETURN_PARAM);
  let PID = null;
  for (const k of CFG.PID_PARAMS) { if (qs.get(k)) { PID = qs.get(k); break; } }
  // 第一天中途刷新或重新打开链接时沿用同一个匿名编号（12 小时内、第一天未完成），从而沿用原分组（意向性分析）
  if (!PID && SESSION === 'd0') { try { const o = JSON.parse(localStorage.getItem('lg_anon_pid') || 'null'); if (o && o.pid && (Date.now() - o.t) < 12 * 3.6e6 && !localStorage.getItem('lg_' + o.pid + '_d0_done')) { PID = o.pid; window.__lgReload = true; } } catch (e) { } }
  if (!PID) { PID = 'anon-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); if (SESSION === 'd0') { try { localStorage.setItem('lg_anon_pid', JSON.stringify({ pid: PID, t: Date.now() })); } catch (e) { } } }
  const LS = (k) => `lg_${PID}_${k}`;
  const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };
  const nowISO = () => new Date().toISOString();
  const store = {};
  const log = (tag, obj) => { store[tag] = Object.assign({ t: nowISO() }, obj || {}); };
  const evt = []; const ev = (name, extra) => evt.push(Object.assign({ name, t: nowISO() }, extra || {}));
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) >>> 0; } return h; };
  const code = (kind) => { if (kind === 'd0' && PAIR) return fmt(PAIR); if (kind === 'd1' && PAIR) return CFG.CODE_PREFIX.d1 + '-' + fmt(PAIR); return CFG.CODE_PREFIX[kind] + '-' + (hash(PID + kind + CFG.VERSION) % 1000000).toString().padStart(6, '0'); };

  // ---------- DataPipe ----------
  const PENDING_KEY = 'lg_pending_uploads';
  const getPending = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch (e) { return []; } };
  const setPending = (a) => lsSet(PENDING_KEY, JSON.stringify(a.slice(-10)));
  async function postData(filename, dataStr) {
    const body = { experimentID: CFG.DATAPIPE_ID, filename, data: dataStr };
    let last = null;
    for (let i = 0; i < 3; i++) {
      try {
        const r = await fetch('https://pipe.jspsych.org/api/data/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': '*/*' }, body: JSON.stringify(body) });
        if (r.ok) return { ok: true };
        let msg = ''; try { msg = await r.text(); } catch (e) { }
        last = 'HTTP ' + r.status + ' ' + msg.slice(0, 200);
        if (r.status >= 400 && r.status < 500 && !/exists/i.test(msg)) break;
      } catch (e) { last = String(e); }
      await new Promise(res => setTimeout(res, 1500));
    }
    console.warn('DataPipe 保存失败', filename, last);
    return { ok: false, error: last };
  }
  // 研究数据：一行、全部是简单字段；完整数据放在 payload_json 里。研究数据里永远没有微信号。
  async function pipeSave(filename, obj) {
    const row = { trial_type: 'lifegarden_' + (obj.session || SESSION), lg_file: filename, pid: obj.pid || PID, session: obj.session || SESSION, platform: PLATFORM, pair_code: obj.pair_code || PAIR || '', version: CFG.VERSION, saved_at: nowISO(), payload_json: JSON.stringify(obj) };
    const res = await postData(filename, JSON.stringify([row]));
    window.__lgLastSaveError = res.ok ? null : res.error;
    if (!res.ok) { const a = getPending(); a.push({ filename, dataStr: JSON.stringify([row]), t: nowISO() }); setPending(a); }
    return res.ok;
  }
  // 联系文件：只有编号、连接码与微信号，与研究数据分开保存（研究人员下载后移入课题组内部记录表）
  async function saveContact(tag, wechat) {
    if (!wechat) return false;
    const fn = `${PID}_${SESSION}_${tag}_contact.json`;
    const row = { trial_type: 'lifegarden_contact', lg_file: fn, pid: PID, session: SESSION, pair_code: PAIR || '', wechat, version: CFG.VERSION, saved_at: nowISO() };
    const res = await postData(fn, JSON.stringify([row]));
    if (!res.ok) { const a = getPending(); a.push({ filename: fn, dataStr: JSON.stringify([row]), t: nowISO() }); setPending(a); }
    return res.ok;
  }
  async function flushPending() {
    const a = getPending(); if (!a.length) return; const keep = [];
    for (const it of a) { const r = await postData(it.filename.replace(/\.json$/, '_retry.json'), it.dataStr); if (!r.ok) keep.push(it); }
    setPending(keep);
  }
  flushPending();
  async function pipeSaveBase64(filename, b64) {
    const body = { experimentID: CFG.DATAPIPE_ID, filename, data: b64 };
    try { const r = await fetch('https://pipe.jspsych.org/api/base64/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': '*/*' }, body: JSON.stringify(body) }); return r.ok; } catch (e) { return false; }
  }
  async function pipeCondition(expID) {
    try { const r = await fetch('https://pipe.jspsych.org/api/condition/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': '*/*' }, body: JSON.stringify({ experimentID: expID }) }); if (!r.ok) return null; const j = await r.json(); return (j && typeof j.condition === 'number') ? j.condition : null; } catch (e) { return null; }
  }
  // 区组 8：四组各 2 个号（1:1:1:1）；顺序由固定种子打乱，DataPipe 顺序发号 0..7 循环
  const BLOCK = ['ER', 'ER', 'E0', 'E0', 'LR', 'LR', 'L0', 'L0'];
  function blockPattern(seedStr) { let s = hash(seedStr) || 1; const rnd = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; const b = BLOCK.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  async function assignCell() {
    const cond = await pipeCondition(CFG.DATAPIPE_ID);
    const pattern = blockPattern('LG-v24-study1');
    if (cond === null) { const c = Math.floor(Math.random() * CFG.N_CONDITIONS); return { cell: pattern[c % 8], cond: c, source: 'local-fallback' }; }
    return { cell: pattern[cond % 8], cond, source: 'datapipe' };
  }
  // 第一天的两个平衡因素（练习前后延迟折扣题组的先后、练习后两项主要结局的先后），刷新后沿用
  function designFactors() {
    const saved = lsGet(LS('design'));
    if (saved) { try { return JSON.parse(saved); } catch (e) { } }
    const d = { dd_order: Math.random() < 0.5 ? ['A', 'B'] : ['B', 'A'], post_order: Math.random() < 0.5 ? 'garden_first' : 'dd_first' };
    lsSet(LS('design'), JSON.stringify(d));
    return d;
  }

  // ---------- jsPsych ----------
  const jsPsych = initJsPsych({ extensions: (typeof Naodao !== 'undefined') ? [{ type: Naodao }] : [] });
  const T = [];
  const H = (s) => `<div class="lg-box">${s}</div>`;
  const btn = (html, opts) => Object.assign({ type: jsPsychHtmlButtonResponse, stimulus: H(html), choices: ['继续'], data: { tag: 'info' } }, opts || {});
  const form = (title, fields, tag, extra) => Object.assign({ type: jsPsychSurveyHtmlForm, preamble: `<div class="lg-box"><h3>${title}</h3></div>`, html: `<div class="lg-box lg-form">${fields}<p class="lg-err" id="lg-err"></p></div>`, button_label: '继续', data: { tag }, on_finish: (d) => { log(tag, Object.assign({}, d.response)); } }, extra || {});
  const radio = (name, items, req = true) => items.map((it) => `<label class="lg-radio"><input type="radio" name="${name}" value="${it.v !== undefined ? it.v : (it.t || it)}" ${req ? 'required' : ''}> ${it.t || it}</label>`).join('');
  const likertRow = (name, n, req) => `<div class="lg-likert" style="grid-template-columns:repeat(${n},1fr)">${Array.from({ length: n }, (_, i) => `<label><input type="radio" name="${name}" value="${i + 1}" ${req ? 'required' : ''}>${i + 1}</label>`).join('')}</div>`;
  const likert = (name, q, lo, hi, n = 7, req = true) => `<div class="lg-q"><div>${q}</div><div class="lg-likert-ends"><span>1 ${lo}</span><span>${n} ${hi}</span></div>${likertRow(name, n, req)}</div>`;
  const slider0_10 = (name, label, lo = '完全没有', hi = '非常强烈') => `<div class="lg-q"><div>${label}</div><div class="lg-sl"><input type="range" name="${name}" min="0" max="10" value="0" step="1" oninput="this.dataset.touched=1;this.nextElementSibling.textContent=this.value;this.style.setProperty('--fill',(this.value*10)+'%')"><output>0</output></div><div class="lg-sl-scale"><span>0 ${lo}</span><span>10 ${hi}</span></div></div>`;
  const guard = (check) => ({ on_load: () => { const f = document.querySelector('#jspsych-survey-html-form'); if (f) f.addEventListener('submit', (e) => { const msg = check(f); if (msg) { e.preventDefault(); e.stopImmediatePropagation(); const el = document.getElementById('lg-err'); if (el) { el.textContent = msg; el.scrollIntoView({ block: 'center' }); } } }, true); } });
  // 记录每个滑块是否被动过（没动过的 0 和主动选的 0 可以区分）
  const touchedOf = () => { const o = {}; document.querySelectorAll('#jspsych-survey-html-form input[type=range]').forEach((r) => { o[r.name] = r.dataset.touched ? 1 : 0; }); return o; };
  const withTouched = (trial) => { const ol = trial.on_load; trial.on_load = function () { if (ol) ol.apply(this, arguments); const f = document.querySelector('#jspsych-survey-html-form'); if (f) f.addEventListener('submit', () => { window.__lgTouched = touchedOf(); }, true); }; return trial; };

  // ---------- 分配任务（通用）：滑块 + 剩余量，合计必须等于 total ----------
  function allocTrial(tag, title, intro, items, total, step, opts) {
    opts = opts || {};
    const tree = !!opts.tree;
    let order = null;
    const html = () => { order = opts.fixedOrder ? items.map((_, i) => i) : shuffle(items.map((_, i) => i)); return `<div class="lg-box lg-garden-box"><h3>${title}</h3>${opts.note ? `<div class="lg-note">${opts.note()}</div>` : ''}<p>${intro}</p>
      <div class="lg-pool"><span>还剩</span><b id="lg-left">${total}</b><span>${opts.unit || ''}</span><div class="lg-pool-bar"><div id="lg-pool-fill"></div></div></div>
      <div id="lg-garden">${order.map(i => `<div class="lg-tree-row${tree ? '' : ' lg-notree'}">${tree ? `<div class="lg-tree" data-t="${items[i].k}"><span class="lg-tree-icon">🌱</span></div>` : ''}<div class="lg-tree-main"><div class="lg-tree-top"><span class="lg-name">${esc(items[i].label())}</span><output>0</output></div><input type="range" data-k="${items[i].k}" min="0" max="${total}" value="0" step="${step}"></div></div>`).join('')}</div></div>`; };
    return { type: jsPsychHtmlButtonResponse, stimulus: html, choices: ['提交'], data: { tag }, on_load: function () {
        const b = document.querySelector('.jspsych-btn'); b.disabled = true;
        const inputs = [...document.querySelectorAll('#lg-garden input')]; const t0 = performance.now(); const trace = [];
        const grow = (x) => { const v = +x.value; x.style.setProperty('--fill', (v / total * 100) + '%'); if (!tree) return; const t = document.querySelector(`.lg-tree[data-t="${x.dataset.k}"] .lg-tree-icon`); t.textContent = v === 0 ? '🌱' : (v < total / 5 ? '🌿' : '🌳'); t.style.transform = `scale(${0.8 + v / total * 1.43})`; };
        const upd = () => { const sum = inputs.reduce((a, x) => a + (+x.value), 0); const left = total - sum; const el = document.getElementById('lg-left'); el.textContent = left; el.className = left < 0 ? 'lg-over' : (left === 0 ? 'lg-done' : ''); document.getElementById('lg-pool-fill').style.width = Math.max(0, Math.min(100, left / total * 100)) + '%'; const minOk = Object.entries(opts.min || {}).every(([k, m]) => +inputs.find(x => x.dataset.k === k).value >= m); b.disabled = !(sum === total && minOk); };
        inputs.forEach(x => { x.addEventListener('input', () => { x.parentElement.querySelector('output').textContent = x.value; grow(x); trace.push([Math.round(performance.now() - t0), x.dataset.k, +x.value]); upd(); }); });
        window.__lgAlloc = () => { const o = {}; inputs.forEach(x => o[x.dataset.k] = +x.value); return { shares: o, total, order: order.map(i => items[i].k), trace, sec: Math.round((performance.now() - t0) / 1000) }; };
      }, on_finish: async function (d) { const g = window.__lgAlloc(); Object.assign(d, g); log(tag, g); if (opts.after) await opts.after(d); } };
  }
  const people = () => window.__people || ['第 1 位重要的人', '第 2 位重要的人', '第 3 位重要的人'];
  const gardenItems = () => [{ k: 'P1', label: () => people()[0] }, { k: 'P2', label: () => people()[1] }, { k: 'P3', label: () => people()[2] }, { k: 'S', label: () => '现在的自己' }, { k: 'F', label: () => '五年后的自己' }];
  const garden = (tag, opts) => allocTrial(tag, '今天的花园', '你手里有 <b>100 份养分</b>。拖动滑块，把它们分给下面五棵树——给得多的树会长得更高。合计正好 100；"现在的自己"至少 1 份。', gardenItems(), 100, 1, Object.assign({ tree: true, unit: '份养分', min: { S: 1 } }, opts || {}));
  const HF_ITEMS = [{ k: 'gift', label: () => '给一个对你来说特别的人买一件好东西' }, { k: 'pension', label: () => '存入养老（退休）储蓄' }, { k: 'fun', label: () => '给自己安排一次尽兴、稍微奢侈一点的活动' }, { k: 'current', label: () => '存进随时可取的活期账户' }];
  const hfTrial = (tag) => allocTrial(tag, '一笔意外的钱', '想象你意外得到 <b>1000 元</b>。请把它分到下面四个用途（每格 50 元），合计正好 1000 元。', HF_ITEMS, 1000, 50, { unit: '元' });

  // ---------- 情绪：一句自述 + 正负性情绪量表国际简版（10 词，1–5）+ 五个单项（0–10，安全规则用其中的"不安""忧伤"）----------
  const PANAS = [['pa_active', '活跃的'], ['pa_determined', '坚定的'], ['pa_attentive', '专注的'], ['pa_inspired', '受鼓舞的'], ['pa_alert', '警觉的'],
                 ['na_afraid', '害怕的'], ['na_nervous', '紧张的'], ['na_upset', '心烦的'], ['na_hostile', '有敌意的'], ['na_ashamed', '羞愧的']];
  const EMO = [['calm', '平静'], ['sad', '忧伤'], ['unease', '不安'], ['moved', '感动']];
  function emotionTrial(tag, preface) {
    let o1 = null, o2 = null;
    return withTouched({ type: jsPsychSurveyHtmlForm, preamble: `${preface || ''}<div class="lg-box"><h3>此刻的感受</h3></div>`,
      html: () => { o1 = shuffle(PANAS); o2 = shuffle(EMO); return `<div class="lg-box lg-form"><div class="lg-q"><div>请用几个词或一两句话描述<b>此刻的感受</b>：</div><textarea name="free" rows="3" required></textarea></div>
        <p>下面每个词，此刻你感受到的程度（1 = 几乎没有，5 = 极其强烈）：</p>${o1.map(([k, l]) => likert('e_' + k, l, '几乎没有', '极其强烈', 5)).join('')}
        <p>下面每一项，此刻你感受到的程度（0 = 完全没有，10 = 非常强烈）：</p>${o2.map(([k, l]) => slider0_10('e_' + k, l)).join('')}${slider0_10('mixed', '此刻我同时有高兴和难过两种感受', '完全不符合', '完全符合')}<p class="lg-err" id="lg-err"></p></div>`; },
      button_label: '继续', data: { tag }, on_finish: (d) => { log(tag, Object.assign({ order_panas: o1.map(x => x[0]), order_single: o2.map(x => x[0]), touched: window.__lgTouched || {} }, d.response)); } });
  }

  // ---------- 延迟折扣：Table S2 的平行题组（A、B 第一天，C 第二天）----------
  function ddTrials(setKey, tag, intro) {
    const items = CFG.DD_SETS && CFG.DD_SETS[setKey] ? CFG.DD_SETS[setKey] : CFG.DD_TEST_ITEMS;
    const placeholder = !(CFG.DD_SETS && CFG.DD_SETS[setKey]);
    const out = [btn(`<h3>选择题</h3><p>${intro || `接下来是 ${items.length} 道选择题`}：每一题请选你更想要的一项。没有对错，按你的真实偏好选。都是假设的选择，不涉及真实支付。</p>${placeholder ? '<p class="lg-muted">（测试题，正式上线前替换为 Table S2 原题）</p>' : ''}`, { data: { tag: tag + '_intro' } })];
    items.forEach((it, i) => out.push({ type: jsPsychHtmlButtonResponse, stimulus: H(`<h3>你更想要哪一项？</h3><p class="lg-dd"><b>A：现在得到 ${it.ss} 元</b><br><b>B：${it.delay} 天后得到 ${it.ll} 元</b></p>`), choices: ['A 现在', 'B 以后'], data: { tag: 'dd' },
      on_finish: (d) => { store[tag] = store[tag] || { set: setKey, placeholder, choices: [] }; store[tag].choices.push({ item: i + 1, ss: it.ss, delay: it.delay, ll: it.ll, ll_chosen: d.response === 1 ? 1 : 0, rt: d.rt }); } }));
    return out;
  }

  // ---------- 语音或文字记录（批文原有；可跳过；录音须在知情同意页单独同意）----------
  function diaryTrials(tag, prompt) {
    const recOk = () => (store.consent || {}).rec === 'voice' || (store.d1_rec_ok === true);
    const choose = { type: jsPsychHtmlButtonResponse, stimulus: () => H(`<h3>说一说（可跳过）</h3><p>${prompt}</p><p>${recOk() ? '你可以用<b>语音</b>（不超过 90 秒）或<b>打字</b>回答，也可以跳过。' : '你可以<b>打字</b>回答，也可以跳过。'}</p>`),
      choices: () => recOk() ? ['用语音', '用打字', '跳过'] : ['用打字', '跳过'], data: { tag: tag + '_choice' },
      on_finish: (d) => { const map = recOk() ? ['voice', 'text', 'skip'] : ['text', 'skip']; log(tag + '_choice', { choice: map[d.response] }); } };
    const voice = { timeline: [
      { type: jsPsychInitializeMicrophone, data: { tag: tag + '_mic' }, on_finish: () => { log(tag + '_mic', { ok: true }); } },
      { type: jsPsychHtmlAudioResponse, stimulus: H(`<h3>请开始说</h3><p>${prompt}</p><p class="lg-muted">最长 90 秒；说完点"完成"。</p>`), recording_duration: 90000, show_done_button: true, done_button_label: '完成', allow_playback: false, data: { tag: tag + '_voice' },
        on_finish: (d) => { log(tag + '_voice', { rt: d.rt, has_audio: !!d.response, bytes: d.response ? d.response.length : 0 }); window.__lgAudioB64 = d.response || null; d.response = null; } },
      { type: jsPsychHtmlButtonResponse, choices: [], trial_duration: 999999, stimulus: '<div class="lg-box"><h3>正在保存录音…</h3><p id="lg-up">请不要关闭页面。</p></div>', data: { tag: tag + '_upload' }, on_load: async function () {
          const el = document.getElementById('lg-up'); const b64 = window.__lgAudioB64; let ok = false;
          if (b64) { const fn = `${PID}_${SESSION}_${tag}.webm`; for (let i = 0; i < 3 && !ok; i++) { ok = await pipeSaveBase64(fn, b64); if (!ok) await new Promise(r => setTimeout(r, 2000)); } store[tag + '_voice'].uploaded = ok; store[tag + '_voice'].file = fn; }
          window.__lgAudioB64 = null;
          el.innerHTML = ok ? '<b style="color:#6BBF59">录音已保存。</b>' : '<b style="color:#E88A6F">录音未能上传</b>（网络问题）。请在下一页用打字回答，谢谢。';
          setTimeout(() => jsPsych.finishTrial({ uploaded: ok }), ok ? 1200 : 2500);
        } }
    ], conditional_function: () => store[tag + '_choice'] && store[tag + '_choice'].choice === 'voice' };
    const text = { timeline: [form('写一写', `<div class="lg-q"><div>${prompt}</div><textarea name="diary" rows="6" required></textarea></div>`, tag + '_text')], conditional_function: () => { const c = store[tag + '_choice'] && store[tag + '_choice'].choice; const v = store[tag + '_voice']; return c === 'text' || (c === 'voice' && (!v || !v.has_audio || !v.uploaded)); } };
    return [choose, voice, text];
  }

  // ---------- 结束保存 ----------
  function finishTrial(kind) {
    return { type: jsPsychHtmlButtonResponse, choices: [], trial_duration: 999999, stimulus: '<div class="lg-box"><h3>正在保存…</h3><p id="lg-save">请不要关闭页面。</p></div>', data: { tag: 'finish' }, on_load: async function () {
        if (kind === 'd0') { PAIR = makeCode(window.__lgRand5 || rand5(), hoursNow()); lsSet(LS('pair'), PAIR); lsSet('lg_last_pair', PAIR); saveContact('pair', window.__lgWechat || null); }
        const payload = { pid: PID, platform: PLATFORM, platform_uid: qs.get('uid') || null, session: SESSION, pair_code: PAIR, version: CFG.VERSION, ua: navigator.userAgent, start: window.__lgStart, end: nowISO(), store, events: evt };
        const ok = await pipeSave(`${PID}_${SESSION}.json`, payload);
        lsSet(LS(SESSION + '_done'), nowISO());
        const c = code(kind);
        const el = document.getElementById('lg-save');
        const retUrl = RETURN_URL ? (decodeURIComponent(RETURN_URL) + (RETURN_URL.includes('?') ? '&' : '?') + 'code=' + c + '&uid=' + encodeURIComponent(PID)) : null;
        const retBtn = retUrl ? `<p><button class="jspsych-btn" id="lg-return">我已记下完成码，返回平台</button></p>` : `<p>${CFG.AFTER_CODE}</p>`;
        const saved = (ok ? '<b>已保存。</b>' : `<b>保存遇到问题</b>，请截图此页，在微信上告诉研究者，或发邮件到 ${CFG.CONTACT_EMAIL}。<br><span class="lg-muted">${esc(window.__lgLastSaveError || '')}</span>`) + `<br><span class="lg-muted" style="font-size:11px">${CFG.VERSION}</span>`;
        if (kind === 'd0') { el.innerHTML = `${saved}<br><br>你的<b>完成码（也是第二天的连接码）</b>：<div class="lg-code">${c}</div><p><b>请截图保存这个码</b>，也可以把它发到自己微信的"文件传输助手"。第二天做任务时输入它；万一找不到，填你今天留下的微信号也可以。</p><p>${CFG.D0_NEXT}</p>${retBtn}`; }
        else { el.innerHTML = `${saved}<br><br>你的完成码：<div class="lg-code">${c}</div>${retBtn}`; }
        if (retUrl) { document.getElementById('lg-return').onclick = () => { location.href = retUrl; }; }
        try { if (window.parent && window.parent !== window) { window.parent.postMessage({ status: 'finished', participant: PID, code: c }, '*'); } } catch (e) { }
      } };
  }

  // ============================================================ 第一天
  function buildD0() {
    window.__lgStart = nowISO(); ev('d0_start'); window.__lgRand5 = rand5();
    const DES = designFactors(); const [DD_PRE, DD_POST] = DES.dd_order;
    T.push({ type: jsPsychCallFunction, func: () => log('design', { dd_pre: DD_PRE, dd_post: DD_POST, post_order: DES.post_order, reload: !!window.__lgReload }) });
    // 知情同意（已批准的通俗语言条款；去掉了一周回访，第一天的任务说明按新流程）
    T.push({ type: jsPsychSurveyHtmlForm, preamble: `${CONFIG_WARN}${(() => { try { return localStorage.getItem('lg_d0_done') ? (window.__lgReload ? '<div class="lg-card">你刚才开始过但还没有做完。请从头继续，之前的分组会保留。</div>' : '<div class="lg-card">这台手机之前已经参加过本研究的第一天。同一个人只能参加一次；如果你确定是第一次参加，可以继续。</div>') : ''; } catch (e) { return ''; } })()}<div class="lg-box"><h2>参加之前，请先看这几条</h2>
      <details class="lg-note"><summary><b>研究介绍书（点击展开阅读全文）</b></summary>${INFO_SHEET_HTML}</details>
      <p><b>这是什么。</b>一个关于"引导练习"的研究。今天约 30 分钟：几份问卷、几个"分养分""选一选"的小任务、戴耳机听一段约 11 分钟的引导练习。第二天约 10 分钟问卷（从今天完成 12 小时以后起、一周之内任何时候都可以做）。</p>
      <p><b>练习是什么。</b>先安定呼吸，然后想象自己来到人生中的某一天，在那一天停一会儿，或者回想自己的经历，最后回到现在。这是想象练习，不是治疗。练习有几个版本，你会随机听到一个，第二天结束时会告诉你。</p>
      <p><b>会不会不舒服。</b>可能有一点忧伤或不安，一般很快过去。页面上有一张"资源卡"写着可以怎么做。你随时可以停下来或退出。</p>
      <p><b>退出。</b>随时可以退出，不用说理由。报酬按天发放：做完哪一天、拿到那一天的完成码，就有那一天的报酬；已经得到的报酬不会收回。练习中间不想听了可以退出练习，继续做后面的题，同样算完成。</p>
      <p><b>录音。</b>练习后会请你说一段感受。可以录音，也可以打字，也可以跳过。录音只有研究人员会听，会转成文字并去掉能认出你的信息，原始录音在研究结束后一年内删除。</p>
      <p><b>报酬。</b>今天做完一份，第二天做完一份。第二天还有一小笔钱，你自己决定现在领、一个月后领，还是捐掉，三种金额相同。钱由平台或研究者的微信发给你，数额见任务说明。</p>
      <p><b>微信。</b>请留下你的微信号。研究者会加你，用来提醒你做第二天的任务、发放报酬，以及你有需要时联系你，不做别的用途。微信号和你的作答分开保存。</p>
      <p><b>你的信息。</b>我们会问出生年月、性别、职业、工作年限。数据只用编号，不会出现你的名字。今天结束时你会得到一个 8 位码，请截图，第二天要用。</p>
      <p><b>数据存在哪里。</b>作答经加密传输，保存在研究者私人的、只有研究人员能访问的云端文件夹（开放科学框架 OSF 上不公开的项目，服务器在中国大陆以外）。</p>
      <p><b>文字分析。</b>去掉能认出你的信息之后，你写的文字可能由人工智能语言模型辅助整理；下面单独询问你是否同意，不同意也完全不影响参加。</p></div>`,
      html: `<div class="lg-box lg-form"><label class="lg-radio"><input type="checkbox" name="c1" required> 我已阅读并理解上述说明与《研究介绍书》，我看懂了，自愿参加。</label><label class="lg-radio"><input type="checkbox" name="c2" required> 我知道随时可以退出而无需理由；报酬按完成的天数发放，已得到的报酬不会收回。</label><label class="lg-radio"><input type="checkbox" name="c3" required> 我同意研究者通过我留下的微信联系我（用于次日提醒、发放报酬和必要时的联系）。</label>
      <div class="lg-q"><div>录音（二选一）：</div>${radio('rec', [{ t: '可以录音（也可以打字或跳过）', v: 'voice' }, { t: '只打字，不录音', v: 'text' }])}</div>
      <div class="lg-q"><div>文字分析（二选一）：</div>${radio('ai_ok', [{ t: '同意：去掉可识别信息后，我的文字可由人工智能模型辅助整理', v: 1 }, { t: '不同意：只由研究人员阅读', v: 0 }])}</div>
      <div class="lg-q"><div>你的微信号：</div><input type="text" name="wechat" required placeholder="请填微信号" autocomplete="off"></div>
      <p class="lg-muted">如对本研究有任何问题，请联系${WHO_FOOT}；如有疑问或不满，可书面联系应用心理学大学伦理委员会：psyethics@cuhk.edu.cn。你可以截图保存本页作为副本。</p></div>`,
      button_label: '同意，开始', data: { tag: 'consent' },
      on_finish: (d) => { const r = Object.assign({}, d.response); window.__lgWechat = normWx(r.wechat) || null; lsSet('lg_last_wechat', window.__lgWechat || ''); lsSet('lg_last_rec', r.rec || ''); delete r.wechat; r.wechat_given = !!window.__lgWechat; log('consent', r); d.response = Object.assign({}, r); } });
    // 筛查（批文原题）
    T.push(form('几个筛查问题', `
      <div class="lg-q"><div>你的年龄是否在 22–55 岁之间？</div>${radio('age_ok', [{ t: '是', v: 1 }, { t: '不在此范围', v: 0 }])}</div>
      <div class="lg-q"><div>过去 6 个月，是否有至亲去世？</div>${radio('bereave', [{ t: '否', v: 0 }, { t: '是', v: 1 }])}</div>
      <div class="lg-q"><div>过去 12 个月，你本人是否被诊断出危及生命的疾病？</div>${radio('illness', [{ t: '否', v: 0 }, { t: '是', v: 1 }])}</div>
      <div class="lg-q"><div>目前是否在接受精神科药物治疗、心理治疗或危机干预？</div>${radio('treat', [{ t: '否', v: 0 }, { t: '是', v: 1 }])}</div>
      <div class="lg-q"><div>你的听力是否正常（能听清手机播放的语音）？</div>${radio('hear', [{ t: '正常', v: 0 }, { t: '有听力问题', v: 1 }])}</div>
      <div class="lg-q"><div>今天听练习时你会用：</div>${radio('headphones', [{ t: '耳机', v: 1 }, { t: '没有耳机，在安静的地方用外放', v: 0 }])}</div>
      <div class="lg-q"><div>之前是否参加过"生命花园"这项研究（听过这段引导练习）？</div>${radio('prior', [{ t: '否', v: 0 }, { t: '是', v: 1 }])}</div>
      <div class="lg-q"><div>目前工作状态：</div>${radio('employ', [{ t: '全职在职', v: 1 }, { t: '稳定兼职', v: 2 }, { t: '不在职', v: 0 }])}</div>`, 'screen'));
    const phq = ['做事时提不起劲或没有兴趣', '感到心情低落、沮丧或绝望', '入睡困难、睡不安稳或睡眠过多', '感觉疲倦或没有活力', '食欲不振或吃太多', '觉得自己很糟，或觉得自己很失败，或让自己或家人失望', '对事物专注有困难，例如阅读报纸或看电视时', '动作或说话速度缓慢到别人已经察觉，或正好相反——烦躁或坐立不安、动来动去的情况更胜于平常', '有不如死掉或用某种方式伤害自己的念头'];
    T.push(form('过去两周，你有多少天受到以下问题的困扰？', phq.map((q, i) => `<div class="lg-q"><div>${i + 1}. ${q}</div>${radio('phq' + (i + 1), [{ t: '完全没有', v: 0 }, { t: '有几天', v: 1 }, { t: '一半以上的天数', v: 2 }, { t: '几乎每天', v: 3 }])}</div>`).join(''), 'phq9'));
    T.push({ type: jsPsychCallFunction, func: () => { const s = store.screen, p = store.phq9; const sum = Object.keys(p).filter(k => /^phq\d$/.test(k)).reduce((a, k) => a + (+p[k]), 0); const excl = (+s.age_ok === 0) || +s.bereave === 1 || +s.illness === 1 || +s.treat === 1 || +s.hear === 1 || +s.prior === 1 || +s.employ === 0 || sum >= 15 || +p.phq9 >= 1; log('eligibility', { eligible: !excl, phq_sum: sum, phq9_item9: +p.phq9 }); if (excl) window.__lgWechat = null; } });
    T.push({ timeline: [{ type: jsPsychHtmlButtonResponse, stimulus: () => H(`<h3>谢谢你的参与</h3><p>根据筛查结果，这项研究这次不太适合你参加，你的回答不会被用于分析，你留下的微信号也不会被保存。</p><p>如果你最近心情很低落，或者有伤害自己的念头，请不要一个人扛着：可以拨打全国统一心理援助热线 12356，或联系当地的心理援助机构；情况紧急时请拨打 120 或 110。</p><p>你的完成码：<span class="lg-code">${code('out')}</span></p>`), choices: ['结束'], data: { tag: 'screened_out' }, on_finish: async () => { await pipeSave(`${PID}_${SESSION}_screenout.json`, { pid: PID, screen: store.screen, eligibility: store.eligibility, t: nowISO() }); if (RETURN_URL) location.href = decodeURIComponent(RETURN_URL) + (RETURN_URL.includes('?') ? '&' : '?') + 'code=' + code('out') + '&uid=' + encodeURIComponent(PID); else jsPsych.endExperiment(''); } }], conditional_function: () => !store.eligibility.eligible });
    // 符合条件：微信号存进单独的联系文件（研究数据里没有）
    T.push({ type: jsPsychCallFunction, async: true, func: async (done) => { const ok = await saveContact('consent', window.__lgWechat); log('contact_saved', { ok }); done(); } });
    // 基本信息与少量基线题（批文原题中本研究用得上的部分）
    const yrs = Array.from({ length: 35 }, (_, i) => 1970 + i);
    T.push(form('基本信息', `
      <div class="lg-q"><div>出生年份：</div><select name="birth_year" required><option value="">请选择</option>${yrs.map(y => `<option>${y}</option>`).join('')}</select> 月份：<select name="birth_month" required><option value="">请选择</option>${Array.from({ length: 12 }, (_, i) => `<option>${i + 1}</option>`).join('')}</select></div>
      <div class="lg-q"><div>性别：</div>${radio('sex', [{ t: '男', v: 'M' }, { t: '女', v: 'F' }])}</div>
      <div class="lg-q"><div>第一次全职工作是哪一年开始的？</div><select name="first_job_year" required><option value="">请选择</option>${Array.from({ length: 42 }, (_, i) => `<option>${1985 + i}</option>`).join('')}</select></div>
      <div class="lg-q"><div>职业类别：</div>${radio('occupation', ['企业职员 / 管理', '专业技术人员', '服务业 / 销售', '一线操作 / 物流 / 快递', '机关事业单位', '自由职业 / 创业', '其他'])}</div>
      <div class="lg-q"><div>你觉得自己大概能活到多少岁？（填一个数字）</div><input type="number" name="sle" min="40" max="120" required></div>
      <div class="lg-q"><div>你预计自己大约几岁退休？（填一个数字；还没想过就填一个大概的年龄）</div><input type="number" name="ret_age" min="40" max="80" required></div>
      ${likert('retplan', '我对退休以后的生活已经有了比较具体的打算', '完全不符合', '完全符合')}
      <p><b>小时候（12 岁以前）的家庭情况：</b></p>${likert('ses1', '我家比大多数同龄人家里有钱', '完全不符合', '完全符合')}${likert('ses2', '我在一个相对富裕的社区长大', '完全不符合', '完全符合')}${likert('ses3', '和同龄人比，我小时候不缺钱花', '完全不符合', '完全符合')}
      ${likert('fsc1', '五年后的我和现在的我，本质上是同一个人', '完全不同意', '完全同意')}${likert('fsc2', '我能清楚地想象五年后的自己', '完全不同意', '完全同意')}
      ${likert('unpred', '未来一年，我的工作和生活会怎么样，很难预料', '完全不符合', '完全符合')}${likert('ctrl', '未来一年的生活会怎么样，我有很大的掌控力', '完全不符合', '完全符合')}
      <div class="lg-q"><div>你以前有没有做过冥想或类似的练习？</div>${radio('med_exp', [{ t: '从来没有', v: 0 }, { t: '试过几次', v: 1 }, { t: '有一段时间规律地做过', v: 2 }, { t: '一直在做', v: 3 }])}</div>
      <div class="lg-q"><div>过去四周做过几天？</div><input type="number" name="med_days" min="0" max="28" required></div>`, 'baseline',
      Object.assign(guard((f) => { const by = +f.querySelector('[name=birth_year]').value, fj = +f.querySelector('[name=first_job_year]').value, sle = +f.querySelector('[name=sle]').value, ra = +f.querySelector('[name=ret_age]').value, age = new Date().getFullYear() - by; return (fj < by + 14 || fj > new Date().getFullYear()) ? '"第一次全职工作年份"看起来不对：应晚于出生年份 14 年以上。' : (sle <= age ? '"能活到多少岁"应大于你现在的年龄。' : (ra <= age ? '"预计退休年龄"应大于你现在的年龄。' : '')); }),
        { on_finish: (d) => { const r = d.response; r.tenure_years = (new Date().getFullYear()) - (+r.first_job_year); log('baseline', r); } })));
    // 三位重要之人
    T.push(form('三位对你重要的人', `<p>请写下三位对你来说重要的人的称呼（比如"妈妈""小李"），并选择关系类别。今天和第二天的花园任务都会用到。</p>
      ${[1, 2, 3].map(i => `<div class="lg-q"><div>第 ${i} 位：</div><input type="text" name="p${i}" required placeholder="称呼"> <select name="p${i}_rel" required><option value="">关系</option><option>家人</option><option>伴侣</option><option>朋友</option><option>同事</option><option>其他</option></select></div>`).join('')}`, 'people', { on_finish: (d) => { log('people', d.response); window.__people = [d.response.p1, d.response.p2, d.response.p3]; lsSet(LS('people'), JSON.stringify(window.__people)); lsSet('lg_last_people', JSON.stringify(window.__people)); } }));
    // 练习前测量
    T.push(garden('garden_pre'));
    ddTrials(DD_PRE, 'dd_pre').forEach(x => T.push(x));
    T.push(emotionTrial('emotion_pre'));
    // 试听
    T.push({ timeline: [
      { type: jsPsychHtmlButtonResponse, stimulus: H(`<h3>试听</h3><p>请戴好耳机，点击播放，确认能听清、音量合适。</p><audio id="lg-check" src="${CFG.AUDIO.CHECK}" controls></audio>`), choices: ['能听清，继续', '听不清 / 放不出来'], data: { tag: 'soundcheck' }, on_finish: (d) => { log('soundcheck', { ok: d.response === 0 }); ev('soundcheck', { ok: d.response === 0 }); } },
      { timeline: [{ type: jsPsychHtmlButtonResponse, stimulus: H(`<h3>请检查设备</h3><p>请确认耳机已连接、手机没有静音，然后返回重试。如果仍然无法播放，请截图本页，在微信上告诉研究者。</p>`), choices: ['返回重试'], data: { tag: 'soundcheck_fail' } }], conditional_function: () => !store.soundcheck.ok }
    ], loop_function: () => !store.soundcheck.ok });
    // 随机分组（服务器顺序发号，映射到固定区组）
    T.push({ type: jsPsychCallFunction, async: true, func: async (done) => { const prev = lsGet(LS('cell')); const a = prev ? { cell: prev, cond: null, source: 'reuse-after-reload' } : await assignCell(); log('assignment', { cell: a.cell, cond: a.cond, source: a.source, reload: !!window.__lgReload });
      pipeSave(`${PID}_d0_assign${prev ? '_reload_' + Date.now().toString(36) : ''}.json`, { pid: PID, session: 'd0_assign', t: nowISO(), cell: a.cell, cond: a.cond, source: a.source, reload: !!window.__lgReload, design: store.design, baseline: store.baseline, garden_pre: store.garden_pre, dd_pre: store.dd_pre });
      lsSet('lg_d0_done', nowISO()); window.__cell = a.cell; try { const pre = new Audio(); pre.preload = 'auto'; pre.src = CFG.AUDIO[a.cell]; window.__lgPre = pre; } catch (e) { } lsSet(LS('cell'), a.cell); done(); } });
    // 音频前提示与播放（无进度条、不可拖动；可暂停或退出练习）
    T.push({ type: jsPsychHtmlButtonResponse, stimulus: H(`<h3>引导练习（约 11 分钟）</h3><p>接下来你会听到一段引导练习。请在安静、不会被打扰的地方，戴好耳机。你不需要相信任何说法，也不需要得到某种感受；任何时候都可以睁眼、暂停，或点"退出这次练习"继续后面的题。</p><div class="lg-card">${CFG.RESOURCE_CARD}</div>`), choices: ['开始练习', '我不想做这次练习'], data: { tag: 'pre_audio' }, on_finish: (d) => { log('pre_audio', { start: d.response === 0 }); } });
    T.push({ timeline: [{ type: jsPsychHtmlButtonResponse, stimulus: () => H(`<h3>引导练习</h3><p id="lg-audio-msg">点击下方按钮开始播放，播放完成后会出现"继续"。</p><audio id="lg-audio" src="${CFG.AUDIO[window.__cell]}" preload="auto"></audio><div class="lg-breath"><div class="lg-breath-ring"></div><div class="lg-breath-core"><span id="lg-state">未开始</span></div></div><div class="lg-player"><button type="button" id="lg-play">播放</button> <button type="button" id="lg-pause">暂停</button></div><p class="lg-muted">没有进度条，不能拖动；可以暂停，也可以退出这次练习。</p><p id="lg-stall" style="display:none;text-align:center"><button type="button" id="lg-reload">声音卡住了？点这里重新加载（从刚才的位置继续）</button></p>`), choices: ['继续', '退出这次练习'], data: { tag: 'audio' }, on_load: () => {
        const a = document.getElementById('lg-audio'); const btns = document.querySelectorAll('.jspsych-btn'); btns[0].disabled = true; const secs = new Set(); let lastT = 0; const t0 = Date.now(); let plays = 0, pauses = 0;
        document.getElementById('lg-play').onclick = () => { a.play(); plays++; document.getElementById('lg-state').textContent = '正在播放'; document.querySelector('.lg-breath').classList.add('on'); ev('audio_play'); };
        document.getElementById('lg-pause').onclick = () => { a.pause(); pauses++; document.getElementById('lg-state').textContent = '已暂停'; document.querySelector('.lg-breath').classList.remove('on'); ev('audio_pause'); };
        a.addEventListener('timeupdate', () => { const c = Math.floor(a.currentTime); if (c > lastT + 2) { a.currentTime = lastT; } else { secs.add(c); lastT = c; } });
        a.addEventListener('ended', () => { btns[0].disabled = false; document.querySelector('.lg-breath').classList.remove('on'); document.getElementById('lg-state').textContent = '播放完成'; document.getElementById('lg-audio-msg').textContent = '练习结束，请点"继续"。'; ev('audio_ended'); });
        let reloads = 0, stallTimer = null; const stallBox = document.getElementById('lg-stall');
        const showStall = () => { if (!a.ended) stallBox.style.display = 'block'; };
        const armStall = () => { clearTimeout(stallTimer); stallTimer = setTimeout(showStall, 6000); };
        a.addEventListener('waiting', () => { if (!a.paused) armStall(); });
        a.addEventListener('stalled', () => { if (!a.paused) armStall(); });
        a.addEventListener('error', showStall);
        a.addEventListener('playing', () => { clearTimeout(stallTimer); stallBox.style.display = 'none'; });
        a.addEventListener('timeupdate', () => { clearTimeout(stallTimer); });
        document.getElementById('lg-reload').onclick = () => { const pos = lastT; reloads++; ev('audio_reload', { pos }); stallBox.style.display = 'none'; document.getElementById('lg-state').textContent = '正在重新加载…'; a.load(); a.addEventListener('loadedmetadata', function once() { a.removeEventListener('loadedmetadata', once); try { a.currentTime = pos; } catch (e) { } a.play().then(() => { document.getElementById('lg-state').textContent = '正在播放'; document.querySelector('.lg-breath').classList.add('on'); }).catch(() => { document.getElementById('lg-state').textContent = '请点"播放"继续'; }); }); };
        document.addEventListener('visibilitychange', () => ev('visibility', { hidden: document.hidden }));
        window.__lgAudio = () => ({ unique_sec: secs.size, duration: a.duration || null, plays, pauses, reloads, wall_sec: Math.round((Date.now() - t0) / 1000) });
      }, on_finish: (d) => { const s = window.__lgAudio(); s.completed = d.response === 0; Object.assign(d, s); log('audio', s); } }], conditional_function: () => store.pre_audio.start });
    T.push({ timeline: [{ type: jsPsychCallFunction, func: () => { log('audio', { completed: false, unique_sec: 0, declined: true }); } }], conditional_function: () => !store.pre_audio.start });
    // 情绪②：页首对所有人显示资源卡
    T.push(emotionTrial('emotion_post', `<div class="lg-card">刚才的练习结束了。${CFG.RESOURCE_CARD}</div>`));
    // 安全判断（伦理方案的分级规则）：标记立即单独上传；提示文字在两项主要结局之后显示
    T.push({ type: jsPsychCallFunction, func: () => { const pre = store.emotion_pre, post = store.emotion_post; const un = +post.e_unease, sad = +post.e_sad, sadPre = +pre.e_sad; const kw = CFG.SAFETY_KEYWORDS.some(k => (post.free || '').includes(k)); const contact = un >= CFG.SAFETY_UNEASE_THRESHOLD || kw; const checkin = (sad - sadPre) >= CFG.SAFETY_SAD_RISE; log('safety', { flag_contact: contact, flag_checkin: checkin, unease: un, sad, sadPre, keyword: kw }); window.__safety = { contact, checkin }; if (contact || checkin) pipeSave(`${PID}_d0_safety.json`, { pid: PID, session: 'd0_safety', t: nowISO(), safety: store.safety }); } });
    // 两项主要结局：花园②与延迟折扣（另一套），先后随机；做完立即单独上传
    const postGarden = () => garden('garden_post');
    const postDD = () => ddTrials(DD_POST, 'dd_post', `接下来是 ${(CFG.DD_SETS && CFG.DD_SETS[DD_POST] ? CFG.DD_SETS[DD_POST] : CFG.DD_TEST_ITEMS).length} 道类似的选择题，题目和刚才的不一样`);
    T.push({ timeline: [postGarden()], conditional_function: () => DES.post_order === 'garden_first' });
    postDD().forEach(x => T.push(x));
    T.push({ timeline: [postGarden()], conditional_function: () => DES.post_order === 'dd_first' });
    T.push({ type: jsPsychCallFunction, async: true, func: async (done) => { const ok = await pipeSave(`${PID}_d0_primary.json`, { pid: PID, session: 'd0_primary', t: nowISO(), cell: window.__cell, design: store.design, garden_pre: store.garden_pre, garden_post: store.garden_post, dd_pre: store.dd_pre, dd_post: store.dd_post, emotion_pre: store.emotion_pre, emotion_post: store.emotion_post, audio: store.audio }); log('primary_saved', { ok }); done(); } });
    T.push({ timeline: [{ type: jsPsychHtmlButtonResponse, stimulus: () => H(`<h3>谢谢你的回答</h3>${window.__safety.contact ? `<p>你的回答显示此刻可能有些不适。研究人员会在 24 小时内通过微信联系你。你也可以随时在微信上告诉研究者，或发邮件到 ${CFG.CONTACT_EMAIL}。</p>` : ''}<p>有些人在这样的练习后会有一点忧伤或不安，这很常见，通常很快过去。${window.__safety.checkin ? '明天研究者会在微信上问候你一下。' : ''}</p><div class="lg-card">${CFG.RESOURCE_CARD}</div>`), choices: ['继续'], data: { tag: 'safety_msg' } }], conditional_function: () => window.__safety.contact || window.__safety.checkin });
    // 次要结局：1000 元分配
    T.push(hfTrial('hf_post'));
    // 练习体验与材料评定
    T.push(withTouched(form('关于刚才的练习（一）', `<p>下面每一项，请按刚才的练习来回答（0–10）：</p>
      ${slider0_10('mr_present', '练习中，我感觉自己真的身处那一天', '完全不符合', '完全符合')}${slider0_10('mr_firstperson', '我是用自己的眼睛在看，而不是像旁观者一样看着自己', '完全不符合', '完全符合')}
      ${slider0_10('mr_backtoday', '练习中，我在心里经历了从那一天回到今天的过程', '完全不符合', '完全符合')}${slider0_10('mr_clear_today', '练习结束时，我对自己今天的生活看得更清楚了', '完全不符合', '完全符合')}
      ${slider0_10('mr_after', '练习中，我想到了"那一天之后"的生活', '完全没有', '想了很多')}${slider0_10('mr_distance', '那一天离现在，感觉有多远', '很近', '很远')}
      ${slider0_10('mr_relevance', '那一天和我自己的生活有多相关', '毫不相关', '非常相关')}${slider0_10('mr_valence', '练习带给我的感受整体上', '很不愉快', '很愉快')}
      ${slider0_10('mr_arousal', '练习中我的情绪起伏有多大', '很平静', '很强烈')}${slider0_10('mr_control', '练习中，我能控制脑海里的画面', '完全不能', '完全能')}
      ${slider0_10('mr_ending', '练习中，那一天让我感到是一种结束', '完全没有', '非常强烈')}${slider0_10('mr_operable', '那一天让我想清楚了接下来具体可以做什么', '完全没有', '非常清楚')}`, 'ratings', { on_finish: (d) => { log('ratings', Object.assign({ touched: window.__lgTouched || {} }, d.response)); } })));
    T.push(withTouched(form('关于刚才的练习（二）', `
      <div class="lg-q"><div>此刻，"十年"在你感觉里有多长？（1 = 非常短，100 = 非常长）</div><input type="number" name="tp_ten" min="1" max="100" required></div>
      ${slider0_10('tp_pass', '此刻你觉得时间流逝得有多快', '慢', '快')}${slider0_10('engage', '你有多投入')}${slider0_10('wander', '走神的程度')}${slider0_10('return', '走神后回到声音的容易程度', '很难', '很容易')}${slider0_10('vivid', '画面的生动程度')}
      <div class="lg-q"><div>练习时你是闭着眼睛的吗？</div>${radio('eyes', ['大部分时间闭着', '一半一半', '大部分时间睁着'])}</div>
      <div class="lg-q"><div>练习一开始，引导你注意的是：</div>${radio('mem1', ['身体与椅子的接触', '房间里的光线', '一段音乐', '记不清'])}</div>
      <div class="lg-q"><div>练习最后，引导你做的是：</div>${radio('mem2', ['回到房间、动一动肩膀和手指', '写下三件事', '深呼吸十次', '记不清'])}</div>`, 'experience', { on_finish: (d) => { log('experience', Object.assign({ touched: window.__lgTouched || {} }, d.response)); } })));
    T.push(form('此刻你的感觉', `${likert('p_scar1', '此刻，我觉得自己剩下的时间不多了', '完全不符合', '完全符合')}${likert('p_scar2', '此刻，我觉得时间很紧、来不及做想做的事', '完全不符合', '完全符合')}${likert('p_unpred', '此刻，我觉得人生中的事情很难预料', '完全不符合', '完全符合')}${likert('p_inev', '此刻，我清楚地意识到生命终有尽头', '完全不符合', '完全符合')}
      ${likert('fsc1_post', '五年后的我和现在的我，本质上是同一个人', '完全不同意', '完全同意')}${likert('fsc2_post', '我能清楚地想象五年后的自己', '完全不同意', '完全同意')}`, 'premises'));
    T.push(withTouched(form('关于刚才的练习（三）', `
      <div class="lg-q"><div>刚才的练习中，引导你想象来到的是：</div>${radio('mc_ref', ['生命的最后一天', '退休的那一天', '毕业那天', '记不清'])}</div>
      <div class="lg-q"><div>来到那一天之后，引导你做的是：</div>${radio('mc_proc', ['从那一天一年一年往回走，回到今天', '留在那一天里，注意周围的细节', '想象十年后的自己', '记不清'])}</div>
      ${slider0_10('mc_walk', '你在多大程度上真的沿着年份"走"回了今天', '完全没有', '完全做到')}
      ${slider0_10('mc_death', '练习中，你在多大程度上想到了自己的死亡', '完全没有', '想了很多')}`, 'manip', { on_finish: (d) => { log('manip', Object.assign({ touched: window.__lgTouched || {} }, d.response)); } })));
    // 语音或文字记录（可跳过）
    diaryTrials('diary_d0', '刚才的练习让你想到了什么、有什么感受？').forEach(x => T.push(x));
    // 自由时间（行为结局）：不影响报酬；写的内容只保存在研究数据里，不会发送
    T.push({ type: jsPsychHtmlButtonResponse, stimulus: H(`<h3>最后几分钟（可选）</h3><p>今天的题目已经做完了。下面怎么选，<b>都不影响你的报酬</b>。</p><p>如果你愿意，可以再花几分钟写几句话。写的内容只保存在研究数据里，<b>不会发送给任何人</b>。</p>`),
      choices: ['给一位重要的人写几句话', '给五年后的自己写几句话', '不写了，进入最后一页'], data: { tag: 'free_choice' }, on_finish: (d) => { log('free_choice', { choice: ['person', 'future', 'skip'][d.response], rt: d.rt }); } });
    T.push({ timeline: [{ type: jsPsychSurveyHtmlForm, preamble: '<div class="lg-box"><h3>写几句话</h3></div>',
      html: () => { const ch = (store.free_choice || {}).choice; return `<div class="lg-box lg-form">${ch === 'person' ? `<div class="lg-q"><div>写给谁：</div><select name="to">${[1, 2, 3].map(i => `<option value="P${i}">${esc(people()[i - 1])}</option>`).join('')}<option value="other">另一位重要的人</option></select></div>` : ''}<div class="lg-q"><div>${ch === 'person' ? '想对 TA 说的话：' : '写给五年后的自己：'}</div><textarea name="letter" rows="7" placeholder="写多少都可以；写完点下面的按钮"></textarea></div></div>`; },
      button_label: '写好了', data: { tag: 'free_write' }, on_load: () => { window.__lgWriteT0 = performance.now(); },
      on_finish: (d) => { const txt = d.response.letter || ''; log('free_write', { to: (store.free_choice || {}).choice === 'person' ? (d.response.to || 'P1') : 'F', letter: txt, chars: txt.replace(/\s/g, '').length, sec: Math.round((performance.now() - (window.__lgWriteT0 || performance.now())) / 1000) }); } }],
      conditional_function: () => store.free_choice && store.free_choice.choice !== 'skip' });
    T.push(form('最后一个问题', `<div class="lg-q"><div>你觉得这项研究想了解什么？（一句话）</div><input type="text" name="purpose" required></div>`, 'purpose'));
    T.push(btn(`<h3>今天的任务完成了，谢谢你</h3><p><b>第二天的任务约 10 分钟：在你完成今天的部分 12 小时以后、一周之内任何时候都可以做，越早越好——请睡一觉之后再来。</b>研究者会通过微信提醒你；回来时请输入今天结束时显示的 8 位码（或你今天留下的微信号）。</p><p>刚才的内容是一种想象练习，不是对你生活的判断，也不是对未来的预言。</p><div class="lg-card">${CFG.RESOURCE_CARD}</div>`, { choices: ['保存并结束'] }));
    T.push(finishTrial('d0'));
  }

  // ---------- 第二天：连接码或微信号（二选一，批文原样）----------
  function codeEntryTrials() {
    const last = lsGet('lg_last_pair') || ''; const lastWx = lsGet('lg_last_wechat') || '';
    const entry = { type: jsPsychSurveyHtmlForm, preamble: `<div class="lg-box"><h3>请输入你的连接码</h3><p>就是第一天结束时页面上显示、请你截图保存的那个 8 位码（也是第一天的完成码）。大小写不限，可带横线。</p></div>`,
      html: `<div class="lg-box lg-form"><input type="text" name="code" value="${last ? fmt(last) : ''}" autocomplete="off" style="font-size:22px;letter-spacing:2px;width:100%;box-sizing:border-box;padding:8px" placeholder="例如 K7M3-PX2Q"><p class="lg-muted">找不到码？可以改填你第一天留下的<b>微信号</b>（两项填一项即可）：</p><input type="text" name="wechat" value="${esc(lastWx)}" autocomplete="off" style="font-size:18px;width:100%;box-sizing:border-box;padding:8px" placeholder="第一天填写的微信号"></div>`, button_label: '继续', data: { tag: 'pair_entry' },
      on_finish: (d) => { const rawCode = (d.response.code || '').trim(); const wx = normWx(d.response.wechat); const r = rawCode ? parseCode(rawCode) : { ok: false, reason: 'empty' }; let gap = null; if (r.ok) { gap = ((hoursNow() - r.hours) % 1024 + 1024) % 1024; } const okAny = r.ok || wx.length >= 3; window.__lgWechatD1 = (!r.ok && wx) ? wx : null; log('pair', { ok: okAny, code_ok: r.ok, reason: r.ok ? null : (r.reason || null), code: r.ok ? r.code : null, wechat_given: !r.ok && !!wx, gap_hours: gap, gap_over_max: gap !== null && gap > CFG.MAX_GAP_DAYS * 24 }); d.response = { code: rawCode }; if (r.ok) { PAIR = r.code; } } };
    const bad = { timeline: [{ type: jsPsychHtmlButtonResponse, stimulus: () => H(`<h3>还没能对上</h3><p>${store.pair.reason === 'format' ? '连接码应为 8 位（字母和数字，不含 0、O、1、I）；也可以只填第一天留下的微信号。' : (store.pair.reason === 'check' ? '这个码有一位输错了，请对照截图再输一次；或者只填第一天留下的微信号。' : '请填连接码，或者第一天留下的微信号（填一项即可）。')}</p>`), choices: ['重新输入'], data: { tag: 'pair_bad' } }], conditional_function: () => !store.pair.ok };
    const loop = { timeline: [entry, bad], loop_function: () => !store.pair.ok };
    const early = { timeline: [{ type: jsPsychHtmlButtonResponse, stimulus: () => H(`<h3>还没到时间</h3><p>第二天的任务需要在第一天完成至少 ${CFG.MIN_GAP_HOURS} 小时之后进行——请睡一觉之后再来（一周之内任何时候都可以）。你的连接码仍然有效。</p>`), choices: [], trial_duration: 999999, data: { tag: 'pair_early' } }], conditional_function: () => store.pair.gap_hours !== null && store.pair.gap_hours < CFG.MIN_GAP_HOURS };
    const saveWx = { type: jsPsychCallFunction, async: true, func: async (done) => { if (window.__lgWechatD1) await saveContact('d1entry', window.__lgWechatD1); done(); } };
    return [loop, early, saveWx];
  }
  const peopleReentry = (tag) => form('三位重要的人', `<p>请填写你第一天写下的三位重要之人的称呼（尽量一致，顺序也一样）。</p>${[1, 2, 3].map(i => `<div class="lg-q"><div>第 ${i} 位：</div><input type="text" name="p${i}" required></div>`).join('')}`, tag, { on_load: () => { try { const pp = JSON.parse(lsGet(LS('people')) || lsGet('lg_last_people') || 'null'); if (pp) [1, 2, 3].forEach(i => { const el = document.querySelector(`input[name=p${i}]`); if (el) el.value = pp[i - 1] || ''; }); } catch (e) { } }, on_finish: (d) => { log(tag, d.response); window.__people = [d.response.p1, d.response.p2, d.response.p3]; } });

  // ============================================================ 第二天
  function buildD1() {
    window.__lgStart = nowISO(); ev('d1_start');
    codeEntryTrials().forEach(x => T.push(x));
    T.push(peopleReentry('people_d1'));
    T.push(emotionTrial('emotion_d1'));
    T.push(garden('garden_d1', { after: async () => { const ok = await pipeSave(`${PID}_d1_garden.json`, { pid: PID, pair_code: PAIR, session: 'd1_garden', t: nowISO(), garden_d1: store.garden_d1, emotion_d1: store.emotion_d1, gap_hours_from_code: (store.pair || {}).gap_hours }); store.garden_d1.saved_alone = ok; } }));
    ddTrials('C', 'dd_d1', '接下来是几道选择题，题目和昨天的不一样').forEach(x => T.push(x));
    T.push(form('小额报酬的领取方式', `<p>除了任务报酬，你还会得到一笔小额报酬（三种方式金额相同）。请选择领取方式：</p>${radio('pay_choice', [{ t: '现在领取', v: 'now' }, { t: '一个月后领取（30 天后发放）', v: 'later' }, { t: '捐给公益项目（由研究团队统一捐出）', v: 'donate' }])}`, 'pay_choice'));
    T.push(withTouched(form('几个小问题', `
      <div class="lg-q"><div>如果现在重新选三位重要的人，你会换人吗？</div>${radio('switch', ['不会', '会换一位', '会换两位或更多'])}</div>
      ${slider0_10('recall', '今天你想起昨天练习内容的程度', '完全没想起', '经常想起')}
      <div class="lg-q"><div>今天有没有自己做过类似的练习？</div>${radio('self_practice', [{ t: '没有', v: 0 }, { t: '有', v: 1 }])}</div>`, 'recall', { on_finish: (d) => { log('recall', Object.assign({ touched: window.__lgTouched || {} }, d.response)); } })));
    // 第二天能否录音：沿用第一天知情同意页的选择（同一台设备上记得）；不知道时只提供打字或跳过
    T.push({ type: jsPsychCallFunction, func: () => { store.d1_rec_ok = (lsGet('lg_last_rec') === 'voice'); } });
    diaryTrials('diary_d1', '过去一天有没有想起昨天的练习？想起时是什么感受，你怎么处理这种感受？').forEach(x => T.push(x));
    T.push(btn(`<h3>第二天的任务完成了，谢谢你</h3><p>现在可以告诉你：练习有四个版本，只在中间几分钟不同——想象来到的那一天（生命的最后一天，或退休的那一天），以及在那里做什么（从那一天一年一年回望、走回今天，并带着那一天的眼光看看今天的生活；或者一直留在那一天里）。你听到的是随机分配的一个版本。我们想了解这两种成分各自怎样影响人们对时间、精力和钱的安排。</p><p>刚才的内容是一种想象练习，不是对你生活的判断。如有任何问题，或想删除你的数据，请在微信上告诉研究者，或发邮件到 ${CFG.CONTACT_EMAIL}。</p><div class="lg-card">${CFG.RESOURCE_CARD}</div>`, { choices: ['保存并结束'] }));
    T.push(finishTrial('d1'));
  }

  // ============================================================ 入口
  T.push({ type: jsPsychPreload, audio: SESSION === 'd0' ? [CFG.AUDIO.CHECK] : [], message: '正在加载…', show_progress_bar: false, continue_after_error: true });
  if (SESSION === 'd1') buildD1(); else buildD0();
  jsPsych.run(T);
})();
