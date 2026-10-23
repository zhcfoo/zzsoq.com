/* ============================================================
 *  手绘插画：给没有照片的拍立得 / 回忆卡片用
 *  在 config.js 里写 art: '名字' 即可，滑到时会先晕染上色、再一笔一笔描线
 *  可用：baby 襁褓婴儿 · sea 海边 · exam 试卷与嫩芽 · ginkgo 两片银杏 ·
 *        call 一通电话 · confess 表白信 · days73 七十三天 · kiss 亲亲 · everyday 日常
 * ============================================================ */
(function () {
  let seed = 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const jit = (a) => (rnd() - .5) * 2 * a;
  const n = (v) => Math.round(v * 10) / 10;

  const PINK = '#f9d2dc', ROSE = '#f4b9c8', LAV = '#e6ddf4', SKY = '#d5e8f5', BUTTER = '#f8e5b6', MINT = '#d6ebd8', PEACH = '#fbdcc9', PAPER = '#fffcf8', HAIR = '#dfc5bb';

  /* ---------- 笔触 ---------- */
  // 穿过各点的平滑曲线（Catmull-Rom）
  function curve(pts, closed) {
    const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${n(p[1][0])} ${n(p[1][1])}`;
    for (let i = 1; i < p.length - 2; i++) {
      const a = p[i - 1], b = p[i], c = p[i + 1], e = p[i + 2];
      d += `C${n(b[0] + (c[0] - a[0]) / 6)} ${n(b[1] + (c[1] - a[1]) / 6)} ${n(c[0] - (e[0] - b[0]) / 6)} ${n(c[1] - (e[1] - b[1]) / 6)} ${n(c[0])} ${n(c[1])}`;
    }
    return d + (closed ? 'Z' : '');
  }
  // 手画的圆：半径微微起伏，收笔略过起点
  function ring(cx, cy, rx, ry = rx, w = .045, over = 1.07) {
    const k = 12, a0 = rnd() * 6.283, pts = [];
    for (let i = 0; i <= k; i++) {
      const a = a0 + (i / k) * 6.283 * over, r = 1 + jit(w);
      pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
    }
    return curve(pts);
  }
  // 晕染色块：闭合、更随意
  function blob(cx, cy, rx, ry = rx, w = .09) {
    const k = 9, a0 = rnd() * 6.283, pts = [];
    for (let i = 0; i < k; i++) {
      const a = a0 + (i / k) * 6.283, r = 1 + jit(w);
      pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
    }
    return curve(pts, true);
  }
  const line = (x1, y1, x2, y2, b = 1.2) => `M${n(x1)} ${n(y1)}Q${n((x1 + x2) / 2 + jit(b))} ${n((y1 + y2) / 2 + jit(b))} ${n(x2)} ${n(y2)}`;
  // 折线：每条边微微弯一点
  function poly(pts, closed = true) {
    const all = closed ? [...pts, pts[0]] : pts;
    let d = `M${n(all[0][0])} ${n(all[0][1])}`;
    for (let i = 1; i < all.length; i++) {
      const a = all[i - 1], b = all[i];
      d += `Q${n((a[0] + b[0]) / 2 + jit(1))} ${n((a[1] + b[1]) / 2 + jit(1))} ${n(b[0])} ${n(b[1])}`;
    }
    return d;
  }
  const box = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  function rbox(x, y, w, h, r) {
    return curve([[x + r, y], [x + w - r, y], [x + w - r * .3, y + r * .3], [x + w, y + r], [x + w, y + h - r], [x + w - r * .3, y + h - r * .3],
      [x + w - r, y + h], [x + r, y + h], [x + r * .3, y + h - r * .3], [x, y + h - r], [x, y + r], [x + r * .3, y + r * .3]], true);
  }
  const heart = (x, y, s) => `M${n(x)} ${n(y + s * .95)}C${n(x - s * 1.5)} ${n(y + s * .05)} ${n(x - s * .95 + jit(s * .06))} ${n(y - s * 1.05)} ${n(x)} ${n(y - s * .3)}C${n(x + s * .95 + jit(s * .06))} ${n(y - s * 1.05)} ${n(x + s * 1.5)} ${n(y + s * .05)} ${n(x)} ${n(y + s * .95)}`;
  const spark = (x, y, s) => { const q = s * .16; return `M${x} ${y - s}Q${x + q} ${y - q} ${x + s} ${y}Q${x + q} ${y + q} ${x} ${y + s}Q${x - q} ${y + q} ${x - s} ${y}Q${x - q} ${y - q} ${x} ${y - s}Z`; };
  // 沿曲线绕圈的电话线
  function coil(x0, y0, cx, cy, x1, y1, loops, b) {
    const L = Math.hypot(cx - x0, cy - y0) + Math.hypot(x1 - cx, y1 - cy), a = L / (loops * 6.283), pts = [];
    const at = (t) => [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1];
    for (let i = 0, N = loops * 10; i <= N; i++) {
      const f = (i / N) * loops * 6.283, t = Math.min(1, Math.max(0, (a * f - b * Math.sin(f) * .9) / L));
      const p = at(t), q = at(Math.min(1, t + .01)), r = at(Math.max(0, t - .01));
      const tx = q[0] - r[0], ty = q[1] - r[1], l = Math.hypot(tx, ty) || 1;
      const off = -b * Math.cos(f) + b;
      pts.push([p[0] - (ty / l) * off, p[1] + (tx / l) * off]);
    }
    return curve(pts);
  }

  /* ---------- 元素 ---------- */
  const I = (d, c = '') => `<path class="i${c ? ' ' + c : ''}" d="${d}"/>`;
  const W = (d, fill, c = '') => `<path class="w${c ? ' ' + c : ''}" fill="${fill}" d="${d}"/>`;
  const F = (d, c = '') => `<path class="f${c ? ' ' + c : ''}" d="${d}"/>`;
  const S = (d) => `<path class="s" d="${d}"/>`;
  const T = (x, y, txt, c, size, rot = 0) => `<text class="t ${c}" x="${x}" y="${y}" font-size="${size}" text-anchor="middle"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${txt}</text>`;
  const g = (tr, items) => `<g transform="${tr}">${items.join('')}</g>`;
  const hi = (x, y, r) => `<circle class="hi" cx="${x}" cy="${y}" r="${r}"/>`;

  /* ---------- 画面 ---------- */
  const SCENES = {
    // 2003：哭声很响，眼睛很亮
    baby: [200, () => [
      W(blob(100, 112, 62, 58), PINK), W(blob(152, 56, 15), BUTTER), W(blob(50, 150, 12), LAV),
      I(curve([[70, 108], [66, 76], [82, 58], [100, 54], [118, 58], [134, 76], [130, 108]])),
      I(curve([[70, 106], [68, 134], [80, 158], [100, 170], [120, 158], [132, 134], [130, 106]])),
      I(curve([[76, 122], [94, 132], [112, 130], [127, 117]])),
      I(curve([[86, 146], [100, 151], [114, 147], [122, 138]]), 'thin'),
      I(ring(100, 92, 21, 19)),
      W(blob(86, 100, 4.6, 2.6), ROSE), W(blob(114, 100, 4.6, 2.6), ROSE),
      F(blob(92, 90, 3.6, 4.2, .04)), F(blob(108, 90, 3.6, 4.2, .04)), hi(93.3, 88.4, 1.3), hi(109.3, 88.4, 1.3),
      I(ring(100, 103.5, 3.4, 3, .06, 1.03), 'thin'),
      I(line(137, 72, 146, 66), 'thin'), I(line(141, 84, 151, 82), 'thin'), I(line(138, 95, 147, 99), 'thin'),
      T(156, 62, '哇', 'cn', 15, 12),
      S(spark(48, 60, 6)), S(spark(162, 138, 5)), S(spark(58, 150, 3.6)), S(spark(144, 40, 3.4)),
    ]],
    // 2006：在海边追着浪花跑
    sea: [200, () => [
      W('M0 118C30 108 52 128 82 118S134 110 160 120 200 114 200 114V200H0Z', SKY),
      W('M0 166C50 156 120 178 200 160V200H0Z', BUTTER),
      W(blob(152, 50, 17), BUTTER),
      I(ring(152, 50, 12), 'g'),
      ...Array.from({ length: 8 }, (_, k) => { const a = k * .785 + .2; return I(line(152 + Math.cos(a) * 17, 50 + Math.sin(a) * 17, 152 + Math.cos(a) * 23, 50 + Math.sin(a) * 23, .3), 'g thin'); }),
      I(curve([[4, 122], [22, 112], [40, 114], [54, 121], [70, 126], [86, 114], [104, 116], [120, 124], [138, 118], [158, 112], [176, 119], [196, 114]]), 'b'),
      I(curve([[54, 121], [55, 112], [64, 110], [67, 116], [61, 119]]), 'b thin'),
      I(curve([[150, 115], [152, 107], [161, 106], [163, 112], [157, 114]]), 'b thin'),
      I(curve([[10, 142], [30, 134], [48, 137], [62, 143], [80, 136], [100, 138], [118, 144], [140, 139], [160, 142]]), 'b thin'),
      W(curve([[72, 155], [65, 163], [61, 174], [72, 176], [83, 173], [79, 163]], true), PINK),
      I(ring(72, 146, 7.5)),
      I(curve([[66, 141], [60, 139], [57, 145]]), 'thin'), I(curve([[78, 141], [84, 139], [87, 145]]), 'thin'),
      I(curve([[72, 154], [65, 163], [61, 174], [72, 176], [83, 173], [79, 163], [72, 154]])),
      I(line(67, 175, 64, 184)), I(line(77, 175, 80, 183)),
      I(line(67, 159, 58, 151)), I(line(77, 159, 86, 150)),
      F(blob(48, 184, 2.3, 3.3), 'lt'), F(blob(38, 178, 2.3, 3.3), 'lt'), F(blob(28, 186, 2.3, 3.3), 'lt'), F(blob(18, 179, 2.3, 3.3), 'lt'),
      W(blob(151, 180, 11, 7), PEACH),
      I(curve([[140, 184], [141, 173], [150, 168], [159, 173], [160, 184]])), I(line(140, 184, 160, 184, .4)),
      I(line(150, 183, 150, 171, .3), 'thin'), I(line(150, 183, 144, 174, .3), 'thin'), I(line(150, 183, 156, 174, .3), 'thin'),
      I('M44 56Q49 49 54 56Q59 49 64 56', 'thin'), I('M72 42Q76 37 80 42Q84 37 88 42', 'thin'),
    ]],
    // 2018：在很多张试卷里悄悄长大
    exam: [200, () => [
      W(blob(100, 124, 66, 54), LAV), W(blob(122, 44, 18, 14), MINT),
      g('rotate(-11 98 124)', [W(box(56, 80, 80, 96), PAPER, 'pp'), I(box(56, 80, 80, 96))]),
      g('rotate(8 104 122)', [W(box(64, 76, 80, 96), PAPER, 'pp'), I(box(64, 76, 80, 96))]),
      g('rotate(-3 100 120)', [
        W(box(58, 72, 84, 98), PAPER, 'pp'), I(box(58, 72, 84, 98)),
        I(line(68, 88, 98, 88, .4)),
        ...[104, 114, 124, 134, 144, 154].map((y) => I(line(68, y, 130 - (y % 20 === 4 ? 14 : 0), y, .5), 'thin')),
        I(ring(122, 87, 14, 10), 'r'), T(122, 92, '100', 'en r', 15, -6),
      ]),
      I(curve([[98, 73], [100, 63], [98, 54], [100, 45]]), 'gr'),
      W(curve([[99, 54], [91, 53], [85, 46], [85, 40], [93, 42], [99, 54]], true), MINT),
      I(curve([[99, 54], [91, 53], [85, 46], [85, 40], [93, 42], [98, 49], [99, 54]]), 'gr'),
      I(curve([[100, 47], [106, 40], [116, 37], [123, 40], [117, 47], [107, 50], [100, 47]]), 'gr'),
      g('rotate(-45 156 166)', [
        W(box(132, 160, 50, 11), BUTTER), I(box(132, 160, 50, 11)),
        I(poly([[132, 160], [119, 165.5], [132, 171]], false)), F(poly([[123, 164], [119, 165.5], [123, 167]])),
        I(line(175, 160, 175, 171, .2), 'thin'),
      ]),
      S(spark(132, 58, 5.5)), S(spark(66, 56, 4.5)), S(spark(162, 96, 5)), S(spark(44, 120, 3.4)),
    ]],
    // 2024：然后，在秋天遇见了我
    ginkgo: [200, () => {
      const leaf = (s = 1) => {
        const P = (pts) => pts.map(([x, y]) => [x * s, y * s]);
        const fan = curve(P([[0, -24], [-14, -34], [-28, -50], [-36, -64], [-29, -74], [-15, -79], [-4, -73], [0, -65], [4, -73], [15, -79], [29, -74], [36, -64], [28, -50], [14, -34], [0, -24]]));
        const veins = [[-25, -66], [-12, -72], [12, -72], [25, -66]].map(([x, y]) => I(line(0, -27 * s, x * s * .9, y * s * .9, .4), 'g thin'));
        return [W(fan, BUTTER), I(fan), I(line(0, 0, 0, -24 * s, .6)), ...veins];
      };
      return [
        W(blob(100, 108, 72, 64), PEACH),
        g('translate(114 178) rotate(-42)', leaf(.9)),
        g('translate(86 178) rotate(40)', leaf(.87)),
        g('translate(42 66) rotate(40)', leaf(.34)), g('translate(166 52) rotate(-24)', leaf(.3)), g('translate(170 160) rotate(70)', leaf(.26)),
        W(heart(101, 70, 10), ROSE), I(heart(100, 68, 9), 'r'),
        T(100, 30, '10 · 08', 'en', 13),
        S(spark(130, 44, 4.6)), S(spark(58, 120, 3.6)), S(spark(152, 120, 4)),
      ];
    }],

    // 连接我们的一通电话
    call: [250, () => {
      const phone = (cx, cy, rot, face) => g(`rotate(${rot} ${cx} ${cy})`, [
        W(rbox(cx - 22, cy - 40, 44, 80, 8), PAPER, 'pp'), I(rbox(cx - 22, cy - 40, 44, 80, 8)),
        I(rbox(cx - 17, cy - 31, 34, 60, 3), 'thin'), I(line(cx - 5, cy - 35.5, cx + 5, cy - 35.5, .2), 'thin'),
        W(blob(cx, cy - 15, 8.5), face), I(ring(cx, cy - 15, 7.5), 'thin'),
        I(line(cx - 8, cy - 1, cx + 8, cy - 1, .3), 'thin'), I(line(cx - 5, cy + 5, cx + 5, cy + 5, .3), 'thin'),
        W(blob(cx - 8, cy + 18, 4.2), MINT), I(ring(cx - 8, cy + 18, 3.8), 'thin'),
        W(blob(cx + 8, cy + 18, 4.2), ROSE), I(ring(cx + 8, cy + 18, 3.8), 'thin'),
      ]);
      return [
        W(blob(100, 130, 74, 84), LAV), W(blob(52, 200, 28, 22), PINK), W(blob(150, 54, 26, 20), SKY),
        I(coil(66, 138, 74, 112, 92, 120, 4, 4.2), 'thin'),
        I(coil(110, 122, 124, 132, 134, 126, 3, 4.2), 'thin'),
        W(heart(102, 122, 12), ROSE), I(heart(101, 120, 11), 'r'),
        phone(56, 178, -14, PINK), phone(146, 86, 12, SKY),
        I('M174 48Q181 55 177 64', 'thin'), I('M180 40Q191 53 184 70', 'thin'),
        T(48, 66, 'hello?', '', 22, -8),
        S(spark(36, 112, 5)), S(spark(172, 176, 6)), S(spark(146, 220, 4)), S(spark(110, 64, 3.6)),
      ];
    }],
    // 表白
    confess: [250, () => {
      const flake = (x, y, s) => [0, 1, 2].map((k) => { const a = k * 1.047 + .3; return I(line(x - Math.cos(a) * s, y - Math.sin(a) * s, x + Math.cos(a) * s, y + Math.sin(a) * s, .2), 'b thin'); }).join('');
      return [
        W(blob(100, 142, 72, 74), PINK), W(blob(44, 62, 16), SKY), W(blob(160, 208, 15), SKY),
        I(poly([[46, 130], [100, 92], [154, 130]], false)),
        W(box(62, 70, 76, 80), PAPER, 'pp'), I(box(62, 70, 76, 80)),
        W(heart(102, 96, 15), ROSE), I(heart(100, 94, 14), 'r'),
        T(100, 124, 'I like you', '', 17, -3),
        W(box(46, 130, 108, 68), '#fbf1e8', 'pp'), I(box(46, 130, 108, 68)),
        I(poly([[46, 130], [100, 168], [154, 130]], false)),
        I(line(46, 198, 88, 160), 'thin'), I(line(154, 198, 112, 160), 'thin'),
        W(blob(100, 168, 7.5), ROSE), I(heart(100, 167, 3.6), 'r thin'),
        flake(42, 58, 8), flake(166, 74, 6), flake(152, 224, 7), flake(34, 212, 5), flake(174, 150, 4),
        I(heart(160, 112, 6), 'r'), I(heart(44, 104, 4.4), 'r'),
        S(spark(140, 44, 5)), S(spark(64, 228, 4)),
      ];
    }],
    // 73 天后第一次听到“喜欢”，7 天后开始叫老公老婆
    days73: [250, () => {
      const bubble = (cx, cy, tx) => [W(blob(cx, cy, 31, 18, .05), PAPER, 'pp'),
        I(curve([[cx - 12, cy + 16], [cx - 28, cy + 8], [cx - 30, cy - 6], [cx - 14, cy - 17], [cx + 10, cy - 18], [cx + 28, cy - 9], [cx + 30, cy + 5], [cx + 14 * (tx ? 1 : 1), cy + 16], [cx - 4, cy + 18]])),
        I(poly(tx ? [[cx - 4, cy + 18], [cx + 10, cy + 30], [cx + 9, cy + 16]] : [[cx - 12, cy + 16], [cx - 24, cy + 28], [cx - 3, cy + 18]], false))];
      return [
        W(blob(100, 112, 72, 66), BUTTER), W(blob(152, 206, 30, 22), PINK), W(blob(52, 196, 30, 20), LAV),
        W(box(54, 58, 92, 102), PAPER, 'pp'), W(box(54, 58, 92, 24), ROSE),
        I(box(54, 58, 92, 102)), I(line(54, 82, 146, 82, .5)),
        I(ring(76, 57, 3.6, 6), 'thin'), I(ring(124, 57, 3.6, 6), 'thin'),
        T(100, 75, '2025 · 3 · 12', 'en ink', 10.5),
        T(94, 138, '73', 'en ink', 54), T(129, 138, '天', 'cn', 14),
        I(heart(130, 100, 5.5), 'r'),
        ...bubble(62, 198, 0), T(62, 203.5, '老公', 'cn', 14),
        ...bubble(140, 214, 1), T(140, 219.5, '老婆', 'cn', 14),
        W(heart(102, 186, 7), ROSE), I(heart(101, 184, 6.4), 'r'),
        S(spark(160, 66, 6)), S(spark(40, 98, 4.5)), S(spark(166, 150, 4)), S(spark(34, 150, 3.4)),
      ];
    }],
    // 第一次，拉手、抱抱、亲亲
    kiss: [250, () => [
      W(blob(100, 150, 74, 76), PINK), W(blob(102, 80, 22, 20), ROSE),
      W(blob(68, 204, 34, 26), SKY), W(blob(134, 204, 34, 26), LAV),
      I(curve([[34, 238], [38, 204], [52, 180], [74, 170], [96, 176]])),
      I(curve([[104, 176], [126, 168], [148, 178], [162, 204], [166, 238]])),
      I(curve([[64, 204], [90, 212], [118, 210], [144, 196]])), I(ring(147, 194, 5.5), 'thin'),
      g('rotate(-8 124 150)', [
        W(curve([[102, 142], [100, 112], [112, 98], [128, 95], [144, 102], [151, 120], [151, 148], [157, 174], [142, 170], [132, 156]], true), HAIR),
        I(curve([[102, 142], [100, 112], [112, 98], [128, 95], [144, 102], [151, 120], [151, 148], [157, 174], [142, 170]])),
        W(blob(124, 131, 22, 22, .03), PAPER, 'pp'), I(ring(124, 131, 23)),
        I(curve([[102, 124], [110, 112], [126, 108], [140, 110], [147, 120]]), 'thin'),
        I('M110 134q4 4 8 0', 'thin'), I('M127 134q4 4 8 0', 'thin'),
        W(blob(110, 142, 5, 2.8), ROSE), W(blob(137, 142, 5, 2.8), ROSE),
        I(heart(148, 108, 4), 'r thin'),
      ]),
      g('rotate(8 76 150)', [
        W(curve([[53, 128], [52, 110], [64, 99], [80, 97], [95, 104], [100, 120], [90, 113], [76, 116], [64, 113], [57, 121]], true), HAIR),
        W(blob(76, 131, 22, 22, .03), PAPER, 'pp'),
        I(curve([[53, 128], [52, 110], [64, 99], [80, 97], [95, 104], [100, 120]])),
        I(ring(76, 131, 23)),
        I(curve([[56, 120], [64, 113], [76, 116], [90, 113], [99, 119]]), 'thin'),
        I('M65 134q4 4 8 0', 'thin'), I('M82 134q4 4 8 0', 'thin'),
        W(blob(64, 142, 5, 2.8), ROSE), W(blob(91, 142, 5, 2.8), ROSE),
      ]),
      I(heart(100, 78, 13), 'r'), I(heart(70, 62, 5), 'r thin'), I(heart(132, 54, 6), 'r thin'),
      I(line(80, 72, 74, 68, .3), 'thin'), I(line(120, 72, 126, 68, .3), 'thin'), I(line(100, 56, 100, 49, .3), 'thin'),
      T(162, 84, 'chu~', '', 18, -10),
      S(spark(38, 104, 5)), S(spark(172, 132, 4.6)), S(spark(40, 164, 3.4)),
    ]],
    // 很普通的日子：一起吃饭、散步、说晚安
    everyday: [250, () => {
      const bowl = (cx, wash) => [
        W(curve([[cx - 26, 170], [cx - 22, 186], [cx - 10, 195], [cx + 10, 195], [cx + 22, 186], [cx + 26, 170]], true), wash),
        I(curve([[cx - 22, 169], [cx - 14, 159], [cx, 156], [cx + 14, 159], [cx + 22, 169]]), 'thin'),
        I(curve([[cx - 26, 170], [cx - 22, 186], [cx - 10, 195], [cx + 10, 195], [cx + 22, 186], [cx + 26, 170]])),
        I(ring(cx, 170, 26, 5, .03)), I(line(cx - 9, 198, cx + 9, 198, .3)),
      ];
      return [
        W(blob(128, 70, 56, 48), LAV), W(blob(100, 188, 82, 36), BUTTER),
        W(curve([[150, 34], [131, 41], [122, 60], [129, 78], [147, 87], [165, 80], [149, 79], [138, 66], [138, 50]], true), BUTTER),
        I(curve([[150, 34], [131, 41], [122, 60], [129, 78], [147, 87], [165, 80], [149, 79], [138, 66], [138, 50], [150, 34]]), 'g'),
        T(78, 104, 'good night', '', 22, -6),
        ...bowl(66, PINK), ...bowl(134, SKY),
        I(line(108, 160, 166, 146, .4)), I(line(110, 165, 168, 152, .4)),
        I(curve([[58, 148], [54, 139], [60, 131], [56, 121]]), 'thin'), I(curve([[74, 148], [70, 139], [76, 131], [72, 121]]), 'thin'),
        I(curve([[128, 140], [124, 131], [130, 123], [126, 113]]), 'thin'),
        W(heart(101, 128, 8.5), ROSE), I(heart(100, 126, 8), 'r'),
        I(curve([[16, 206], [60, 201], [120, 207], [184, 201]])),
        F(blob(40, 228, 2.4, 3.4), 'lt'), F(blob(50, 222, 2.4, 3.4), 'lt'), F(blob(60, 230, 2.4, 3.4), 'lt'), F(blob(70, 224, 2.4, 3.4), 'lt'),
        F(blob(132, 230, 2.2, 3.1), 'lt'), F(blob(142, 224, 2.2, 3.1), 'lt'), F(blob(152, 232, 2.2, 3.1), 'lt'), F(blob(162, 226, 2.2, 3.1), 'lt'),
        S(spark(64, 40, 6)), S(spark(96, 28, 4)), S(spark(178, 112, 5)), S(spark(36, 76, 3.4)), S(spark(180, 30, 3.6)),
      ];
    }],
  };

  const cache = {};
  window.Doodle = {
    has: (name) => !!SCENES[name],
    names: Object.keys(SCENES),
    svg(name) {
      if (!cache[name]) {
        const [h, draw] = SCENES[name];
        seed = 1 + [...name].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) % 99991;
        cache[name] = `<svg class="dd" viewBox="0 0 200 ${h}" aria-hidden="true">${draw().join('')}</svg>`;
      }
      return cache[name];
    },
  };
})();
