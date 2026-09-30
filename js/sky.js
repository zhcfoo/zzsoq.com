/* 全屏背景画布：飘落的花瓣、雨、飘起的爱心、彩纸 */
(function () {
  const canvas = document.getElementById('sky');
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, DPR = 1;
  let rain = [], hearts = [], confetti = [];

  // 每个场景飘落花瓣的密度
  const PETALS = { gate: 0, prologue: 0.6, launch: 0.15, haikou: 0.4, growing: 0.5, together: 0.8, quarrel: 0, love: 1, birthday: 1 };
  const PETAL_COLORS = ['#f7a8c0', '#f9c3cf', '#ffd9e2', '#f4889f', '#9fd3f5', '#ffffff', '#e8385f'];
  let petals = [];

  const state = { scene: 'gate', density: 0, rain: false, hearts: false, t: 0 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * DPR;
    H = canvas.height = innerHeight * DPR;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }

  function petal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.8 + 0.2);
    ctx.fillStyle = p.c;
    if (p.daisy) {
      for (let i = 0; i < 5; i++) {
        ctx.rotate(1.2566);
        ctx.beginPath(); ctx.arc(0, -p.s * 0.5, p.s * 0.42, 0, 6.28); ctx.fill();
      }
      ctx.fillStyle = '#f5c330'; ctx.beginPath(); ctx.arc(0, 0, p.s * 0.28, 0, 6.28); ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * 0.8, -p.s * 0.6, p.s * 0.6, p.s * 0.6, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.6, p.s * 0.6, -p.s * 0.8, -p.s * 0.6, 0, -p.s);
      ctx.fill();
    }
    ctx.restore();
  }

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
    ctx.fill();
  }

  function frame() {
    state.t += 1 / 60;
    const target = PETALS[state.scene] ?? 0.4;
    state.density += (target - state.density) * 0.02;
    ctx.clearRect(0, 0, W, H);

    // 飘落的花瓣和小花
    if (!reduce && petals.length < 70 * state.density && Math.random() < 0.25 * state.density) {
      const daisy = Math.random() < 0.15;
      petals.push({
        x: Math.random() * W, y: -20 * DPR, s: (daisy ? 7 : 6 + Math.random() * 6) * DPR,
        vy: (0.6 + Math.random() * 0.9) * DPR, vx: (Math.random() - 0.3) * 0.6 * DPR,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.03, flip: Math.random() * 6.28,
        c: daisy ? '#fffdf8' : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)], daisy,
      });
    }
    for (const p of petals) {
      p.y += p.vy; p.x += p.vx + Math.sin(state.t * 1.2 + p.flip) * 0.5 * DPR;
      p.rot += p.vr; p.flip += 0.03;
      ctx.globalAlpha = 0.85;
      petal(p);
    }
    petals = petals.filter((p) => p.y < H + 30 * DPR);

    // 雨（吵架段落）
    if (state.rain && !reduce && rain.length < 160) {
      for (let i = 0; i < 4; i++) rain.push({ x: Math.random() * W * 1.2, y: -20, v: (14 + Math.random() * 10) * DPR, l: (12 + Math.random() * 18) * DPR });
    }
    ctx.strokeStyle = 'rgba(90,110,140,0.35)'; ctx.lineWidth = 1 * DPR; ctx.globalAlpha = 1;
    ctx.beginPath();
    for (const d of rain) { d.y += d.v; d.x -= d.v * 0.15; ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * 0.15, d.y - d.l); }
    ctx.stroke();
    rain = rain.filter((d) => d.y < H + 40);

    // 爱心
    if (state.hearts && !reduce && Math.random() < 0.08 && hearts.length < 60) {
      hearts.push({ x: Math.random() * W, y: H + 30 * DPR, s: (10 + Math.random() * 18) * DPR, v: (0.6 + Math.random() * 1.2) * DPR, ph: Math.random() * 6.28, hue: 330 + Math.random() * 30 });
    }
    for (const h of hearts) {
      h.y -= h.v;
      const x = h.x + Math.sin(state.t * 1.4 + h.ph) * 16 * DPR;
      ctx.globalAlpha = Math.max(0, Math.min(0.7, h.y / H));
      ctx.fillStyle = `hsl(${h.hue},90%,72%)`;
      heartPath(x, h.y, h.s);
    }
    hearts = hearts.filter((h) => h.y > -40 * DPR);

    // 彩纸
    for (const p of confetti) {
      p.vy += 0.18 * DPR; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save(); ctx.globalAlpha = 1; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)));
      ctx.restore();
    }
    confetti = confetti.filter((p) => p.y < H + 40);

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  window.Sky = {
    setScene(s) { state.scene = s; state.hearts = s === 'love' || s === 'birthday'; },
    setRain(on) { state.rain = on; },
    burst(x, y) {
      const colors = ['#f7c933', '#f4889f', '#ffffff', '#6fc1f0', '#e8385f', '#a6cc5e', '#f9c3cf'];
      for (let i = 0; i < (reduce ? 60 : 220); i++) {
        const a = Math.random() * Math.PI * 2, sp = (4 + Math.random() * 11) * DPR;
        confetti.push({
          x: x * DPR, y: y * DPR, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 7 * DPR,
          w: (5 + Math.random() * 6) * DPR, h: (8 + Math.random() * 8) * DPR,
          rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length],
        });
      }
    },
  };

  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();
