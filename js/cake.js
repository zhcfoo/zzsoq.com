/* 生日蛋糕：旋转木马八音盒（照着实物蛋糕画的）
 * 粉白渐变的底层蛋糕（花边、绑带格纹、垂花、蝴蝶结、裙边），上面是旋转木马：
 * 皇冠顶、贝壳纹穹顶、扇贝檐口缀珍珠和小灯、中柱、四匹独角兽随杆上下起伏、绕着中柱转。
 * 银色珍珠托盘，前面两根数字蜡烛。
 * Carousel.build(age) 画出来；Carousel.play(秒) 让八音盒转起来，结束后慢慢停回待机速度。 */
(function () {
  const f1 = (n) => Math.round(n * 10) / 10;
  const CX = 150;
  const TIER = { rx: 112, ry: 24, top: 222, bottom: 308 };
  const RING = { r: 78 };
  const HORSES = 4;

  const BOW = 'M0 0 C-6 -5 -9 1 -7 3 C-5 5 -2 2 0 0 C2 2 5 5 7 3 C9 1 6 -5 0 0Z';
  const SHELL = 'M0 0 C4.5 -3 4.5 -10 0 -13 C-4.5 -10 -4.5 -3 0 0Z';
  // 旋转木马独角兽（侧面，头朝右，原点在马鞍处）
  const HORSE = 'M-22 -4 C-22 -10 -10 -12 2 -11 C8 -11 12 -14 14 -20 C16 -26 20 -30 24 -29 L30 -24 C32 -22 31 -19 28 -19 C24 -19 21 -20 19 -18 C18 -14 18 -8 15 -4 C18 -3 24 -2 26 2 L22 4 C20 1 16 2 12 2 C6 4 -6 4 -12 3 C-14 8 -16 14 -17 20 L-21 20 C-21 14 -21 8 -22 3 C-26 2 -30 6 -32 10 C-30 2 -28 -2 -22 -4Z';
  const HORSE_LEG2 = 'M10 2 C13 6 16 8 19 9 L18 12 C14 11 10 8 7 3Z M-8 3 C-8 9 -9 14 -10 19 L-13 19 C-12 14 -12 9 -12 3Z';
  const MANE = 'M14 -20 C11 -22 12 -26 15 -27 C14 -24 17 -24 17 -27 C17 -30 21 -31 23 -30';

  function build(age) {
    const host = document.getElementById('cake');
    const digits = String(age).split('');
    let s = '';

    /* ---------- 托盘 ---------- */
    s += `<ellipse cx="${CX}" cy="322" rx="144" ry="34" fill="#000" opacity=".08" filter="url(#ckBlur)"/>`;
    s += `<ellipse cx="${CX}" cy="318" rx="142" ry="32" fill="url(#ckTray)"/>`;
    s += `<ellipse cx="${CX}" cy="316" rx="122" ry="25" fill="url(#ckTrayIn)"/>`;
    for (let a = 0; a < 360; a += 6.5) {
      const r = a * Math.PI / 180, sn = Math.sin(r);
      s += `<circle cx="${f1(CX + 138 * Math.cos(r))}" cy="${f1(318 + 30 * sn)}" r="${f1(3 + 1.1 * (sn + 1) / 2)}" fill="url(#ckSilverBead)"/>`;
    }

    /* ---------- 底层蛋糕 ---------- */
    const { rx, ry, top, bottom } = TIER;
    const side = `M${CX - rx} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${CX + rx} ${bottom} V${top} A${rx} ${ry} 0 0 1 ${CX - rx} ${top}Z`;
    s += `<path d="${side}" fill="url(#ckTier)"/>`;
    s += `<g clip-path="url(#ckSideClip)"><rect x="${CX - rx}" y="${top + 26}" width="${rx * 2}" height="52" fill="url(#ckLattice)" opacity=".75"/></g>`;
    s += `<path d="${side}" fill="url(#ckShade)"/>`;
    // 竖向裱花柱 + 顶上的蝴蝶结 + 柱间垂花
    const posts = [-64, -32, 0, 32, 64];
    const at = (deg, y0) => { const r = deg * Math.PI / 180; return [CX + rx * Math.sin(r), y0 + ry * Math.cos(r), Math.cos(r)]; };
    posts.forEach((d) => {
      const [x, yt, c] = at(d, top), [, yb] = at(d, bottom);
      s += `<line x1="${f1(x)}" y1="${f1(yt + 8)}" x2="${f1(x)}" y2="${f1(yb - 6)}" stroke="#fff" stroke-width="${f1(4.5 * c + 1)}" stroke-linecap="round" stroke-dasharray=".1 4.2" opacity=".95"/>`;
      s += `<use href="#ckBow" transform="translate(${f1(x)} ${f1(yt + 30)}) scale(${f1(.75 * c + .25)} .9)"/>`;
      s += `<use href="#ckBow" transform="translate(${f1(x)} ${f1(yb - 14)}) scale(${f1(.65 * c + .2)} .75)"/>`;
    });
    for (let i = 0; i < posts.length - 1; i++) {
      const [x1, y1] = at(posts[i], top), [x2, y2] = at(posts[i + 1], top), [xm, ym] = at((posts[i] + posts[i + 1]) / 2, top);
      s += `<path d="M${f1(x1)} ${f1(y1 + 12)} Q${f1(xm)} ${f1(ym + 40)} ${f1(x2)} ${f1(y2 + 12)}" fill="none" stroke="#f4c9cf" stroke-width="4.5" stroke-linecap="round"/>`;
      s += `<path d="M${f1(x1)} ${f1(y1 + 12)} Q${f1(xm)} ${f1(ym + 40)} ${f1(x2)} ${f1(y2 + 12)}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-dasharray=".1 4"/>`;
    }
    // 底部裙边
    let ruffle = '';
    for (let d = -88; d < 88; d += 8) {
      const [x1, y1] = at(d, bottom - 6), [x2, y2] = at(d + 8, bottom - 6), [xm, ym] = at(d + 4, bottom - 6);
      ruffle += `<path d="M${f1(x1)} ${f1(y1)} Q${f1(xm)} ${f1(ym + 9)} ${f1(x2)} ${f1(y2)}" fill="none" stroke="#fdf3f2" stroke-width="3.2" stroke-linecap="round"/>`;
    }
    s += ruffle;
    // 顶面 + 顶边一圈裱花珠
    s += `<ellipse cx="${CX}" cy="${top}" rx="${rx}" ry="${ry}" fill="url(#ckTop)"/>`;
    for (let a = 0; a < 360; a += 7) {
      const r = a * Math.PI / 180, sn = Math.sin(r);
      s += `<circle cx="${f1(CX + (rx - 2) * Math.cos(r))}" cy="${f1(top + (ry - 1) * sn)}" r="${f1(2.6 + 1 * (sn + 1) / 2)}" fill="url(#ckPearl)"/>`;
    }
    s += `<ellipse cx="${CX}" cy="${top}" rx="${RING.r + 6}" ry="${f1(ry * (RING.r + 6) / rx)}" fill="none" stroke="#f3d4d4" stroke-width="1.2" stroke-dasharray="1 3"/>`;

    /* ---------- 旋转木马 ---------- */
    s += `<g class="ck-ride"><g id="ck-back"></g>`;
    // 中柱
    s += `<rect x="128" y="120" width="44" height="${top - 120 + 4}" fill="url(#ckColumn)"/>`;
    s += `<path d="M136 128 V${top} M150 128 V${top + 3} M164 128 V${top}" stroke="#f1d7d4" stroke-width="1"/>`;
    s += `<ellipse cx="${CX}" cy="${top + 2}" rx="26" ry="6" fill="url(#ckPearlBand)"/>`;
    s += `<g id="ck-front"></g></g><g class="ck-canopy">`;
    // 穹顶底面、穹顶、贝壳纹、珠串、檐口
    s += `<ellipse cx="${CX}" cy="125" rx="82" ry="10" fill="#e9c7c6"/>`;
    s += `<path d="M64 118 C64 72 104 48 150 46 C196 48 236 72 236 118 Z" fill="url(#ckDome)"/>`;
    s += `<path d="M64 118 C64 72 104 48 150 46 C196 48 236 72 236 118 Z" fill="url(#ckDomeHi)"/>`;
    [-2, -1, 0, 1, 2].forEach((k) => {
      s += `<path d="M150 50 Q${150 + k * 28} 70 ${150 + k * 40} 112" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-dasharray=".1 3.6" opacity=".95"/>`;
    });
    [-60, -30, 0, 30, 60].forEach((x, i) => {
      const sc = 1 - Math.abs(x) / 160;
      s += `<use href="#ckShell" transform="translate(${CX + x * 1.15} ${100 - (2 - Math.abs(i - 2)) * 2}) scale(${f1(sc)})"/>`;
    });
    [-45, -15, 15, 45].forEach((x) => s += `<use href="#ckShell" transform="translate(${CX + x * 1.25} 80) scale(.75)"/>`);
    // 檐口扇贝边
    let val = `M64 112 L236 112 L236 118`;
    const sw = 172 / 8;
    const yb = (x) => 122 + 7 * (1 - ((x - CX) / 86) ** 2);
    for (let i = 8; i > 0; i--) {
      const x2 = 64 + (i - 1) * sw, xm = x2 + sw / 2;
      val += ` Q${f1(xm)} ${f1(yb(xm) + 9)} ${f1(x2)} ${f1(yb(x2))}`;
    }
    val += ' Z';
    s += `<path d="${val}" fill="url(#ckValance)"/>`;
    s += `<path d="M64 113 Q150 128 236 113" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-dasharray=".1 3.2"/>`;
    for (let i = 0; i <= 8; i++) {
      const x = 64 + i * sw;
      s += `<circle cx="${f1(x)}" cy="${f1(yb(x) + 1)}" r="2.8" fill="url(#ckPearl)"/>`;
      if (i % 2 === 1) s += `<use href="#ckBow" transform="translate(${f1(x)} ${f1(yb(x) - 4)}) scale(.8)"/>`;
      if (i > 0) { const xm = x - sw / 2; s += `<circle class="ck-bulb" cx="${f1(xm)}" cy="${f1(yb(xm) + 4)}" r="1.8" fill="#fff4cf"/>`; }
    }
    // 皇冠顶
    s += `<g transform="translate(150 46)">
      <ellipse cx="0" cy="0" rx="13" ry="4" fill="url(#ckPearlBand)"/>
      <path d="M-11 -2 L-12 -16 L-6 -10 L0 -20 L6 -10 L12 -16 L11 -2Z" fill="url(#ckDome)" stroke="#efd1cf" stroke-width=".8"/>
      <circle cx="-12" cy="-17" r="2.4" fill="url(#ckPearl)"/><circle cx="0" cy="-21" r="2.8" fill="url(#ckPearl)"/><circle cx="12" cy="-17" r="2.4" fill="url(#ckPearl)"/>
      <circle cx="0" cy="-9" r="3" fill="#f6c6d0" stroke="#fff" stroke-width=".8"/>
    </g></g>`;

    /* ---------- 数字蜡烛（在底层蛋糕前沿）---------- */
    s += `<g class="candles" id="candles">${digits.map((d, i) => {
      const x = CX + (i - (digits.length - 1) / 2) * 96, base = 244, y0 = base - 42;
      return `<g class="candle">
        <path d="M${x} ${y0 + 2} V${y0 + 12}" stroke="#6b5040" stroke-width="1.2"/>
        <g class="candle-fire"><circle cx="${x}" cy="${y0 - 5}" r="15" fill="url(#flameHalo)"/>
        <path class="candle-flame" d="M${x} ${y0 - 18} C${x + 6} ${y0 - 8} ${x + 6.5} ${y0 - 2} ${x} ${y0 + 4} C${x - 6.5} ${y0 - 2} ${x - 6} ${y0 - 8} ${x} ${y0 - 18}Z" fill="url(#flameG)"/></g>
        <text x="${x}" y="${base}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="500" font-size="48" style="font-variant-numeric: lining-nums" fill="url(#foilText)" stroke="#a47b3f" stroke-width=".5">${d}</text>
      </g>`;
    }).join('')}</g>`;

    host.innerHTML = `
    <svg viewBox="0 0 300 370" aria-hidden="true">
      <defs>
        <linearGradient id="ckTier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf5"/><stop offset=".35" stop-color="#fcebe8"/><stop offset="1" stop-color="#f1c2c7"/></linearGradient>
        <linearGradient id="ckShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c5a62" stop-opacity=".22"/><stop offset=".22" stop-color="#9c5a62" stop-opacity="0"/><stop offset=".72" stop-color="#9c5a62" stop-opacity="0"/><stop offset="1" stop-color="#9c5a62" stop-opacity=".24"/></linearGradient>
        <radialGradient id="ckTop" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#fffdfb"/><stop offset="1" stop-color="#f8e3e1"/></radialGradient>
        <linearGradient id="ckDome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbf8"/><stop offset=".55" stop-color="#fcebe8"/><stop offset="1" stop-color="#f3c6cb"/></linearGradient>
        <radialGradient id="ckDomeHi" cx="38%" cy="25%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
        <linearGradient id="ckValance" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde9e8"/><stop offset="1" stop-color="#f0bcc3"/></linearGradient>
        <linearGradient id="ckColumn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ecd2cd"/><stop offset=".35" stop-color="#fffaf6"/><stop offset=".7" stop-color="#f9ece7"/><stop offset="1" stop-color="#e5c6c2"/></linearGradient>
        <linearGradient id="ckHorse" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fbf0ec"/><stop offset="1" stop-color="#efd2cf"/></linearGradient>
        <linearGradient id="ckPole" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8925a"/><stop offset=".5" stop-color="#f3dfa9"/><stop offset="1" stop-color="#9c7338"/></linearGradient>
        <radialGradient id="ckPearl" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f8eeea"/><stop offset="1" stop-color="#dcc8c4"/></radialGradient>
        <linearGradient id="ckPearlBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e8d2cf"/></linearGradient>
        <radialGradient id="ckSilverBead" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#d9dce2"/><stop offset="1" stop-color="#9aa0aa"/></radialGradient>
        <linearGradient id="ckTray" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ccd3"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".65" stop-color="#d4d7dd"/><stop offset="1" stop-color="#f2f3f6"/></linearGradient>
        <radialGradient id="ckTrayIn" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#d7dae0"/></radialGradient>
        <pattern id="ckLattice" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0 L10 10 M10 0 L0 10" stroke="#e9b3bb" stroke-width=".9"/><circle cx="5" cy="5" r="1" fill="#fff"/></pattern>
        <clipPath id="ckSideClip"><path d="M${CX - 96} ${top} V${bottom} A${rx} ${ry} 0 0 0 ${CX + 96} ${bottom} V${top}Z"/></clipPath>
        <radialGradient id="flameG" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#fff1c2"/><stop offset=".75" stop-color="#ffb866"/><stop offset="1" stop-color="#ff9a5a" stop-opacity="0"/></radialGradient>
        <radialGradient id="flameHalo"><stop offset="0" stop-color="#ffe7a8" stop-opacity=".7"/><stop offset="1" stop-color="#ffe7a8" stop-opacity="0"/></radialGradient>
        <filter id="ckBlur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
        <g id="ckBow"><path d="${BOW}" fill="#f6c3cc" stroke="#ec9fb0" stroke-width=".6"/><path d="M0 0 L-3 6 M0 0 L3 6" stroke="#ec9fb0" stroke-width="1.2" stroke-linecap="round"/><circle r="1.5" fill="#fff"/></g>
        <g id="ckShell"><path d="${SHELL}" fill="#fdf1ef" stroke="#eccdcc" stroke-width=".7"/><path d="M0 -1 V-11 M-2 -2 L-2.6 -9 M2 -2 L2.6 -9" stroke="#eccdcc" stroke-width=".6"/></g>
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

    // 四匹马：每匹一组 = 立杆 + 马
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

    let theta = .5, speed = .22, bobAmp = .5, last = performance.now(), visible = false, t = 0, lit = 0;
    function place() {
      horses.forEach((h) => {
        const a = theta + h.i * Math.PI * 2 / HORSES;
        const sn = Math.sin(a), c = Math.cos(a);
        const x = CX + RING.r * sn;
        const depth = (c + 1) / 2;
        const sc = (.74 + .26 * depth) * 1.22;
        const bob = 6 * bobAmp * Math.sin(a * 2 + h.i);
        const y = 182 + 12 * c + bob;
        const sx = (c >= 0 ? 1 : -1) * Math.max(.28, Math.pow(Math.abs(c), .55)) * sc;
        h.body.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${sx.toFixed(3)} ${sc.toFixed(3)})`);
        h.pole.setAttribute('x1', f1(x)); h.pole.setAttribute('x2', f1(x));
        h.pole.setAttribute('y1', f1(124 + 8.5 * c)); h.pole.setAttribute('y2', f1(TIER.top + 16.7 * c));
        h.knob.setAttribute('cx', f1(x)); h.knob.setAttribute('cy', f1(y - 13 * sc));
        h.g.setAttribute('opacity', (.72 + .28 * depth).toFixed(2));
        const side = c >= 0 ? 1 : -1;
        if (side !== h.side) { (side > 0 ? front : back).appendChild(h.g); h.side = side; }
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
