/* 第一页的花束：粉玫瑰、蓝色百合、白/粉百合、小雏菊、红色小菊、蕾丝包装、粉丝带、小卡片
 * 全部用 SVG 画出来，花朵一朵朵依次绽放 */
(function () {
  const host = document.getElementById('bouquet');
  if (!host) return;

  // 固定种子的随机数，保证每次花束长得一样
  let seed = 20031015;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const r = (a, b) => a + rnd() * (b - a);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const CX = 300, CY = 400, RX = 225, RY = 215; // 花束“圆顶”
  const inDome = (x, y, pad = 0) => ((x - CX) / (RX - pad)) ** 2 + ((y - CY) / (RY - pad)) ** 2 <= 1;

  const flowers = []; // { svg, y, delay }
  const add = (svg, x, y, extra = 0) => flowers.push({ svg, x, y, extra });

  const ROSE = [['#f592b0', '#d9567f'], ['#f7b3c4', '#e27c98'], ['#fcd2cc', '#e8999a'], ['#ef5f86', '#c23060'], ['#f9d6c6', '#e5a58a'], ['#f47aa0', '#d04574']];

  function rose(x, y, s, [c1, c2]) {
    let g = `<circle r="${s}" fill="${c1}"/>`;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 360 + r(-10, 10);
      g += `<ellipse cx="0" cy="${-s * 0.55}" rx="${s * 0.55}" ry="${s * 0.5}" transform="rotate(${a})" fill="${c1}" stroke="${c2}" stroke-width="1.2" opacity=".95"/>`;
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * 360 + 30;
      g += `<ellipse cx="0" cy="${-s * 0.28}" rx="${s * 0.36}" ry="${s * 0.3}" transform="rotate(${a})" fill="${c1}" stroke="${c2}" stroke-width="1"/>`;
    }
    g += `<path d="M${-s * .2} 0 a${s * .2} ${s * .2} 0 1 1 ${s * .3} ${s * .12} a${s * .12} ${s * .12} 0 1 1 ${-s * .16} ${-s * .14}" fill="none" stroke="${c2}" stroke-width="1.4"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${r(0, 360)})">${g}</g>`;
  }

  function mum(x, y, s, color) { // 红色小菊 / 非洲菊
    let g = '';
    for (let i = 0; i < 18; i++) g += `<ellipse cx="0" cy="${-s * 0.55}" rx="${s * 0.13}" ry="${s * 0.5}" transform="rotate(${i * 20})" fill="${color}"/>`;
    for (let i = 0; i < 12; i++) g += `<ellipse cx="0" cy="${-s * 0.35}" rx="${s * 0.1}" ry="${s * 0.3}" transform="rotate(${i * 30 + 10})" fill="${color}" opacity=".85"/>`;
    g += `<circle r="${s * 0.2}" fill="#8f1d3a"/><circle r="${s * 0.1}" fill="#f6c945"/>`;
    return `<g transform="translate(${x} ${y})">${g}</g>`;
  }

  function daisy(x, y, s) { // 圆瓣的白色小花（像照片里的黏土小花）
    let g = '';
    for (let i = 0; i < 5; i++) g += `<circle cx="0" cy="${-s * 0.52}" r="${s * 0.42}" transform="rotate(${i * 72})" fill="#fffdf8" stroke="#e8e0d4" stroke-width="1"/>`;
    g += `<circle r="${s * 0.26}" fill="#f7c933" stroke="#e0a91c" stroke-width="1"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${r(0, 72)})" filter="url(#soft)">${g}</g>`;
  }

  function chamomile(x, y, s) { // 细瓣小雏菊
    let g = '';
    for (let i = 0; i < 14; i++) g += `<ellipse cx="0" cy="${-s * 0.55}" rx="${s * 0.12}" ry="${s * 0.42}" transform="rotate(${i * 25.7})" fill="#fff"/>`;
    g += `<circle r="${s * 0.26}" fill="#f5c330"/>`;
    return `<g transform="translate(${x} ${y})">${g}</g>`;
  }

  function star(x, y, s) { // 淡蓝色小星花
    let g = '';
    for (let i = 0; i < 5; i++) g += `<path d="M0 0 Q${s * .35} ${-s * .5} 0 ${-s} Q${-s * .35} ${-s * .5} 0 0Z" transform="rotate(${i * 72})" fill="#a9c9f0" stroke="#7fa6dc" stroke-width=".8"/>`;
    g += `<circle r="${s * 0.14}" fill="#5f84c4"/>`;
    return `<g transform="translate(${x} ${y}) rotate(${r(0, 72)})">${g}</g>`;
  }

  function lily(x, y, s, rot, grad, vein) { // 六瓣百合
    let g = '';
    for (let i = 0; i < 6; i++) {
      const w = i % 2 ? 0.32 : 0.38, len = i % 2 ? 0.95 : 1;
      g += `<path d="M0 0 C${s * w} ${-s * .3} ${s * w * .9} ${-s * .75 * len} 0 ${-s * len} C${-s * w * .9} ${-s * .75 * len} ${-s * w} ${-s * .3} 0 0Z"
        transform="rotate(${i * 60 + (i % 2 ? 30 : 0) / 2})" fill="url(#${grad})" stroke="${vein}" stroke-width="1"/>`;
      g += `<path d="M0 ${-s * .1} L0 ${-s * .8 * len}" transform="rotate(${i * 60})" stroke="${vein}" stroke-width="1" opacity=".6"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const a = (i * 60 + 20) * Math.PI / 180, l = s * .42;
      g += `<line x1="0" y1="0" x2="${Math.sin(a) * l}" y2="${-Math.cos(a) * l}" stroke="#d8e7a6" stroke-width="1.4"/><ellipse cx="${Math.sin(a) * l}" cy="${-Math.cos(a) * l}" rx="2.4" ry="4" fill="#c7823e"/>`;
    }
    return `<g transform="translate(${x} ${y}) rotate(${rot})" filter="url(#soft)">${g}</g>`;
  }

  function sprig(x, y, ang, len) { // 绿色配草
    const a = ang * Math.PI / 180;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    let g = `<path d="M${x} ${y} Q${(x + ex) / 2 + r(-12, 12)} ${(y + ey) / 2 + r(-12, 12)} ${ex} ${ey}" stroke="#7fae4a" stroke-width="1.4" fill="none"/>`;
    for (let i = 0; i < 9; i++) {
      const t = 0.35 + i * 0.07;
      g += `<circle cx="${x + (ex - x) * t + r(-7, 7)}" cy="${y + (ey - y) * t + r(-7, 7)}" r="${r(1.8, 3.4)}" fill="${pick(['#a6cc5e', '#8dbb4a', '#c4dd84'])}"/>`;
    }
    return `<g>${g}</g>`;
  }

  // ---------- 摆花 ----------
  const sprigs = [];
  for (let i = 0; i < 26; i++) {
    const a = r(-200, 20);
    const rad = a * Math.PI / 180;
    sprigs.push(sprig(CX + Math.cos(rad) * RX * .85, CY + Math.sin(rad) * RY * .85, a + r(-15, 15), r(40, 80)));
  }

  // 玫瑰铺满圆顶
  for (let y = CY - RY + 14; y < CY + RY; y += 30) {
    for (let x = CX - RX + 14; x < CX + RX; x += 32) {
      const xx = x + r(-7, 7) + ((y / 30) % 2) * 14, yy = y + r(-7, 7);
      if (inDome(xx, yy, 10)) add(rose(xx, yy, r(20, 26), pick(ROSE)), xx, yy);
    }
  }
  for (let i = 0; i < 30; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 14)) add(mum(x, y, r(14, 19), pick(['#e8385f', '#d9234d', '#f04d74'])), x, y, 1);
  }

  // 百合：顶部白色、中间粉色、左右和底部蓝色（照片里最显眼的）
  const LILIES = [
    [300, 250, 70, 10, 'lw', '#e8e0c8'], [250, 285, 56, -30, 'lw', '#e8e0c8'], [350, 280, 54, 40, 'lw', '#e8e0c8'],
    [280, 440, 66, 15, 'lp', '#e79bb8'], [385, 430, 60, -20, 'lp', '#e79bb8'], [220, 480, 46, 35, 'lp', '#e79bb8'],
    [165, 350, 78, -20, 'lb', '#3f93d6'], [425, 345, 80, 25, 'lb', '#3f93d6'], [300, 575, 60, 5, 'lb', '#3f93d6'],
  ];
  LILIES.forEach(([x, y, s, rot, gr, v]) => add(lily(x, y, s, rot, gr, v), x, y, 2));

  for (let i = 0; i < 16; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 22)) add(daisy(x, y, r(15, 20)), x, y, 3);
  }
  for (let i = 0; i < 14; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 15)) add(chamomile(x, y, r(9, 12)), x, y, 3);
  }
  for (let i = 0; i < 12; i++) {
    const x = r(CX - RX, CX + RX), y = r(CY - RY, CY + RY);
    if (inDome(x, y, 15)) add(star(x, y, r(9, 13)), x, y, 3);
  }

  // 蕾丝包装：圆顶后面一圈扇贝边
  function scallop(rx, ry, n, bump) {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = -Math.PI * 1.04 + (i / n) * Math.PI * 1.08;
      const x = CX + Math.cos(t) * rx, y = CY + Math.sin(t) * ry;
      d += i === 0 ? `M${x} ${y}` : ` Q${CX + Math.cos(t - Math.PI / n) * (rx + bump)} ${CY + Math.sin(t - Math.PI / n) * (ry + bump)} ${x} ${y}`;
    }
    return d;
  }
  const wrapBack = `${scallop(RX + 30, RY + 28, 24, 18)} L${CX + 130} ${CY + RY + 12} L${CX + 34} 704 L${CX - 34} 704 L${CX - 130} ${CY + RY + 12} Z`;

  // 从中心往外、从上往下依次绽放
  flowers.sort((a, b) => a.extra - b.extra || Math.hypot(a.x - CX, a.y - CY + 80) - Math.hypot(b.x - CX, b.y - CY + 80));
  const n = flowers.length;
  const bloom = flowers.map((f, i) =>
    `<g class="bloom" style="--d:${(0.3 + (i / n) * 2.4).toFixed(2)}s">${f.svg}</g>`).join('');

  host.innerHTML = `
  <svg viewBox="0 0 600 800" role="img" aria-label="一大束鲜花">
    <defs>
      <radialGradient id="lb" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#bfe6fb"/><stop offset=".8" stop-color="#48b2ec"/><stop offset="1" stop-color="#2a7fd0"/></radialGradient>
      <radialGradient id="lw" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="#f4f0a8"/><stop offset=".3" stop-color="#fffdf5"/><stop offset="1" stop-color="#fff6f6"/></radialGradient>
      <radialGradient id="lp" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fbd0e0"/><stop offset="1" stop-color="#f39bbd"/></radialGradient>
      <pattern id="lace" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#fbf8f3"/>
        <circle cx="9" cy="9" r="5" fill="none" stroke="#e7ddd0" stroke-width="1"/>
        <circle cx="0" cy="0" r="2.2" fill="#ece3d6"/><circle cx="18" cy="0" r="2.2" fill="#ece3d6"/>
        <circle cx="0" cy="18" r="2.2" fill="#ece3d6"/><circle cx="18" cy="18" r="2.2" fill="#ece3d6"/>
        <path d="M9 4 L9 14 M4 9 L14 9" stroke="#f0e8dc" stroke-width=".8"/>
      </pattern>
      <filter id="soft"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#6b3040" flood-opacity=".22"/></filter>
      <filter id="wrapShadow"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity=".45"/></filter>
    </defs>

    <g class="wrap">
      <path d="${wrapBack}" fill="url(#lace)" stroke="#e2d6c6" stroke-width="2" filter="url(#wrapShadow)"/>
      <path d="${scallop(RX + 16, RY + 14, 30, 10)}" fill="none" stroke="#fff" stroke-width="3" opacity=".8" stroke-dasharray="2 5"/>
    </g>

    <g class="card">
      <line x1="300" y1="210" x2="300" y2="150" stroke="#c9a45a" stroke-width="2"/>
      <path d="M292 214 q8 -14 16 0 q-8 10 -8 14 q0 -4 -8 -14z" fill="none" stroke="#c9a45a" stroke-width="2"/>
      <rect x="226" y="60" width="148" height="104" rx="3" fill="#fbf6ef" stroke="#eadfcf"/>
      <text x="300" y="92" text-anchor="middle" class="card-t">MAY <tspan class="card-s">Your Day</tspan> BE FILLED</text>
      <text x="300" y="112" text-anchor="middle" class="card-t">WITH LOVE, JOY, AND ALL</text>
      <text x="300" y="132" text-anchor="middle" class="card-t">THINGS WONDERFUL!</text>
      <text x="300" y="153" text-anchor="middle" class="card-t small">♡ 2003 · 10 · 15</text>
    </g>

    <g class="sprigs">${sprigs.join('')}</g>
    <g class="flowers">${bloom}</g>

    <g class="ribbon">
      <path d="M290 704 C282 740 272 770 262 800" stroke="#f4a9c0" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M310 704 C318 742 328 772 338 800" stroke="#f7b8cb" stroke-width="16" fill="none" stroke-linecap="round"/>
      <ellipse cx="300" cy="700" rx="28" ry="12" fill="#f4a9c0"/>
    </g>
  </svg>`;
})();
