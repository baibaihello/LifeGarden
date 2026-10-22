/* 时间花园人格：第一天结束页的小礼物。只用练习之前的回答（花园、选择题、关于五年后的两题、掌控感、此刻的活力），
   与分组无关，不用心情问卷。window.LGPortrait(data) 返回一段 HTML。
   data = { shares:{P1,P2,P3,S,F}, people:[3], dd_now, dd_n, fsc1, fsc2, ctrl, pa } */
(function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  let uid = 0;

  const CSS = `
  .por { --ink:#2B2B2B; text-align:left; margin:16px 0 6px; border-radius:26px; overflow:hidden; background:#FFFDF6; color:var(--ink); border:3px solid var(--ink); box-shadow:6px 6px 0 rgba(0,0,0,.35); font-size:15px; line-height:1.7; }
  .por b { color:inherit; }
  .por-hero { position:relative; padding:16px 16px 14px; background:linear-gradient(160deg,var(--bg1),var(--bg2)); text-align:center; border-bottom:3px solid var(--ink); }
  .por-kicker { display:flex; justify-content:space-between; align-items:center; font-size:13px; font-weight:800; letter-spacing:1px; }
  .por-chip { color:#fff; background:var(--ink); border-radius:999px; padding:3px 12px; letter-spacing:3px; font-family:Consolas,Menlo,monospace; font-size:15px; }
  .por-art { width:min(250px,72vw); height:auto; display:block; margin:2px auto -4px; }
  .por-name { font-size:34px; font-weight:900; margin:0; letter-spacing:2px; line-height:1.25; }
  .por-title { display:inline-block; margin-top:4px; font-size:15px; font-weight:800; background:#fff; border:2.5px solid var(--ink); border-radius:999px; padding:1px 14px; box-shadow:3px 3px 0 var(--ink); }
  .por-tags { margin-top:12px; display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
  .por-tags span { font-size:13px; font-weight:700; background:rgba(255,255,255,.7); border:2px solid var(--ink); border-radius:10px; padding:0 8px; }
  .por-sec { padding:14px 16px; border-bottom:2px dashed #D9D2C0; }
  .por-h { font-size:13px; font-weight:900; letter-spacing:2px; margin:0 0 8px; color:#6B6455; }
  .por-code { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
  .por-code div { text-align:center; background:var(--soft); border:2.5px solid var(--ink); border-radius:14px; padding:4px 2px 6px; }
  .por-code i { display:block; font-style:normal; font-family:Consolas,Menlo,monospace; font-size:26px; font-weight:900; line-height:1.2; }
  .por-code small { font-size:11.5px; font-weight:700; }
  .por-quote { position:relative; background:#fff; border:2.5px solid var(--ink); border-radius:18px; padding:8px 14px; font-size:18px; font-weight:900; text-align:center; margin:4px 6px 8px; }
  .por-quote:after { content:''; position:absolute; left:28px; bottom:-12px; border:10px solid transparent; border-top-color:var(--ink); border-bottom:0; }
  .por-axis { margin:4px 0 12px; }
  .por-axis-ends { display:flex; justify-content:space-between; font-size:13px; font-weight:800; }
  .por-track { position:relative; height:12px; border-radius:8px; margin:6px 0 2px; background:#EFE9DA; border:2px solid var(--ink); }
  .por-track i { position:absolute; top:50%; width:24px; height:24px; margin:-12px 0 0 -12px; border-radius:50%; background:var(--acc); border:3px solid var(--ink); }
  .por-track b { position:absolute; left:50%; top:1px; width:2px; height:6px; background:#B9B09B; }
  .por-li { display:flex; gap:8px; margin:6px 0; line-height:1.6; }
  .por-li em { flex:0 0 22px; height:22px; border-radius:7px; background:var(--soft); border:2px solid var(--ink); font-style:normal; font-weight:900; font-size:12px; text-align:center; line-height:18px; margin-top:1px; }
  .por-two { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  @media (max-width:420px){ .por-two { grid-template-columns:1fr; } }
  .por-mini { background:var(--soft); border:2.5px solid var(--ink); border-radius:16px; padding:8px 12px; line-height:1.6; }
  .por-mini b { display:block; font-size:13px; letter-spacing:1px; font-weight:900; }
  .por-meter { display:grid; grid-template-columns:1fr auto; align-items:center; gap:8px; margin:5px 0; font-weight:600; font-size:14px; }
  .por-dots { display:flex; gap:3px; }
  .por-dots span { width:13px; height:13px; border-radius:50%; border:2px solid var(--ink); background:#fff; }
  .por-dots span.on { background:var(--acc); }
  .por-fact { margin:4px 0; }
  .por-fact em { font-style:normal; font-weight:900; background:linear-gradient(transparent 55%, var(--soft) 55%); padding:0 2px; }
  .por-mate { display:flex; align-items:center; gap:10px; }
  .por-mate svg { width:64px; height:64px; flex:0 0 64px; }
  .por-mate-all { flex-direction:column; align-items:flex-start; gap:4px; }
  .por-mates { display:flex; gap:4px; flex:0 0 auto; }
  .por-mates svg { width:44px; height:44px; flex:0 0 44px; }
  .por-foot { padding:10px 16px 14px; font-size:12px; color:#857D6B; line-height:1.6; background:#FBF6EA; }
  `;

  // ---------- 角色插画（原创，内联 SVG，贴纸风）----------
  const O = '#2B2B2B';
  const eyes = (x1, x2, y, r = 6) => [x1, x2].map((x) => `<ellipse cx="${x}" cy="${y}" rx="${r - 0.5}" ry="${r + 1}" fill="${O}"/><circle cx="${x - 1.6}" cy="${y - 2.6}" r="${r / 3}" fill="#fff"/>`).join('');
  const blush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="7" ry="4" fill="#FF8FA3" opacity=".75"/><ellipse cx="${x2}" cy="${y}" rx="7" ry="4" fill="#FF8FA3" opacity=".75"/>`;
  const star = (x, y, s, c = '#fff') => `<path d="M${x} ${y - s} Q${x + s * .18} ${y - s * .18} ${x + s} ${y} Q${x + s * .18} ${y + s * .18} ${x} ${y + s} Q${x - s * .18} ${y + s * .18} ${x - s} ${y} Q${x - s * .18} ${y - s * .18} ${x} ${y - s}Z" fill="${c}"/>`;
  const shadow = `<ellipse cx="120" cy="226" rx="56" ry="7" fill="#000" opacity=".13"/>`;
  const heart = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 7 C-13 -1 -10 -12 -3.5 -11.5 C-1.5 -11.3 0 -9.5 0 -8 C0 -9.5 1.5 -11.3 3.5 -11.5 C10 -12 13 -1 0 7Z" fill="${c}" stroke="${O}" stroke-width="${(2.6 / s).toFixed(2)}" stroke-linejoin="round"/>`;
  const arm = (d, c) => `<path d="${d}" stroke="${O}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`;

  const ART = {
    sunflower: () => {
      let petals = '';
      for (let i = 0; i < 12; i++) petals += `<ellipse cx="120" cy="46" rx="15" ry="27" fill="${i % 2 ? '#FFD45E' : '#FFC23D'}" stroke="${O}" stroke-width="3" transform="rotate(${i * 30} 120 92)"/>`;
      let seeds = '';
      for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; seeds += `<circle cx="${(120 + 35 * Math.cos(a)).toFixed(1)}" cy="${(92 + 35 * Math.sin(a)).toFixed(1)}" r="2" fill="#C26B25"/>`; }
      return `<svg class="por-art" viewBox="0 0 240 240" aria-hidden="true">${shadow}
        ${star(38, 48, 9)}${star(206, 64, 7)}${star(204, 168, 6)}
        <rect x="30" y="120" width="9" height="5" rx="2" fill="#6C9BFF" transform="rotate(30 34 122)"/><rect x="196" y="104" width="9" height="5" rx="2" fill="#FF6FA5" transform="rotate(-25 200 106)"/><circle cx="48" cy="170" r="3.5" fill="#FF6FA5"/>
        <path d="M104 160 C82 152 70 134 72 118 C90 120 104 138 104 160Z" fill="#7BD86D" stroke="${O}" stroke-width="3.2" stroke-linejoin="round"/>
        <rect x="101" y="138" width="38" height="66" rx="19" fill="#6CCB5F" stroke="${O}" stroke-width="3.5"/>
        <ellipse cx="110" cy="208" rx="12" ry="7" fill="#4FAE48" stroke="${O}" stroke-width="3"/><ellipse cx="131" cy="208" rx="12" ry="7" fill="#4FAE48" stroke="${O}" stroke-width="3"/>
        <path d="M137 164 C152 160 162 164 168 172 C154 178 142 174 137 164Z" fill="#7BD86D" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
        <line x1="179" y1="150" x2="188" y2="126" stroke="${O}" stroke-width="8" stroke-linecap="round"/><line x1="179" y1="150" x2="188" y2="126" stroke="#FF6FA5" stroke-width="4" stroke-linecap="round"/>
        <path d="M163 155 L193 155 L188 194 L168 194Z" fill="#FFF6E8"/><path d="M165 168 L191 168 L188 194 L168 194Z" fill="#D9A06C"/>
        <circle cx="172" cy="188" r="2.8" fill="#3B2A20"/><circle cx="179" cy="190" r="2.8" fill="#3B2A20"/><circle cx="185" cy="186" r="2.8" fill="#3B2A20"/><circle cx="176" cy="182" r="2.8" fill="#3B2A20"/>
        <path d="M163 155 L193 155 L188 194 L168 194Z" fill="none" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><rect x="160" y="149" width="36" height="8" rx="4" fill="#FFD1E0" stroke="${O}" stroke-width="3"/>
        ${petals}
        <circle cx="120" cy="92" r="42" fill="#EE9C52" stroke="${O}" stroke-width="3.5"/>${seeds}
        ${eyes(105, 135, 90)}${blush(96, 144, 104)}
        <path d="M109 103 Q120 119 131 103Z" fill="#7A2E1F" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><path d="M114 109 Q120 114 126 109 Q120 116 114 109Z" fill="#FF7B8A"/>
        <g transform="rotate(-8 120 56)">${heart(103, 57, 1.25, '#FF6FA5')}${heart(137, 57, 1.25, '#FF6FA5')}<path d="M112 54 Q120 49 128 54" stroke="${O}" stroke-width="3" fill="none"/></g>
      </svg>`;
    },
    mint: () => `<svg class="por-art" viewBox="0 0 240 240" aria-hidden="true">${shadow}
        ${star(46, 120, 8)}${star(200, 40, 7)}${star(206, 196, 6)}
        <rect x="26" y="34" width="46" height="24" rx="7" fill="#fff" stroke="${O}" stroke-width="3"/><rect x="72" y="41" width="6" height="10" rx="2" fill="${O}"/>
        <rect x="31" y="39" width="10" height="14" rx="2" fill="#4CD964"/><rect x="44" y="39" width="10" height="14" rx="2" fill="#4CD964"/><rect x="57" y="39" width="10" height="14" rx="2" fill="#4CD964"/>
        <path d="M52 30 L45 47 L52 47 L47 62 L60 42 L53 42 L58 30Z" fill="#FFD23F" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M120 32 C114 24 106 23 101 27 C107 33 114 34 120 32Z M121 32 C122 22 126 16 133 13 C136 20 132 28 121 32Z" fill="#9BE8B5" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
        <ellipse cx="108" cy="208" rx="12" ry="7" fill="#4FB879" stroke="${O}" stroke-width="3"/><ellipse cx="132" cy="208" rx="12" ry="7" fill="#4FB879" stroke="${O}" stroke-width="3"/>
        <path d="M120 30 C166 55 184 110 166 160 C156 190 136 202 120 204 C104 202 84 190 74 160 C56 110 74 55 120 30Z" fill="#7EDDA3" stroke="${O}" stroke-width="3.5"/>
        <path d="M120 46 L120 84 M120 152 L120 194 M120 64 L104 54 M120 64 L136 54 M120 170 L102 158 M120 170 L138 158" stroke="#4FB879" stroke-width="3" stroke-linecap="round"/>
        <path d="M76 112 C76 58 164 58 164 112" stroke="${O}" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M76 112 C76 58 164 58 164 112" stroke="#9A8CFF" stroke-width="8" fill="none" stroke-linecap="round"/>
        <rect x="62" y="102" width="22" height="34" rx="10" fill="#9A8CFF" stroke="${O}" stroke-width="3"/><rect x="156" y="102" width="22" height="34" rx="10" fill="#9A8CFF" stroke="${O}" stroke-width="3"/>
        <path d="M99 120 Q106 111 113 120 M127 120 Q134 111 141 120" stroke="${O}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        ${blush(96, 144, 133)}<path d="M112 136 Q120 144 128 136" stroke="${O}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        ${arm('M162 164 C170 158 176 158 182 162', '#7EDDA3')}
        <path d="M178 150 L206 150 L203 182 Q192 188 181 182Z" fill="#fff" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M206 157 C216 157 216 172 204 172" stroke="${O}" stroke-width="3" fill="none"/>
        <path d="M181 158 L204 158" stroke="#C5F2D6" stroke-width="5"/>
        <path d="M186 142 C182 136 190 132 186 124 M196 142 C192 136 200 132 196 124" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>`,
    oak: () => {
      const C = [[120, 96, 56], [76, 114, 32], [164, 114, 32], [90, 68, 30], [150, 68, 30], [120, 142, 34]];
      return `<svg class="por-art" viewBox="0 0 240 240" aria-hidden="true">${shadow}
        ${star(30, 60, 8)}${star(214, 54, 7)}
        <path d="M80 120 C58 162 66 200 92 206 L148 206 C174 200 182 162 160 120Z" fill="#FF6B6B" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
        <rect x="103" y="168" width="15" height="40" rx="7" fill="#B07438" stroke="${O}" stroke-width="3"/><rect x="122" y="168" width="15" height="40" rx="7" fill="#B07438" stroke="${O}" stroke-width="3"/>
        <ellipse cx="108" cy="210" rx="11" ry="6" fill="#8A5A2B" stroke="${O}" stroke-width="3"/><ellipse cx="132" cy="210" rx="11" ry="6" fill="#8A5A2B" stroke="${O}" stroke-width="3"/>
        ${C.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${O}" stroke="${O}" stroke-width="7"/>`).join('')}
        ${C.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#5DBB63"/>`).join('')}
        <circle cx="86" cy="64" r="10" fill="#86D889"/><circle cx="70" cy="104" r="7" fill="#86D889"/>
        <path d="M96 46 Q120 20 144 46 Q120 56 96 46Z" fill="#B07438" stroke="${O}" stroke-width="3" stroke-linejoin="round"/><path d="M106 40 L112 46 M118 34 L122 46 M130 38 L132 47" stroke="#7A4A1E" stroke-width="2"/><rect x="117" y="20" width="6" height="12" rx="3" fill="#7A4A1E" stroke="${O}" stroke-width="2.4"/>
        ${eyes(104, 136, 104)}${blush(94, 146, 118)}
        <path d="M108 116 Q120 132 132 116Z" fill="#7A2E1F" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/>
        ${arm('M158 150 C172 146 182 150 188 160', '#5DBB63')}
        <ellipse cx="196" cy="198" rx="16" ry="18" fill="#B8EDB2" stroke="${O}" stroke-width="3"/><path d="M196 180 C190 170 182 170 178 174 C184 180 190 182 196 180Z M196 180 C202 170 210 170 214 174 C208 180 202 182 196 180Z" fill="#7EDDA3" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
        <circle cx="190" cy="196" r="2.6" fill="${O}"/><circle cx="202" cy="196" r="2.6" fill="${O}"/><path d="M192 203 Q196 207 200 203" stroke="${O}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        ${heart(216, 150, 1.1, '#FF6FA5')}
      </svg>`;
    },
    bamboo: () => `<svg class="por-art" viewBox="0 0 240 240" aria-hidden="true">${shadow}
        ${star(34, 150, 8)}${star(210, 120, 6)}
        <g stroke="#E2B13C" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".9"><path d="M108 212 C100 220 92 224 80 226"/><path d="M112 213 C112 222 108 228 104 234"/><path d="M132 213 C138 222 148 226 160 226"/><path d="M128 213 C130 222 134 230 138 236"/></g>
        <rect x="146" y="22" width="80" height="26" rx="13" fill="#fff" stroke="${O}" stroke-width="3"/><rect x="151" y="27" width="50" height="16" rx="8" fill="#8BD86A"/>
        <text x="213" y="40" text-anchor="end" font-size="12" font-weight="900" fill="${O}" font-family="sans-serif">87%</text>
        <path d="M120 60 C110 40 96 34 82 36 C90 50 106 58 120 60Z M120 60 C130 40 144 34 158 36 C150 50 134 58 120 60Z M120 60 C114 42 118 28 126 18 C132 34 130 50 120 60Z" fill="#6CC24A" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
        ${arm('M98 146 C82 140 72 128 68 116', '#8BD86A')}
        <rect x="52" y="104" width="34" height="7" rx="3" fill="${O}"/><rect x="46" y="94" width="12" height="27" rx="4" fill="#6C63FF" stroke="${O}" stroke-width="3"/><rect x="80" y="94" width="12" height="27" rx="4" fill="#6C63FF" stroke="${O}" stroke-width="3"/>
        <rect x="96" y="58" width="48" height="146" rx="22" fill="#8BD86A" stroke="${O}" stroke-width="3.5"/>
        <path d="M99 160 Q120 167 141 160" stroke="#5DAE45" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 186 Q120 192 140 186" stroke="#5DAE45" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${arm('M142 150 C156 152 164 160 166 172', '#8BD86A')}
        <rect x="93" y="76" width="54" height="13" rx="3" fill="#FF5A5F" stroke="${O}" stroke-width="3"/>
        <path d="M146 80 C158 74 166 70 176 70 C172 78 162 84 148 86Z M146 84 C156 88 164 94 170 102 C160 102 152 96 146 88Z" fill="#FF5A5F" stroke="${O}" stroke-width="2.8" stroke-linejoin="round"/>
        <path d="M102 107 L114 111 M138 107 L126 111" stroke="${O}" stroke-width="3.4" stroke-linecap="round"/>
        ${eyes(109, 131, 122, 5.5)}${blush(103, 137, 135)}<path d="M113 136 Q120 143 128 135" stroke="${O}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        <ellipse cx="110" cy="208" rx="12" ry="6.5" fill="#5DAE45" stroke="${O}" stroke-width="3"/><ellipse cx="131" cy="208" rx="12" ry="6.5" fill="#5DAE45" stroke="${O}" stroke-width="3"/>
      </svg>`,
    ginkgo: () => {
      const id = 'gk' + (++uid);
      const fan = 'M120 190 L66 86 Q60 56 86 48 Q102 44 112 54 L120 76 L128 54 Q138 44 154 48 Q180 56 174 86Z';
      return `<svg class="por-art" viewBox="0 0 240 240" aria-hidden="true"><defs><clipPath id="${id}"><path d="${fan}"/></clipPath></defs>${shadow}
        ${star(36, 64, 8)}${star(206, 60, 8)}${star(214, 150, 5)}
        <path d="M30 184 L54 184 M24 196 L50 196 M36 208 L56 208" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
        <g transform="rotate(-5 120 204)"><rect x="64" y="198" width="112" height="11" rx="5.5" fill="#6C63FF" stroke="${O}" stroke-width="3"/><circle cx="84" cy="215" r="7" fill="#FFD54F" stroke="${O}" stroke-width="3"/><circle cx="156" cy="215" r="7" fill="#FFD54F" stroke="${O}" stroke-width="3"/></g>
        <rect x="111" y="182" width="18" height="18" rx="6" fill="#B07438" stroke="${O}" stroke-width="3"/>
        ${arm('M96 142 C82 134 68 132 56 136', '#FFD54F')}${arm('M144 142 C158 134 172 132 184 136', '#9BE07A')}
        <g clip-path="url(#${id})"><rect x="40" y="30" width="80" height="170" fill="#FFD54F"/><rect x="120" y="30" width="80" height="170" fill="#9BE07A"/>
          <path d="M120 186 L84 60 M120 186 L104 56 M120 186 L136 56 M120 186 L156 60" stroke="#fff" stroke-width="2" opacity=".45"/></g>
        <path d="${fan}" fill="none" stroke="${O}" stroke-width="3.5" stroke-linejoin="round"/>
        ${eyes(107, 133, 106)}${blush(97, 143, 120)}
        <path d="M110 118 Q120 132 130 118Z" fill="#7A2E1F" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><path d="M115 124 Q120 128 125 124 Q120 130 115 124Z" fill="#FF7B8A"/>
      </svg>`;
    }
  };

  // ---------- 五种人格 ----------
  const TYPES = {
    sunflower: { nick: '葵葵', title: '暖阳气氛组', bg1: '#FFF2B8', bg2: '#FFCF5C', acc: '#FFC23D', soft: '#FFF0C2',
      tags: ['#气氛担当', '#今天就见面', '#请客小能手'], quote: '走，我请！',
      li: ['好东西不爱攒着，更想现在就和在乎的人一起用掉。', '群里一句"出来玩"，你通常是第一个回"好"的。', '一顿饭、一通电话，在你看来都是很实在的"投资"。'],
      power: '三秒点亮全场，让身边的人此刻就觉得被照顾到。', tip: '也给自己的根浇点水：五年后的你，也是你在乎的人。', mate: ['bamboo', '竹竹', '你借他今天的阳光，他借你明天的底气。'] },
    mint: { nick: '薄荷酱', title: '当下回血王', bg1: '#DDFBEA', bg2: '#8EE6B4', acc: '#5FD394', soft: '#DDF7E8',
      tags: ['#精致松弛', '#不内耗', '#先爱自己'], quote: '先让我充个电。',
      li: ['累了就歇，想吃就吃，不太为了"以后"硬撑。', '电量一低你第一个发现，并且马上找插座。', '相信把今天过好，明天自然有力气。'],
      power: '回血速度全场第一：别人还在硬扛，你已经满血复活。', tip: '偶尔分一小盆出来，存给五年后的自己——他会谢谢你。', mate: ['oak', '橡橡', '他带你看远一点，你提醒他喘口气。'] },
    oak: { nick: '橡橡', title: '靠谱大树', bg1: '#E4F6D6', bg2: '#A8DF8C', acc: '#5DBB63', soft: '#E3F4D8',
      tags: ['#长期主义', '#大家的树洞', '#情绪稳定'], quote: '放心，有我。',
      li: ['做决定前常会想："以后对大家好不好？"', '愿意为了家人朋友的将来，今天先忍一忍。', '朋友有事第一个想到你：你就是那个"靠谱的人"。'],
      power: '撑伞技能满级：风大的时候，大家都会往你这边站。', tip: '大树也要晒太阳：今天留一点不为任何人的时间给自己。', mate: ['mint', '薄荷酱', '他让你今天也轻松一点。'] },
    bamboo: { nick: '竹竹', title: '长期主义修行者', bg1: '#EEF8D8', bg2: '#C3E68E', acc: '#8BD86A', soft: '#EAF5D6',
      tags: ['#延迟满足', '#稳稳上分', '#自律达人'], quote: '再等等，值得。',
      li: ['更大的回报，值得多等几天。', '对五年后的自己有画面，也有计划表。', '眼前的小诱惑很难把你带跑。'],
      power: '蓄力：别人三分钟热度，你能一节一节往上长。', tip: '节与节之间也要松一松：今天的快乐不是浪费，是养分。', mate: ['sunflower', '葵葵', '他把今天的阳光分给你。'] },
    ginkgo: { nick: '杏杏', title: '松弛平衡家', bg1: '#FFF4CF', bg2: '#CFEFA0', acc: '#FFD54F', soft: '#FFF3CC',
      tags: ['#松弛有度', '#都可以', '#情绪稳定'], quote: '都行，看情况～',
      li: ['该花的时候花，该存的时候存。', '自己的需要和别人的需要，你都放在心上。', '看情况调整，很少被一种想法困住。'],
      power: '平衡：环境怎么变，你都能找到舒服的姿势。', tip: '平衡不等于样样满分：累的时候，允许自己偏向一边。', mate: ['all', '任何一型', '你是花园里的翻译官，和谁都聊得来。'] }
  };
  const LETTER = { F: '远方派', N: '今天派', O: '为身边人', S: '先顾自己', V: '未来清晰', M: '未来朦胧', C: '自己掌舵', W: '随风调整' };

  function score(d) {
    const s = d.shares || {}; const S = +s.S || 0, F = +s.F || 0, O2 = (+s.P1 || 0) + (+s.P2 || 0) + (+s.P3 || 0), tot = S + F + O2;
    const parts = [];
    if (d.dd_n > 0) parts.push(1 - d.dd_now / d.dd_n);
    if (S + F > 0) parts.push(F / (S + F));
    const future = parts.length ? parts.reduce((a, x) => a + x, 0) / parts.length : 0.5;
    const others = tot > 0 ? O2 / tot : 0.6;
    let type;
    if (Math.abs(future - 0.5) < 0.1 && Math.abs(others - 0.6) < 0.08) type = 'ginkgo';
    else type = future >= 0.5 ? (others >= 0.6 ? 'oak' : 'bamboo') : (others >= 0.6 ? 'sunflower' : 'mint');
    const othersPos = others <= 0.6 ? others / 0.6 * 0.5 : 0.5 + (others - 0.6) / 0.4 * 0.5;
    const code = (future >= 0.5 ? 'F' : 'N') + (others >= 0.6 ? 'O' : 'S') + ((+d.fsc2 || 0) >= 5 ? 'V' : 'M') + ((+d.ctrl || 0) >= 5 ? 'C' : 'W');
    return { type, future, others, othersPos, S, F, O: O2, tot, code };
  }

  const dots = (v, n) => { const k = Math.round(clamp(v, 0, n)); let o = ''; for (let i = 0; i < n; i++) o += `<span class="${i < k ? 'on' : ''}"></span>`; return `<span class="por-dots">${o}</span>`; };

  function miniGarden(d) {
    const s = d.shares || {}; const ppl = (d.people || []).map((p) => { const t = String(p || '').trim(); return t.length > 4 ? t.slice(0, 4) + '…' : t; });
    const items = [['P1', ppl[0] || 'TA①'], ['P2', ppl[1] || 'TA②'], ['P3', ppl[2] || 'TA③'], ['S', '现在的我'], ['F', '五年后的我']];
    const max = Math.max(1, ...items.map(([k]) => +s[k] || 0));
    let g = '';
    items.forEach(([k, lab], i) => {
      const v = +s[k] || 0, x = 34 + i * 58, h = 14 + 70 * v / max, top = 112 - h, r = 8 + 16 * Math.sqrt(v / max);
      const col = k === 'S' ? '#FFC23D' : (k === 'F' ? '#9A8CFF' : '#5DBB63');
      g += `<rect x="${x - 3}" y="${top}" width="6" height="${h}" rx="3" fill="#8A5A2B" stroke="${O}" stroke-width="1.6"/><circle cx="${x}" cy="${top}" r="${r}" fill="${col}" stroke="${O}" stroke-width="2.4"/>
        <text x="${x}" y="${top - r - 5}" text-anchor="middle" font-size="13" font-weight="900" fill="${O}">${v}</text>
        <text x="${x}" y="134" text-anchor="middle" font-size="12" font-weight="700" fill="#4A4436">${esc(lab)}</text>`;
    });
    return `<svg viewBox="0 -20 320 162" width="100%" aria-label="你的花园"><rect x="6" y="110" width="308" height="6" rx="3" fill="#8A5A2B" stroke="${O}" stroke-width="1.6"/>${g}</svg>`;
  }

  const mini = (k) => ART[k]().replace('class="por-art"', '');

  window.LGPortrait = function (d) {
    const sc = score(d); const T = TYPES[sc.type];
    const facts = [];
    if (d.dd_n > 0) facts.push(`${d.dd_n} 道"现在还是以后"里，你有 <em>${d.dd_now} 道</em>选了"现在就要"。`);
    if (sc.S > 0) { const r = sc.F / sc.S; facts.push(r >= 1.15 ? `给"五年后的我"的养分，是"现在的我"的 <em>${r.toFixed(1)} 倍</em>。` : (r <= 0.87 ? `给"现在的我"的养分，是"五年后的我"的 <em>${(sc.S / Math.max(sc.F, 1)).toFixed(1)} 倍</em>。` : `"现在的我"和"五年后的我"，你给得<em>差不多一样多</em>。`)); }
    if (sc.tot > 0) facts.push(`100 份养分里，<em>${sc.O} 份</em>给了三位重要的人。`);
    const meters = [['和五年后的自己像同一个人', d.fsc1, 7], ['能看清五年后的自己', d.fsc2, 7], ['对未来一年的掌控感', d.ctrl, 7], ['此刻的活力', d.pa, 5]]
      .filter(([, v]) => isFinite(v) && v > 0).map(([l, v, n]) => `<div class="por-meter"><span>${l}</span>${dots(n === 5 ? v / 5 * 7 : v, 7)}</div>`).join('');
    const mate = T.mate[0] === 'all' ? `<span class="por-mates">${['sunflower', 'mint', 'oak', 'bamboo'].map(mini).join('')}</span>` : mini(T.mate[0]);
    return `<style>${CSS}</style><div class="por" style="--acc:${T.acc};--soft:${T.soft};--bg1:${T.bg1};--bg2:${T.bg2}">
      <div class="por-hero"><div class="por-kicker"><span>时间花园人格</span><span class="por-chip">${sc.code}</span></div>
        ${ART[sc.type]()}<div class="por-name">${T.nick}</div><div class="por-title">${T.title}</div>
        <div class="por-tags">${T.tags.map((t) => `<span>${t}</span>`).join('')}</div></div>
      <div class="por-sec"><div class="por-h">你的人格码 · ${sc.code}</div><div class="por-code">${sc.code.split('').map((c) => `<div><i>${c}</i><small>${LETTER[c]}</small></div>`).join('')}</div></div>
      <div class="por-sec"><div class="por-h">${T.nick}的口头禅</div><div class="por-quote">${T.quote}</div></div>
      <div class="por-sec"><div class="por-h">你站在哪儿</div>
        <div class="por-axis"><div class="por-axis-ends"><span>今天</span><span>远方</span></div><div class="por-track"><b></b><i style="left:${(clamp(sc.future, 0.04, 0.96) * 100).toFixed(1)}%"></i></div></div>
        <div class="por-axis"><div class="por-axis-ends"><span>自己</span><span>身边的人</span></div><div class="por-track"><b></b><i style="left:${(clamp(sc.othersPos, 0.04, 0.96) * 100).toFixed(1)}%"></i></div></div></div>
      <div class="por-sec"><div class="por-h">你的样子</div>${T.li.map((x, i) => `<div class="por-li"><em>${i + 1}</em><span>${x}</span></div>`).join('')}</div>
      <div class="por-sec por-two"><div class="por-mini"><b>隐藏技能</b>${T.power}</div><div class="por-mini"><b>小小提醒</b>${T.tip}</div></div>
      <div class="por-sec"><div class="por-h">你今天种下的花园</div>${miniGarden(d)}${facts.map((f) => `<p class="por-fact">${f}</p>`).join('')}</div>
      ${meters ? `<div class="por-sec"><div class="por-h">四个小刻度</div>${meters}</div>` : ''}
      <div class="por-sec"><div class="por-h">最佳拍档</div><div class="por-mate${T.mate[0] === 'all' ? ' por-mate-all' : ''}">${mate}<div><b>${T.mate[1]}</b><br>${T.mate[2]}</div></div></div>
      <div class="por-foot">只根据你练习之前的几道题（花园、选择题、关于五年后的几句话）生成，图个好玩，不是心理测验，也不是诊断。</div></div>`;
  };
  window.LGPortrait.score = score;
})();
