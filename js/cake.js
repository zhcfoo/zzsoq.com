/* 生日蛋糕：旋转木马八音盒（参照实物蛋糕重新设计）
 * 所有装饰都按透视贴在曲面上：底层蛋糕是圆柱，侧面的格纹、垂花、裙边沿弧面弯曲；
 * 穹顶是半椭球，珠串和贝壳纹顺着经纬线走。
 * 结构（自上而下）：皇冠顶 → 穹顶 + 扇贝檐口（珍珠、蝴蝶结、小灯） → 中柱 + 四匹独角兽 → 底层蛋糕 → 银色珍珠托盘。
 * Carousel.build(age) 画出来；Carousel.play(秒) 让八音盒转起来，结束后慢慢停回待机速度。 */
(function () {
  const f1 = (n) => Math.round(n * 10) / 10;
  const rad = (d) => d * Math.PI / 180;
  const lerp = (a, b, t) => a + (b - a) * t;
  const CX = 150;
  const K = .22;                                   // 透视压扁比例（椭圆短轴 / 长轴）
  const TIER = { top: 236, H: 66, rx: 118 };       // 底层蛋糕
  TIER.ry = TIER.rx * K;
  const DRUM = { rx: 40, top: 112 };               // 中柱
  const DOME = { y: 118, a: 92, b: 58 };           // 穹顶（半椭球）
  DOME.ry = DOME.a * K;
  const RING = 74;                                 // 木马所在的圆
  const HORSES = 4;

  // 圆柱侧面上的点：经度 deg（0 = 正前方），离顶边的高度 h
  const side = (deg, h) => [CX + TIER.rx * Math.sin(rad(deg)), TIER.top + h + TIER.ry * Math.cos(rad(deg))];
  // 穹顶上的点：纬度 lat（0 = 檐口，90 = 顶），经度 lon
  const dome = (lat, lon) => [
    CX + DOME.a * Math.cos(rad(lat)) * Math.sin(rad(lon)),
    DOME.y - DOME.b * Math.sin(rad(lat)) + DOME.ry * Math.cos(rad(lat)) * Math.cos(rad(lon)),
  ];
  const line = (pts) => 'M' + pts.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(' L');
  const sample = (n, fn) => Array.from({ length: n + 1 }, (_, i) => fn(i / n));

  const BOW = 'M0 0 C-6 -5 -9 1 -7 3 C-5 5 -2 2 0 0 C2 2 5 5 7 3 C9 1 6 -5 0 0Z';
  const SHELL = 'M0 0 C4.5 -3 4.5 -10 0 -13 C-4.5 -10 -4.5 -3 0 0Z';
  // 旋转木马独角兽（侧面，头朝右，原点在马鞍处）
  const HORSE = 'M-22 -4 C-22 -10 -10 -12 2 -11 C8 -11 12 -14 14 -20 C16 -26 20 -30 24 -29 L30 -24 C32 -22 31 -19 28 -19 C24 -19 21 -20 19 -18 C18 -14 18 -8 15 -4 C18 -3 24 -2 26 2 L22 4 C20 1 16 2 12 2 C6 4 -6 4 -12 3 C-14 8 -16 14 -17 20 L-21 20 C-21 14 -21 8 -22 3 C-26 2 -30 6 -32 10 C-30 2 -28 -2 -22 -4Z';
  const HORSE_LEG2 = 'M10 2 C13 6 16 8 19 9 L18 12 C14 11 10 8 7 3Z M-8 3 C-8 9 -9 14 -10 19 L-13 19 C-12 14 -12 9 -12 3Z';
  const MANE = 'M14 -20 C11 -22 12 -26 15 -27 C14 -24 17 -24 17 -27 C17 -30 21 -31 23 -30';

  function build(age) {
    const host = document.getElementById('cake');
    const digits = String(age).split('');
    const { top, H, rx, ry } = TIER;
    let s = '';

    /* ================= 托盘 ================= */
    const TRAY = { cy: top + H + 12, rx: 144, ry: 144 * K };
    s += `<ellipse cx="${CX}" cy="${TRAY.cy + 8}" rx="${TRAY.rx + 4}" ry="${f1(TRAY.ry + 4)}" fill="#7a5040" opacity=".14" filter="url(#ckBlur)"/>`;
    s += `<ellipse cx="${CX}" cy="${TRAY.cy}" rx="${TRAY.rx}" ry="${f1(TRAY.ry)}" fill="url(#ckTray)"/>`;
    s += `<ellipse cx="${CX}" cy="${TRAY.cy - 2}" rx="${TRAY.rx - 18}" ry="${f1((TRAY.rx - 18) * K)}" fill="url(#ckTrayIn)"/>`;
    for (let a = 0; a < 360; a += 5.5) {
      const sn = Math.sin(rad(a));
      s += `<circle cx="${f1(CX + (TRAY.rx - 4) * Math.cos(rad(a)))}" cy="${f1(TRAY.cy + (TRAY.ry - 1) * sn)}" r="${f1(2.6 + 1.6 * (sn + 1) / 2)}" fill="url(#ckSilverBead)"/>`;
    }

    /* ================= 底层蛋糕 ================= */
    const [lx, ly] = side(-90, 0), [rxp] = side(90, 0);
    const sidePath = `M${f1(lx)} ${ly} V${ly + H} A${rx} ${f1(ry)} 0 0 0 ${f1(rxp)} ${ly + H} V${ly} A${rx} ${f1(ry)} 0 0 1 ${f1(lx)} ${ly}Z`;
    s += `<path d="${sidePath}" fill="url(#ckTier)"/>`;

    // 竖向裱花柱位置
    const posts = [-76, -46, -15, 15, 46, 76];
    // 格纹（束腰绑带）：在每两根柱子之间，沿圆柱面画斜线
    let lattice = '', dots = '';
    const hA = 24, hB = H - 12;
    for (let p = 0; p < posts.length - 1; p++) {
      const ua = rad(posts[p] + 4) * rx, ub = rad(posts[p + 1] - 4) * rx;   // 弧长坐标
      const step = 10;
      [1, -1].forEach((sgn) => {
        // 直线 h = c + sgn*u
        for (let c = -400; c < 400; c += step) {
          // 与矩形 [ua,ub]×[hA,hB] 求交
          const pts = [];
          const hAt = (u) => c + sgn * u, uAt = (h) => (h - c) * sgn;
          [[ua, hAt(ua)], [ub, hAt(ub)], [uAt(hA), hA], [uAt(hB), hB]].forEach(([u, h]) => {
            if (u >= ua - .01 && u <= ub + .01 && h >= hA - .01 && h <= hB + .01) pts.push([u, h]);
          });
          if (pts.length < 2) continue;
          pts.sort((m, n) => m[0] - n[0]);
          const [u0, h0] = pts[0], [u1, h1] = pts[pts.length - 1];
          if (Math.abs(u1 - u0) < 1) continue;
          lattice += `<path d="${line(sample(8, (t) => side(lerp(u0, u1, t) / rx * 180 / Math.PI, lerp(h0, h1, t))))}"/>`;
        }
      });
      // 交点上的小珍珠
      for (let c1 = -400; c1 < 400; c1 += step) {
        for (let c2 = -400; c2 < 400; c2 += step) {
          const u = (c2 - c1) / 2, h = (c1 + c2) / 2;
          if (u > ua + 2 && u < ub - 2 && h > hA + 2 && h < hB - 2) {
            const [x, y] = side(u / rx * 180 / Math.PI, h);
            dots += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(.5 + .45 * Math.cos(u / rx))}"/>`;
          }
        }
      }
    }
    s += `<g fill="none" stroke="#e9adb8" stroke-width=".8" opacity=".75">${lattice}</g><g fill="#fff">${dots}</g>`;

    // 柱间垂花（顶边下方挂下来的珠串）
    for (let i = 0; i < posts.length - 1; i++) {
      const pts = sample(14, (t) => side(lerp(posts[i], posts[i + 1], t), 7 + 12 * Math.sin(Math.PI * t)));
      s += `<path d="${line(pts)}" fill="none" stroke="#f2bfc8" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="${line(pts)}" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-dasharray=".1 3.4"/>`;
      // 每格底部的小蝴蝶结
      const mid = (posts[i] + posts[i + 1]) / 2, [bx, by] = side(mid, H - 9), c = Math.cos(rad(mid));
      s += `<use href="#ckBow" transform="translate(${f1(bx)} ${f1(by)}) scale(${f1(.7 * c)} .7)"/>`;
    }
    // 竖向裱花柱 + 顶上的蝴蝶结
    posts.forEach((d) => {
      const [x, y0] = side(d, 6), [, y1] = side(d, H - 4), c = Math.cos(rad(d));
      s += `<line x1="${f1(x)}" y1="${f1(y0)}" x2="${f1(x)}" y2="${f1(y1)}" stroke="#fffaf8" stroke-width="${f1(3.6 * c + .8)}" stroke-linecap="round" stroke-dasharray=".1 3.6"/>`;
      s += `<use href="#ckBow" transform="translate(${f1(x)} ${f1(y0 + 5)}) scale(${f1(.85 * c)} .85)"/>`;
    });
    // 底部裙边（沿底边的弧线）
    let ruffle = '';
    for (let d = -90; d < 90; d += 7.5) {
      const a = side(d, H - 3), b = side(d + 7.5, H - 3), m = side(d + 3.75, H + 4);
      ruffle += `M${f1(a[0])} ${f1(a[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b[0])} ${f1(b[1])} `;
    }
    s += `<path d="${ruffle}" fill="none" stroke="#fff4f3" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="${ruffle}" fill="none" stroke="#efb6c0" stroke-width=".8" stroke-linecap="round" transform="translate(0 1.6)"/>`;
    // 侧面明暗
    s += `<path d="${sidePath}" fill="url(#ckShade)"/>`;

    // 顶面 + 顶边一圈裱花珠 + 贝壳边
    s += `<ellipse cx="${CX}" cy="${top}" rx="${rx}" ry="${f1(ry)}" fill="url(#ckTop)"/>`;
    for (let a = 0; a < 360; a += 6) {
      const sn = Math.sin(rad(a));
      s += `<circle cx="${f1(CX + (rx - 1.5) * Math.cos(rad(a)))}" cy="${f1(top + (ry - .5) * sn)}" r="${f1(2.3 + 1.4 * (sn + 1) / 2)}" fill="url(#ckPearl)"/>`;
    }
    let shellEdge = '';
    for (let d = -84; d < 84; d += 6) {
      const a = side(d, 2.5), b = side(d + 6, 2.5), m = side(d + 3, 6.5);
      shellEdge += `M${f1(a[0])} ${f1(a[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b[0])} ${f1(b[1])} `;
    }
    s += `<path d="${shellEdge}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>`;

    /* ================= 旋转木马 ================= */
    s += `<g class="ck-ride"><g id="ck-back"></g>`;
    const dl = CX - DRUM.rx, dr = CX + DRUM.rx, dry = DRUM.rx * K;
    s += `<path d="M${dl} ${DRUM.top} V${top} A${DRUM.rx} ${f1(dry)} 0 0 0 ${dr} ${top} V${DRUM.top}Z" fill="url(#ckColumn)"/>`;
    [-60, -30, 0, 30, 60].forEach((d) => {
      const x = CX + DRUM.rx * Math.sin(rad(d));
      s += `<line x1="${f1(x)}" y1="${DRUM.top + 10}" x2="${f1(x)}" y2="${f1(top + dry * Math.cos(rad(d)) - 6)}" stroke="#f0d6d3" stroke-width="${f1(1.4 * Math.cos(rad(d)) + .3)}"/>`;
    });
    for (let a = 0; a <= 180; a += 12) {
      const sn = Math.sin(rad(a));
      s += `<circle cx="${f1(CX + (DRUM.rx + 1) * Math.cos(rad(a)))}" cy="${f1(top + dry * sn)}" r="${f1(2.2 + .8 * sn)}" fill="url(#ckPearl)"/>`;
    }
    s += `<g id="ck-front"></g></g>`;

    /* ================= 穹顶 ================= */
    s += `<g class="ck-canopy">`;
    const [dlx] = dome(0, -90), [drx] = dome(0, 90);
    s += `<path d="M${f1(dlx)} ${DOME.y} A${DOME.a} ${DOME.b} 0 0 1 ${f1(drx)} ${DOME.y} A${DOME.a} ${f1(DOME.ry)} 0 0 1 ${f1(dlx)} ${DOME.y}Z" fill="url(#ckDome)"/>`;
    s += `<path d="M${f1(dlx)} ${DOME.y} A${DOME.a} ${DOME.b} 0 0 1 ${f1(drx)} ${DOME.y} A${DOME.a} ${f1(DOME.ry)} 0 0 1 ${f1(dlx)} ${DOME.y}Z" fill="url(#ckDomeHi)"/>`;
    // 经线珠串
    const mer = [-64, -32, 0, 32, 64];
    mer.forEach((lon) => {
      s += `<path d="${line(sample(16, (t) => dome(lerp(6, 84, t), lon)))}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray=".1 3.3"/>`;
    });
    // 经线之间的垂花 + 贝壳
    for (let i = 0; i < mer.length - 1; i++) {
      const pts = sample(12, (t) => dome(40 - 9 * Math.sin(Math.PI * t), lerp(mer[i], mer[i + 1], t)));
      s += `<path d="${line(pts)}" fill="none" stroke="#f3c3cb" stroke-width="2.2" stroke-linecap="round"/>`;
      s += `<path d="${line(pts)}" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-dasharray=".1 2.8"/>`;
      const lon = (mer[i] + mer[i + 1]) / 2, [x, y] = dome(16, lon), c = Math.cos(rad(lon));
      s += `<use href="#ckShell" transform="translate(${f1(x)} ${f1(y)}) scale(${f1(1.05 * c)} 1.05)"/>`;
      const [x2, y2] = dome(56, lon);
      s += `<use href="#ckShell" transform="translate(${f1(x2)} ${f1(y2)}) scale(${f1(.7 * c)} .7)"/>`;
    }
    // 檐口：沿穹顶边缘的扇贝裙
    const rim = (lon, dy = 0) => { const [x, y] = dome(0, lon); return [x, y + dy]; };
    const N = 12, lonAt = (i) => -90 + 180 * i / N;
    let val = line(sample(36, (t) => rim(lerp(-90, 90, t))));
    for (let i = N; i > 0; i--) {
      const a = rim(lonAt(i), 7), b = rim(lonAt(i - 1), 7), m = rim((lonAt(i) + lonAt(i - 1)) / 2, 16);
      val += ` L${f1(a[0])} ${f1(a[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b[0])} ${f1(b[1])}`;
    }
    s += `<path d="${val} Z" fill="url(#ckValance)"/>`;
    s += `<path d="${line(sample(36, (t) => rim(lerp(-88, 88, t), 1)))}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray=".1 3"/>`;
    for (let i = 0; i <= N; i++) {
      const lon = lonAt(i), c = Math.cos(rad(lon)), [x, y] = rim(lon, 7);
      if (c < .15) continue;
      s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.8 + 1.2 * c)}" fill="url(#ckPearl)"/>`;
      if (i % 2 === 0) s += `<use href="#ckBow" transform="translate(${f1(x)} ${f1(y - 3)}) scale(${f1(.8 * c)} .8)"/>`;
      if (i > 0) {
        const ml = (lon + lonAt(i - 1)) / 2, [bx, by] = rim(ml, 12.5);
        if (Math.cos(rad(ml)) > .2) s += `<circle class="ck-bulb" cx="${f1(bx)}" cy="${f1(by)}" r="1.7" fill="#fff4cf"/>`;
      }
    }
    // 皇冠顶
    const crownY = DOME.y - DOME.b + 1;
    s += `<g transform="translate(${CX} ${crownY})">
      <ellipse cx="0" cy="0" rx="14" ry="4.5" fill="url(#ckPearlBand)"/>
      <path d="M-12 -2 L-13 -17 L-6.5 -11 L0 -22 L6.5 -11 L13 -17 L12 -2Z" fill="url(#ckDome)" stroke="#efd1cf" stroke-width=".8"/>
      <circle cx="-13" cy="-18" r="2.4" fill="url(#ckPearl)"/><circle cx="0" cy="-23" r="2.9" fill="url(#ckPearl)"/><circle cx="13" cy="-18" r="2.4" fill="url(#ckPearl)"/>
      <circle cx="0" cy="-9.5" r="3.1" fill="#f6c6d0" stroke="#fff" stroke-width=".8"/>
      <path d="M-11 -4 Q0 -1 11 -4" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-dasharray=".1 2.6"/>
    </g></g>`;

    /* ================= 数字蜡烛（底层蛋糕前沿）================= */
    s += `<g class="candles" id="candles">${digits.map((d, i) => {
      const x = CX + (i - (digits.length - 1) / 2) * 128, base = top + 21, y0 = base - 40;
      return `<g class="candle">
        <path d="M${x} ${y0 + 2} V${y0 + 12}" stroke="#6b5040" stroke-width="1.2"/>
        <g class="candle-fire"><circle cx="${x}" cy="${y0 - 5}" r="15" fill="url(#flameHalo)"/>
        <path class="candle-flame" d="M${x} ${y0 - 18} C${x + 6} ${y0 - 8} ${x + 6.5} ${y0 - 2} ${x} ${y0 + 4} C${x - 6.5} ${y0 - 2} ${x - 6} ${y0 - 8} ${x} ${y0 - 18}Z" fill="url(#flameG)"/></g>
        <text x="${x}" y="${base}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="500" font-size="46" style="font-variant-numeric: lining-nums" fill="url(#foilText)" stroke="#a47b3f" stroke-width=".5">${d}</text>
      </g>`;
    }).join('')}</g>`;

    host.innerHTML = `
    <svg viewBox="0 26 300 330" aria-hidden="true">
      <defs>
        <linearGradient id="ckTier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbf8"/><stop offset=".45" stop-color="#fdf0ee"/><stop offset="1" stop-color="#f5cdd3"/></linearGradient>
        <linearGradient id="ckShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c5a62" stop-opacity=".26"/><stop offset=".2" stop-color="#9c5a62" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".12"/><stop offset=".8" stop-color="#9c5a62" stop-opacity="0"/><stop offset="1" stop-color="#9c5a62" stop-opacity=".28"/></linearGradient>
        <radialGradient id="ckTop" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#fffdfb"/><stop offset="1" stop-color="#f9e6e3"/></radialGradient>
        <linearGradient id="ckDome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#fff7f5"/><stop offset="1" stop-color="#f8dde1"/></linearGradient>
        <radialGradient id="ckDomeHi" cx="36%" cy="22%" r="58%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="ckValance" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4f3"/><stop offset="1" stop-color="#f3c7ce"/></linearGradient>
        <linearGradient id="ckColumn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8cbc7"/><stop offset=".32" stop-color="#fffaf6"/><stop offset=".68" stop-color="#f9ebe7"/><stop offset="1" stop-color="#e0c0bc"/></linearGradient>
        <linearGradient id="ckHorse" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fbf0ec"/><stop offset="1" stop-color="#efd2cf"/></linearGradient>
        <linearGradient id="ckPole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8925a"/><stop offset=".5" stop-color="#f3dfa9"/><stop offset="1" stop-color="#9c7338"/></linearGradient>
        <radialGradient id="ckPearl" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f8eeea"/><stop offset="1" stop-color="#dcc8c4"/></radialGradient>
        <linearGradient id="ckPearlBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e8d2cf"/></linearGradient>
        <radialGradient id="ckSilverBead" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#d9dce2"/><stop offset="1" stop-color="#9aa0aa"/></radialGradient>
        <linearGradient id="ckTray" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ccd3"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".65" stop-color="#d4d7dd"/><stop offset="1" stop-color="#f2f3f6"/></linearGradient>
        <radialGradient id="ckTrayIn" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#d7dae0"/></radialGradient>
        <radialGradient id="flameG" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fff1c2"/><stop offset=".75" stop-color="#ffb866"/><stop offset="1" stop-color="#ff9a5a" stop-opacity="0"/></radialGradient>
        <radialGradient id="flameHalo"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient>
        <filter id="ckBlur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
        <g id="ckBow"><path d="${BOW}" fill="#f6c3cc" stroke="#ec9fb0" stroke-width=".6"/><path d="M0 0 L-3 6 M0 0 L3 6" stroke="#ec9fb0" stroke-width="1.2" stroke-linecap="round"/><circle r="1.5" fill="#fff"/></g>
        <g id="ckShell"><path d="${SHELL}" fill="#fdf2f0" stroke="#eccdcc" stroke-width=".7"/><path d="M0 -1 V-11 M-2 -2 L-2.6 -9 M2 -2 L2.6 -9" stroke="#eccdcc" stroke-width=".6"/></g>
        <g id="ckHorseShape">
          <path d="${HORSE_LEG2}" fill="#f4e2df" stroke="#e2c4c0" stroke-width=".6"/>
          <path d="${HORSE}" fill="url(#ckHorse)" stroke="#e2c4c0" stroke-width=".8" stroke-linejoin="round"/>
          <path d="${MANE}" fill="none" stroke="#f3c5cf" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M-31 9 C-33 5 -32 0 -28 -1" fill="none" stroke="#f3c5cf" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M25 -29 L29.5 -38 L27.5 -28Z" fill="#f2dca6" stroke="#d8b877" stroke-width=".5"/>
          <path d="M-8 -11 C-6 -15 4 -15 6 -11 C4 -7 -6 -7 -8 -11Z" fill="#f5b8c6" stroke="#d9b877" stroke-width=".7"/>
          <path d="M-1 -8 V-1" stroke="#d9b877" stroke-width=".8"/>
          <path d="M20 -24 L28 -21" stroke="#d9b877" stroke-width=".8"/>
          <circle cx="24.5" cy="-24.5" r="1.1" fill="#6b4a4a"/>
        </g>
      </defs>
      ${s}
    </svg>`;

    /* ================= 转动 ================= */
    const back = host.querySelector('#ck-back'), front = host.querySelector('#ck-front');
    const NS = 'http://www.w3.org/2000/svg';
    const horses = Array.from({ length: HORSES }, (_, i) => {
      const g = document.createElementNS(NS, 'g');
      const pole = document.createElementNS(NS, 'line');
      pole.setAttribute('stroke', 'url(#ckPole)'); pole.setAttribute('stroke-width', '3'); pole.setAttribute('stroke-linecap', 'round');
      const knob = document.createElementNS(NS, 'circle');
      knob.setAttribute('r', '2.6'); knob.setAttribute('fill', 'url(#ckPearl)');
      const body = document.createElementNS(NS, 'use');
      body.setAttribute('href', '#ckHorseShape');
      g.append(pole, body, knob);
      front.appendChild(g);
      return { g, pole, knob, body, i, side: 1 };
    });
    const bulbs = Array.from(host.querySelectorAll('.ck-bulb'));
    const ringRy = RING * K, poleTopRy = DOME.ry * RING / DOME.a;

    let theta = .5, speed = .22, bobAmp = .5, last = performance.now(), visible = false, t = 0, lit = 0;
    function place() {
      horses.forEach((h) => {
        const a = theta + h.i * Math.PI * 2 / HORSES;
        const sn = Math.sin(a), c = Math.cos(a);
        const x = CX + RING * sn;
        const depth = (c + 1) / 2;
        const sc = (.78 + .22 * depth) * 1.42;
        const bob = 6 * bobAmp * Math.sin(a * 2 + h.i);
        const ground = top + ringRy * c;
        const y = ground - 42 + bob;
        const sx = (c >= 0 ? 1 : -1) * Math.max(.28, Math.pow(Math.abs(c), .55)) * sc;
        h.body.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${sx.toFixed(3)} ${sc.toFixed(3)})`);
        h.pole.setAttribute('x1', f1(x)); h.pole.setAttribute('x2', f1(x));
        h.pole.setAttribute('y1', f1(DOME.y + poleTopRy * c)); h.pole.setAttribute('y2', f1(ground));
        h.knob.setAttribute('cx', f1(x)); h.knob.setAttribute('cy', f1(y - 13 * sc));
        h.g.setAttribute('opacity', (.74 + .26 * depth).toFixed(2));
        const sideNow = c >= 0 ? 1 : -1;
        if (sideNow !== h.side) { (sideNow > 0 ? front : back).appendChild(h.g); h.side = sideNow; }
      });
      if (lit > 0) bulbs.forEach((b, k) => b.setAttribute('opacity', (.45 + .55 * lit * Math.abs(Math.sin(t * 3 + k * .9))).toFixed(2)));
    }
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now; t += dt;
      theta += speed * dt;
      if (visible) place();
      requestAnimationFrame(frame);
    }
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }).observe(host);
    place();
    requestAnimationFrame(frame);

    const state = { get speed() { return speed; }, set speed(v) { speed = v; }, get bob() { return bobAmp; }, set bob(v) { bobAmp = v; }, get lit() { return lit; }, set lit(v) { lit = v; } };
    window.Carousel.state = state;
    window.Carousel.play = (sec) => {
      if (!window.gsap) return;
      gsap.killTweensOf(state);
      gsap.timeline()
        .to(state, { speed: 1.15, bob: 1, lit: 1, duration: 2.2, ease: 'power2.inOut' })
        .to(state, { speed: .22, bob: .5, lit: 0, duration: 3.5, ease: 'power2.inOut', onComplete: () => bulbs.forEach((b) => b.setAttribute('opacity', '1')) }, `+=${Math.max(0, sec - 2.2)}`);
    };
  }

  window.Carousel = { build };
})();
