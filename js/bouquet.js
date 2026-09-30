/* 第一页的花束（照着送出去的那束花画的）
 * 粉玫瑰铺底，蓝色 / 白色 / 粉色百合点缀，白色圆瓣小花、红色小菊、小雏菊、淡蓝星花，
 * 白色蕾丝包装、缎面粉丝带、顶上一张小卡片，花上缀着会闪的水钻。
 * 只负责画；开花、散开的动画在 main.js 里用 GSAP 做。 */
(function () {
  const host = document.getElementById('bouquet');
  if (!host) return;

  let seed = 20031015;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const r = (a, b) => a + rnd() * (b - a);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const f1 = (n) => Math.round(n * 10) / 10;

  const CX = 300, CY = 392, RX = 214, RY = 204;
  const inDome = (x, y, pad = 0) => ((x - CX) / (RX - pad)) ** 2 + ((y - CY) / (RY - pad)) ** 2 <= 1;

  /* ---------- 花的“模具” ---------- */
  const ROSES = [
    ['#fff4f5', '#f7c3cf', '#d98098'], ['#ffe8ee', '#f29db5', '#cc5c7c'], ['#ffd9e3', '#ec6f95', '#b33a61'],
    ['#fff5ee', '#f7cdb9', '#d9967e'], ['#fffdf9', '#f5e2dc', '#d6b5ab'], ['#ffdbe1', '#e96a84', '#ad3350'],
  ];
  const PETAL = 'M0 0 C13 -5 19 -17 11 -25 C6 -29 -6 -29 -11 -25 C-19 -17 -13 -5 0 0Z';
  const LILY_O = 'M0 0 C10 -8 15 -32 0 -60 C-15 -32 -10 -8 0 0Z';
  const LILY_I = 'M0 0 C7 -8 11 -30 0 -54 C-11 -30 -7 -8 0 0Z';
  const STAR4 = (s) => `M0 ${-s} L${s * .18} ${-s * .18} L${s} 0 L${s * .18} ${s * .18} L0 ${s} L${-s * .18} ${s * .18} L${-s} 0 L${-s * .18} ${-s * .18}Z`;

  let defs = '';
  ROSES.forEach(([lt, md, dk], i) => {
    defs += `
    <linearGradient id="rp${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${dk}"/><stop offset=".35" stop-color="${md}"/><stop offset=".85" stop-color="${lt}"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <radialGradient id="rb${i}"><stop offset="0" stop-color="${dk}"/><stop offset="1" stop-color="${md}"/></radialGradient>
    <g id="rose${i}">
      <circle r="21" fill="url(#rb${i})"/>
      ${[0, 1, 2, 3, 4].map((k) => `<g transform="rotate(${k * 72})"><path d="${PETAL}" fill="url(#rp${i})" stroke="${dk}" stroke-opacity=".35" stroke-width=".6"/><path d="M-8 -23.5 Q0 -27.5 8 -23.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.1"/></g>`).join('')}
      ${[0, 1, 2, 3, 4].map((k) => `<path d="${PETAL}" transform="rotate(${k * 72 + 36}) scale(.72)" fill="url(#rp${i})" stroke="${dk}" stroke-opacity=".4" stroke-width=".7"/>`).join('')}
      ${[0, 1, 2, 3].map((k) => `<path d="${PETAL}" transform="rotate(${k * 90 + 18}) scale(.46)" fill="url(#rp${i})" stroke="${dk}" stroke-opacity=".45" stroke-width=".9"/>`).join('')}
      <circle r="4.2" fill="${dk}"/>
      <path d="M-3 1 C-4 -4 4 -5 4 0 C4 3 0 4 -1 2" fill="none" stroke="${lt}" stroke-width="1" stroke-opacity=".8"/>
    </g>`;
  });

  defs += `
    <linearGradient id="mumP" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#b8173f"/><stop offset="1" stop-color="#f7738f"/></linearGradient>
    <g id="mum">
      ${Array.from({ length: 22 }, (_, k) => `<ellipse cy="-11" rx="2.3" ry="9" transform="rotate(${f1(k * 16.36)})" fill="url(#mumP)"/>`).join('')}
      ${Array.from({ length: 16 }, (_, k) => `<ellipse cy="-7.5" rx="2" ry="6.5" transform="rotate(${k * 22.5 + 8})" fill="url(#mumP)" opacity=".9"/>`).join('')}
      <circle r="5.6" fill="none" stroke="#f2c14e" stroke-width="1.6" stroke-dasharray="1 1.4"/>
      <circle r="4.2" fill="#6d1027"/>
    </g>

    <radialGradient id="daisyP" cx="50%" cy="35%"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fbf7f1"/><stop offset="1" stop-color="#e7ded2"/></radialGradient>
    <radialGradient id="daisyC" cx="40%" cy="35%"><stop offset="0" stop-color="#fff5bf"/><stop offset=".5" stop-color="#f3c02c"/><stop offset="1" stop-color="#d4930f"/></radialGradient>
    <g id="daisy">
      ${[0, 1, 2, 3, 4].map((k) => `<circle cy="-10" r="8.6" transform="rotate(${k * 72})" fill="url(#daisyP)" stroke="#e1d5c7" stroke-width=".6"/>`).join('')}
      <circle r="5.4" fill="url(#daisyC)"/>
    </g>

    <g id="cham">
      ${Array.from({ length: 14 }, (_, k) => `<ellipse cy="-6.5" rx="1.7" ry="5" transform="rotate(${f1(k * 25.7)})" fill="#fff" stroke="#e9dfd2" stroke-width=".4"/>`).join('')}
      <circle r="3.4" fill="url(#daisyC)"/>
    </g>

    <linearGradient id="bsG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f1f6fd"/><stop offset="1" stop-color="#96b9e6"/></linearGradient>
    <g id="bstar">
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M0 0 Q4.5 -5 0 -11 Q-4.5 -5 0 0Z" transform="rotate(${k * 72})" fill="url(#bsG)" stroke="#86a8d8" stroke-width=".5"/>`).join('')}
      <circle r="1.8" fill="#5a7fc0"/>
    </g>`;

  const LILIES = {
    lb: { stops: [['0', '#fbfdff'], ['.3', '#d4ecfb'], ['.72', '#56b5ec'], ['1', '#2b80d2']], vein: '#3b8fd6', glitter: 22, spots: 0 },
    lw: { stops: [['0', '#eef0b0'], ['.28', '#fffdf5'], ['1', '#fff9f5']], vein: '#e6dcc4', glitter: 6, spots: 0 },
    lp: { stops: [['0', '#ffffff'], ['.4', '#fbd4e2'], ['1', '#ee93b5']], vein: '#e38aac', glitter: 8, spots: 10 },
  };
  Object.entries(LILIES).forEach(([id, L]) => {
    let g = `<linearGradient id="${id}G" x1="0" y1="1" x2="0" y2="0">${L.stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient><g id="${id}">`;
    [0, 120, 240].forEach((a) => { g += `<g transform="rotate(${a + 60})"><path d="${LILY_I}" fill="url(#${id}G)" stroke="${L.vein}" stroke-opacity=".5" stroke-width=".7"/><path d="M0 -4 Q1.5 -28 0 -50" fill="none" stroke="${L.vein}" stroke-opacity=".45" stroke-width=".8"/></g>`; });
    [0, 120, 240].forEach((a) => { g += `<g transform="rotate(${a})"><path d="${LILY_O}" fill="url(#${id}G)" stroke="${L.vein}" stroke-opacity=".5" stroke-width=".7"/><path d="M0 -4 Q-1.5 -30 0 -55" fill="none" stroke="${L.vein}" stroke-opacity=".45" stroke-width=".8"/></g>`; });
    for (let k = 0; k < L.spots; k++) {
      const a = (Math.floor(r(0, 6)) * 60 + r(-8, 8)) * Math.PI / 180, d = r(8, 22);
      g += `<circle cx="${f1(Math.sin(a) * d)}" cy="${f1(-Math.cos(a) * d)}" r="${f1(r(.6, 1.2))}" fill="#c75b86" opacity=".7"/>`;
    }
    for (let k = 0; k < L.glitter; k++) {
      const a = (Math.floor(r(0, 6)) * 60 + r(-10, 10)) * Math.PI / 180, d = r(14, 52);
      g += `<circle cx="${f1(Math.sin(a) * d)}" cy="${f1(-Math.cos(a) * d)}" r="${f1(r(.5, 1.3))}" fill="#fff" opacity=".95"/>`;
    }
    for (let k = 0; k < 6; k++) {
      const a = (k * 60 + 25) * Math.PI / 180, l = 24;
      const x = f1(Math.sin(a) * l), y = f1(-Math.cos(a) * l);
      g += `<path d="M0 0 Q${f1(x * .5 + 2)} ${f1(y * .5)} ${x} ${y}" stroke="#dfe9b6" stroke-width="1.1" fill="none"/><ellipse cx="${x}" cy="${y}" rx="1.5" ry="3.4" transform="rotate(${k * 60 + 25} ${x} ${y})" fill="#b87a3c"/>`;
    }
    g += `<path d="M0 0 L2 -20" stroke="#dfe9b6" stroke-width="1.4"/><circle cx="2" cy="-21" r="2" fill="#cfe08e"/></g>`;
    defs += g;
  });

  /* ---------- 摆花 ---------- */
  const blooms = []; // {href, x, y, rot, s, sy, layer}
  const put = (href, x, y, s, layer, rot = r(0, 360), sy = 1) => blooms.push({ href, x, y, s, sy, rot, layer });

  for (let y = CY - RY + 12; y < CY + RY; y += 31) {
    for (let x = CX - RX + 12; x < CX + RX; x += 33) {
      const xx = x + r(-7, 7) + (Math.round(y / 31) % 2) * 15, yy = y + r(-7, 7);
      if (inDome(xx, yy, 12)) put(`#rose${Math.floor(r(0, 6))}`, xx, yy, r(.95, 1.25), 0);
    }
  }
  for (let i = 0; i < 40; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 16)) put('#mum', x, y, r(.8, 1.05), 1);
  }
  [
    ['#lw', 300, 255, 1.2, 12, .9], ['#lw', 246, 292, .95, -35, .85], ['#lw', 352, 286, .95, 40, .85],
    ['#lp', 276, 440, 1.12, 18, .9], ['#lp', 384, 430, 1.05, -22, .88], ['#lp', 214, 478, .82, 34, .9], ['#lp', 330, 520, .78, -8, .85],
    ['#lb', 168, 352, 1.3, -20, .85], ['#lb', 428, 348, 1.32, 26, .85], ['#lb', 300, 578, 1.02, 4, .8],
  ].forEach(([h, x, y, s, rot, sy]) => put(h, x, y, s, 2, rot, sy));
  for (let i = 0; i < 26; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 20)) put('#daisy', x, y, r(1.1, 1.45), 3);
  }
  for (let i = 0; i < 30; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 10)) put('#cham', x, y, r(1, 1.4), 3);
  }
  for (let i = 0; i < 26; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 10)) put('#bstar', x, y, r(1, 1.35), 3);
  }

  // 绿色配草、满天星
  let sprigs = '';
  for (let i = 0; i < 34; i++) {
    const a = r(-205, 25) * Math.PI / 180;
    const x0 = CX + Math.cos(a) * RX * .9, y0 = CY + Math.sin(a) * RY * .9;
    const len = r(38, 78), ang = a + r(-.35, .35);
    const x1 = x0 + Math.cos(ang) * len, y1 = y0 + Math.sin(ang) * len;
    sprigs += `<path d="M${f1(x0)} ${f1(y0)} Q${f1((x0 + x1) / 2 + r(-10, 10))} ${f1((y0 + y1) / 2 + r(-10, 10))} ${f1(x1)} ${f1(y1)}" stroke="#86ad55" stroke-width="1.1" fill="none"/>`;
    for (let k = 0; k < 8; k++) {
      const tt = .35 + k * .085;
      sprigs += `<circle cx="${f1(x0 + (x1 - x0) * tt + r(-6, 6))}" cy="${f1(y0 + (y1 - y0) * tt + r(-6, 6))}" r="${f1(r(1.6, 3))}" fill="${pick(['#a9cf66', '#8fbd4c', '#c7e08b'])}"/>`;
    }
    if (i % 3 === 0) sprigs += `<circle cx="${f1(x1)}" cy="${f1(y1)}" r="2.2" fill="#fff" stroke="#e8e0d4" stroke-width=".5"/>`;
  }

  // 水钻
  let gems = '';
  for (let i = 0; i < 34; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (!inDome(x, y, 20)) continue;
    const s = r(4, 7.5);
    gems += `<g transform="translate(${f1(x)} ${f1(y)})"><g class="gem" style="animation-delay:${f1(-r(0, 2.8))}s;animation-duration:${f1(r(2.2, 3.6))}s">
      <circle r="${f1(s * .45)}" fill="#fff" opacity=".9"/><path d="${STAR4(s * 1.6)}" fill="#fff"/><circle r="${f1(s * .22)}" fill="#dfeaf7"/></g></g>`;
  }

  // 蕾丝包装：外圈扇贝边 + 下方收口
  function scallopArc(rx, ry, from, to, n, bump) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const a = (from + (to - from) * (i / n)) * Math.PI / 180;
      const x = CX + Math.cos(a) * rx, y = CY + Math.sin(a) * ry;
      if (i === 0) { d += `M${f1(x)} ${f1(y)}`; continue; }
      const am = (from + (to - from) * ((i - .5) / n)) * Math.PI / 180;
      d += ` Q${f1(CX + Math.cos(am) * (rx + bump))} ${f1(CY + Math.sin(am) * (ry + bump))} ${f1(x)} ${f1(y)}`;
    }
    return d;
  }
  const WR = [RX + 40, RY + 36];
  const lowL = [CX + Math.cos(150 * Math.PI / 180) * WR[0], CY + Math.sin(150 * Math.PI / 180) * WR[1]];
  const wrap = `${scallopArc(WR[0], WR[1], 150, 390, 30, 14)} C${f1(CX + 150)} ${CY + 230} ${CX + 60} ${CY + 290} ${CX + 30} 700 L${CX - 30} 700 C${CX - 60} ${CY + 290} ${CX - 150} ${CY + 230} ${f1(lowL[0])} ${f1(lowL[1])}Z`;
  const ruffle = scallopArc(RX + 22, RY + 19, 155, 385, 40, 8);
  const frontLace = `${scallopArc(RX + 6, RY + 2, 158, 22, 22, -9)} L${CX + 120} ${CY + 250} Q${CX} ${CY + 300} ${CX - 120} ${CY + 250} Z`;

  const bloomSvg = blooms
    .sort((a, b) => a.layer - b.layer)
    .map((b) => `<g class="bloom" data-layer="${b.layer}" data-x="${f1(b.x)}" data-y="${f1(b.y)}" transform="translate(${f1(b.x)} ${f1(b.y)})"><use href="${b.href}" transform="rotate(${f1(b.rot)}) scale(${f1(b.s * 100) / 100} ${f1(b.s * b.sy * 100) / 100})"/></g>`)
    .join('');

  host.innerHTML = `
  <svg viewBox="0 0 600 800" role="img" aria-label="一大束鲜花">
    <defs>
      ${defs}
      <pattern id="lace" width="26" height="26" patternUnits="userSpaceOnUse">
        <rect width="26" height="26" fill="#fffdfb"/>
        <circle cx="13" cy="13" r="5.5" fill="none" stroke="#ebe1d5" stroke-width=".8"/>
        <circle cx="13" cy="6" r="1.8" fill="#f0e8de"/><circle cx="13" cy="20" r="1.8" fill="#f0e8de"/>
        <circle cx="6" cy="13" r="1.8" fill="#f0e8de"/><circle cx="20" cy="13" r="1.8" fill="#f0e8de"/>
        <circle cx="0" cy="0" r="2.4" fill="none" stroke="#ebe1d5" stroke-width=".7"/><circle cx="26" cy="26" r="2.4" fill="none" stroke="#ebe1d5" stroke-width=".7"/>
        <circle cx="26" cy="0" r="2.4" fill="none" stroke="#ebe1d5" stroke-width=".7"/><circle cx="0" cy="26" r="2.4" fill="none" stroke="#ebe1d5" stroke-width=".7"/>
      </pattern>
      <radialGradient id="wrapShade" cx="50%" cy="45%" r="60%"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#d9cabb" stop-opacity=".55"/></radialGradient>
      <radialGradient id="nest"><stop offset=".78" stop-color="#6b3b3b" stop-opacity=".22"/><stop offset="1" stop-color="#6b3b3b" stop-opacity="0"/></radialGradient>
      <linearGradient id="satin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ee9fb6"/><stop offset=".4" stop-color="#fbd5e0"/><stop offset=".6" stop-color="#f6bccc"/><stop offset="1" stop-color="#e892ab"/></linearGradient>
      <linearGradient id="goldTxt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c7338"/><stop offset=".45" stop-color="#d9b877"/><stop offset=".6" stop-color="#b8925a"/><stop offset="1" stop-color="#8f6a33"/></linearGradient>
      <filter id="bqShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#7a5040" flood-opacity=".22"/></filter>
      <filter id="cardShadow"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#7a5040" flood-opacity=".18"/></filter>
    </defs>

    <g class="bq-card">
      <path d="M300 214 V150" stroke="#c9a15a" stroke-width="1.6"/>
      <path d="M300 170 c-8 -10 -18 0 -9 9 l9 8 l9 -8 c9 -9 -1 -19 -9 -9z" fill="none" stroke="#c9a15a" stroke-width="1.4"/>
      <g filter="url(#cardShadow)"><rect x="222" y="54" width="156" height="104" rx="2" fill="#fcf8f2"/></g>
      <rect x="229" y="61" width="142" height="90" fill="none" stroke="#d9c29a" stroke-width=".6"/>
      <text x="300" y="89" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="8.6" letter-spacing="1.2" fill="url(#goldTxt)">MAY <tspan font-family="'Pinyon Script', cursive" font-size="16" letter-spacing="0">Your Day</tspan> BE FILLED</text>
      <text x="300" y="108" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="8.6" letter-spacing="1.2" fill="url(#goldTxt)">WITH LOVE, JOY, AND ALL</text>
      <text x="300" y="126" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="8.6" letter-spacing="1.2" fill="url(#goldTxt)">THINGS WONDERFUL!</text>
      <text x="300" y="144" text-anchor="middle" font-family="Georgia, serif" font-size="7" letter-spacing="2" fill="#c3a063">♡ 2003 · 10 · 15</text>
    </g>

    <g class="bq-wrap">
      <path d="${wrap}" fill="url(#lace)" stroke="#e4d7c8" stroke-width="1.4" filter="url(#bqShadow)"/>
      <path d="${wrap}" fill="url(#wrapShade)"/>
      <path d="${ruffle}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>
      <path d="${ruffle}" fill="none" stroke="#e7dccf" stroke-width=".8" stroke-dasharray="1.5 4"/>
      <ellipse cx="${CX}" cy="${CY}" rx="${RX + 12}" ry="${RY + 12}" fill="url(#nest)"/>
    </g>
    <g class="bq-sprigs">${sprigs}</g>
    <g class="bq-flowers">${bloomSvg}</g>
    <g class="bq-front">
      <path d="${frontLace}" fill="url(#lace)" stroke="#e4d7c8" stroke-width="1"/>
      <path d="${frontLace}" fill="url(#wrapShade)" opacity=".6"/>
    </g>
    <g class="bq-gems">${gems}</g>
    <g class="bq-ribbon">
      <path d="M296 700 C288 738 278 770 258 800 L276 800 C290 772 298 740 303 704Z" fill="url(#satin)"/>
      <path d="M304 700 C312 740 326 770 344 800 L326 800 C314 772 305 742 298 704Z" fill="url(#satin)"/>
      <path d="M300 698 C268 672 236 694 262 712 C276 720 292 708 300 702Z" fill="url(#satin)" stroke="#e38fa8" stroke-width=".6"/>
      <path d="M300 698 C332 672 364 694 338 712 C324 720 308 708 300 702Z" fill="url(#satin)" stroke="#e38fa8" stroke-width=".6"/>
      <ellipse cx="300" cy="701" rx="9" ry="8" fill="#f3b3c6" stroke="#e38fa8" stroke-width=".6"/>
      <path d="M270 700 Q284 694 296 699" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" fill="none"/>
    </g>
  </svg>`;

  window.Bouquet = {
    svg: host.querySelector('svg'),
    center: { x: CX, y: CY },
  };
})();
