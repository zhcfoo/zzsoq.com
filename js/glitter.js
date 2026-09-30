/* 闪光层：背景里一闪一闪的金色碎钻、上浮的金粉、指尖/鼠标拖出的星光、
 * 火箭与流星的光尾、由碎钻聚成的爱心、生日彩纸。
 * 两层画布：#glitter 在文字后面，#glitter-front 在最上面（彩纸）。 */
(function () {
  const back = document.getElementById('glitter');
  const front = document.createElement('canvas');
  front.id = 'glitter-front';
  document.body.appendChild(front);
  const bctx = back.getContext('2d');
  const fctx = front.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 600;

  let W = 0, H = 0, DPR = 1, t = 0, builtW = 0;

  /* ---------- 预渲染的光点贴图 ---------- */
  function glintSprite(ray, halo, core) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 30);
    rg.addColorStop(0, halo + '.6)'); rg.addColorStop(.3, halo + '.18)'); rg.addColorStop(1, halo + '0)');
    g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
    g.fillStyle = ray;
    g.beginPath();
    g.moveTo(32, 1); g.lineTo(33.6, 30.4); g.lineTo(63, 32); g.lineTo(33.6, 33.6);
    g.lineTo(32, 63); g.lineTo(30.4, 33.6); g.lineTo(1, 32); g.lineTo(30.4, 30.4); g.closePath(); g.fill();
    g.globalAlpha = .6;
    g.beginPath();
    g.moveTo(32, 18); g.lineTo(34, 32); g.lineTo(32, 46); g.lineTo(30, 32); g.closePath();
    g.save(); g.translate(32, 32); g.rotate(Math.PI / 4); g.translate(-32, -32); g.fill(); g.restore();
    g.globalAlpha = 1;
    g.fillStyle = core; g.beginPath(); g.arc(32, 32, 2.6, 0, 7); g.fill();
    return c;
  }
  function dotSprite(hi, mid, lo) {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    const rg = g.createRadialGradient(12, 12, 0, 16, 16, 15);
    rg.addColorStop(0, hi); rg.addColorStop(.45, mid); rg.addColorStop(1, lo);
    g.fillStyle = rg; g.beginPath(); g.arc(16, 16, 15, 0, 7); g.fill();
    return c;
  }
  const GLINTS = [
    glintSprite('#b98f4f', 'rgba(222,190,125,', '#fffaf0'), // 金
    glintSprite('#b98f4f', 'rgba(222,190,125,', '#fffaf0'),
    glintSprite('#c98398', 'rgba(240,176,196,', '#fff8fa'), // 玫瑰金
    glintSprite('#7fa3c8', 'rgba(170,205,235,', '#ffffff'), // 冰蓝（蓝色百合）
    glintSprite('#a79c95', 'rgba(215,205,200,', '#ffffff'), // 珍珠银
  ];
  const DOTS = [
    dotSprite('#fffaf0', '#e2c48a', 'rgba(176,138,79,0)'),
    dotSprite('#fff', '#f1bfcd', 'rgba(199,125,146,0)'),
    dotSprite('#fff', '#e8e2dc', 'rgba(170,160,150,0)'),
  ];

  /* ---------- 状态 ---------- */
  const state = { ambient: 1, ambientTarget: 1, rain: false, heart: 0, trail: true };
  let ambient = [], dust = [], sparks = [], confetti = [], rain = [], heartPts = [];
  const followers = new Set();

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    for (const c of [back, front]) {
      c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
      c.style.width = W + 'px'; c.style.height = H + 'px';
    }
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (Math.abs(W - builtW) < 2 && ambient.length) return; // 手机地址栏伸缩只改高度，不重新撒粒子
    builtW = W;
    const n = Math.round(Math.min(small ? 46 : 90, (W * H) / 11000));
    ambient = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H, s: 6 + Math.random() * 16,
      ph: Math.random() * 100, sp: .6 + Math.random() * 1.4, depth: Math.random(),
      img: GLINTS[Math.floor(Math.random() * GLINTS.length)], rot: Math.random() * .6 - .3,
    }));
    dust = Array.from({ length: small ? 22 : 40 }, () => newDust(true));
    buildHeart();
  }
  function newDust(anywhere) {
    return {
      x: Math.random() * W, y: anywhere ? Math.random() * H : H + 10, s: 1.5 + Math.random() * 3,
      vy: -(.12 + Math.random() * .35), ph: Math.random() * 6, img: DOTS[Math.floor(Math.random() * DOTS.length)],
    };
  }

  /* ---------- 爱心 ---------- */
  function heartXY(a) {
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    return [x / 17, y / 17 + .05];
  }
  function buildHeart() {
    const n = small ? 230 : 360;
    heartPts = Array.from({ length: n }, (_, i) => {
      let hx, hy;
      if (i < n * .62) {
        const [x, y] = heartXY((i / (n * .62)) * Math.PI * 2);
        hx = x + (Math.random() - .5) * .04; hy = y + (Math.random() - .5) * .04;
      } else {
        const [x, y] = heartXY(Math.random() * Math.PI * 2);
        const k = Math.sqrt(Math.random()) * .92;
        hx = x * k; hy = y * k;
      }
      return {
        hx, hy, sx: Math.random() * W, sy: Math.random() * H, d: Math.random() * .35,
        s: 4 + Math.random() * 9, ph: Math.random() * 100, sp: 1 + Math.random() * 2,
        img: i % 5 === 0 ? GLINTS[3] : i % 3 === 0 ? GLINTS[2] : GLINTS[0], dot: Math.random() < .35,
        dimg: DOTS[i % 2],
      };
    });
  }

  /* ---------- 粒子发射 ---------- */
  function spark(x, y, o = {}) {
    if (reduce) return;
    const a = o.angle ?? Math.random() * Math.PI * 2;
    const v = o.speed ?? Math.random() * 1.2;
    sparks.push({
      x, y, vx: Math.cos(a) * v + (o.vx || 0), vy: Math.sin(a) * v + (o.vy || 0),
      g: o.gravity ?? .02, life: 1, decay: o.decay ?? (.012 + Math.random() * .02),
      s: o.size ?? (5 + Math.random() * 12), rot: Math.random() * .8, spin: (Math.random() - .5) * .08,
      img: o.img || GLINTS[Math.floor(Math.random() * GLINTS.length)], dot: o.dot ?? Math.random() < .3,
      dimg: DOTS[Math.floor(Math.random() * DOTS.length)],
    });
    if (sparks.length > 700) sparks.splice(0, sparks.length - 700);
  }

  let lastPX = -99, lastPY = -99;
  function onPointer(x, y) {
    if (!state.trail) return;
    const dx = x - lastPX, dy = y - lastPY;
    if (dx * dx + dy * dy < 64) return;
    lastPX = x; lastPY = y;
    for (let i = 0; i < 2; i++) spark(x + (Math.random() - .5) * 10, y + (Math.random() - .5) * 10, { speed: .4, vy: .3, gravity: .015, decay: .02 + Math.random() * .02, size: 4 + Math.random() * 9 });
  }
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') onPointer(e.clientX, e.clientY); }, { passive: true });
  addEventListener('touchmove', (e) => { const p = e.touches[0]; if (p) onPointer(p.clientX, p.clientY); }, { passive: true });
  addEventListener('pointerdown', (e) => {
    if (!state.trail) return;
    for (let i = 0; i < 10; i++) spark(e.clientX, e.clientY, { speed: .8 + Math.random() * 1.6, decay: .025, size: 4 + Math.random() * 10 });
  }, { passive: true });

  /* ---------- 绘制 ---------- */
  function drawSprite(ctx, img, x, y, s, rot, a) {
    if (a <= .01) return;
    ctx.globalAlpha = a > 1 ? 1 : a;
    if (rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(img, -s / 2, -s / 2, s, s); ctx.restore();
    } else ctx.drawImage(img, x - s / 2, y - s / 2, s, s);
  }

  function frame() {
    t += 1 / 60;
    state.ambient += (state.ambientTarget - state.ambient) * .03;
    bctx.clearRect(0, 0, W, H);
    fctx.clearRect(0, 0, W, H);
    const sy = scrollY;

    // 背景碎钻：大部分时间暗着，偶尔“叮”地闪一下
    const amb = state.ambient;
    if (amb > .02) {
      for (const p of ambient) {
        const tw = Math.pow(Math.max(0, Math.sin(t * p.sp + p.ph)), 6);
        const y = (((p.y - sy * .12 * (.3 + p.depth)) % H) + H) % H;
        drawSprite(bctx, p.img, p.x, y, p.s * (.5 + tw * .8), p.rot + t * .2, (.12 + tw * .9) * amb);
      }
      for (const d of dust) {
        d.y += d.vy; d.x += Math.sin(t + d.ph) * .15;
        if (d.y < -10) Object.assign(d, newDust(false));
        drawSprite(bctx, d.img, d.x, d.y, d.s * 2, 0, (.35 + .3 * Math.sin(t * 2 + d.ph)) * amb);
      }
    }

    // 跟随元素的光尾（火箭、流星）
    for (const f of followers) {
      if (f.when && !f.when()) { f.px = null; continue; }
      const r = f.el.getBoundingClientRect();
      if (!r.width) continue;
      const x = r.left + r.width * f.ox, y = r.top + r.height * f.oy;
      if (f.px != null) {
        const dx = x - f.px, dy = y - f.py, dist = Math.hypot(dx, dy);
        const n = Math.min(10, Math.floor(dist / 3));
        for (let i = 0; i < n; i++) {
          const k = i / n;
          spark(f.px + dx * k + (Math.random() - .5) * f.spread, f.py + dy * k + (Math.random() - .5) * f.spread,
            { speed: .3 + Math.random() * .6, vy: f.vy, gravity: f.gravity, decay: .01 + Math.random() * .015, size: 4 + Math.random() * 10 });
        }
      }
      f.px = x; f.py = y;
    }

    // 雨
    if (state.rain && !reduce && rain.length < 140) {
      for (let i = 0; i < 3; i++) rain.push({ x: Math.random() * W * 1.2, y: -30, v: 9 + Math.random() * 8, l: 14 + Math.random() * 22 });
    }
    if (rain.length) {
      bctx.globalAlpha = 1; bctx.strokeStyle = 'rgba(120,135,160,.32)'; bctx.lineWidth = 1;
      bctx.beginPath();
      for (const d of rain) { d.y += d.v; d.x -= d.v * .18; bctx.moveTo(d.x, d.y); bctx.lineTo(d.x + d.l * .18, d.y - d.l); }
      bctx.stroke();
      rain = rain.filter((d) => d.y < H + 40);
    }

    // 碎钻爱心
    if (state.heart > .001) {
      const hp = state.heart;
      const cx = W / 2, cy = H * .34;
      const beat = hp > .95 ? 1 + .035 * Math.pow(Math.max(0, Math.sin(t * 5.2)), 12) + .02 * Math.pow(Math.max(0, Math.sin(t * 5.2 - .7)), 12) : 1;
      const S = Math.min(W * .34, H * .19) * beat;
      for (const p of heartPts) {
        const k = Math.min(1, Math.max(0, (hp - p.d) / .65));
        const e = k * k * (3 - 2 * k);
        const sx = p.sx + Math.sin(t * .5 + p.ph) * 30, syy = p.sy + Math.cos(t * .4 + p.ph) * 30;
        const x = sx + (cx + p.hx * S - sx) * e;
        const y = syy + (cy + p.hy * S - syy) * e;
        const tw = Math.pow(Math.max(0, Math.sin(t * p.sp + p.ph)), 4);
        const a = Math.min(1, hp * 1.6) * (.35 + e * .45 + tw * .5);
        if (p.dot) drawSprite(bctx, p.dimg, x, y, 3 + e * 2, 0, a);
        else drawSprite(bctx, p.img, x, y, p.s * (.6 + tw * .7), t * .3 + p.ph, a);
      }
    }

    // 火花
    for (const p of sparks) {
      p.vy += p.g; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.spin; p.life -= p.decay;
      if (p.dot) drawSprite(bctx, p.dimg, p.x, p.y, p.s * .45, 0, p.life);
      else drawSprite(bctx, p.img, p.x, p.y, p.s * (.6 + p.life * .6), p.rot, p.life * 1.2);
    }
    sparks = sparks.filter((p) => p.life > 0);

    // 彩纸（最上层）
    for (const c of confetti) {
      c.vy += .16; c.vx *= .99; c.vy *= .992; c.x += c.vx + Math.sin(t * 3 + c.ph) * .6; c.y += c.vy; c.rot += c.vr; c.flip += c.vf;
      const sh = Math.cos(c.flip);
      fctx.save(); fctx.translate(c.x, c.y); fctx.rotate(c.rot); fctx.scale(1, sh);
      fctx.globalAlpha = Math.min(1, c.life);
      fctx.fillStyle = sh > 0 ? c.c1 : c.c2;
      if (c.round) { fctx.beginPath(); fctx.arc(0, 0, c.w / 2, 0, 7); fctx.fill(); } else fctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      fctx.restore();
      if (c.y > H + 30) c.life = 0;
    }
    confetti = confetti.filter((c) => c.life > 0);
    bctx.globalAlpha = 1; fctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  window.Glitter = {
    state,
    setAmbient(v) { state.ambientTarget = v; },
    setRain(on) { state.rain = on; },
    setTrail(on) { state.trail = on; },
    spark,
    burst(x, y, n = 60, power = 4) {
      for (let i = 0; i < (reduce ? n / 4 : n); i++) spark(x, y, { speed: Math.random() * power, gravity: .03, decay: .008 + Math.random() * .012, size: 6 + Math.random() * 14 });
    },
    confetti(x, y, n = 180) {
      const pal = [['#e8cf98', '#b08a4f'], ['#fff6df', '#d9b877'], ['#f8d3de', '#e3a0b3'], ['#ffffff', '#e8e2dc'], ['#dfe9f7', '#a9c4e3'], ['#f3dfa9', '#c99e5f']];
      for (let i = 0; i < (reduce ? 40 : n); i++) {
        const a = -Math.PI / 2 + (Math.random() - .5) * Math.PI * 1.1, v = 6 + Math.random() * 11;
        const [c1, c2] = pal[i % pal.length];
        confetti.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, vr: (Math.random() - .5) * .2,
          flip: Math.random() * 6, vf: .08 + Math.random() * .16, w: 6 + Math.random() * 7, h: 10 + Math.random() * 8,
          c1, c2, round: Math.random() < .25, life: 1, ph: Math.random() * 6,
        });
      }
    },
    follow(el, o = {}) {
      const f = { el, when: o.when, ox: o.ox ?? .5, oy: o.oy ?? .5, spread: o.spread ?? 6, vy: o.vy ?? .4, gravity: o.gravity ?? .01, px: null, py: null };
      followers.add(f);
      return () => followers.delete(f);
    },
  };

  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
