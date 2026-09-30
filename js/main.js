(function () {
  const S = window.SITE, M = window.MUSIC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => t * t * (3 - 2 * t);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const day = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  /* ---------- 文字与数字 ---------- */
  $$('[data-bind]').forEach((el) => { el.textContent = S[el.dataset.bind] || ''; });

  const now = new Date();
  const birth = day(S.birthday);
  const daysBetween = (a, b) => Math.max(0, Math.floor((b - a) / 864e5));

  // 年龄 = 离今天最近的那个生日对应的岁数（生日前后都显示“这一次”的岁数）
  const bdThisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const bdYear = now - bdThisYear < -183 * 864e5 ? now.getFullYear() - 1 : now.getFullYear();
  const age = bdYear - birth.getFullYear();
  $('#age-num').textContent = age;

  function countUp(el, target) {
    const t0 = performance.now(), dur = 1800;
    const step = (t) => {
      const p = clamp((t - t0) / dur);
      el.textContent = Math.round(target * ease(p)).toLocaleString('zh-CN');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // 回忆卡片
  $('#memories').innerHTML = S.memories.map((m, i) => `
    <article class="memory reveal ${i % 2 ? 'right' : 'left'}">
      ${m.photo ? `<img src="${esc(m.photo)}" alt="" loading="lazy">` : ''}
      <time>${esc(m.date)}</time>
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.text)}</p>
    </article>`).join('');

  // 争吵句子
  const qn = S.quarrel.length;
  $('#quarrel-lines').innerHTML = S.quarrel.map((t, i) =>
    `<p class="beat shaky" data-from="${(i * 0.13).toFixed(2)}" data-to="0.62">${esc(t)}</p>`).join('');
  $('#resolve-lines').innerHTML = S.resolve.map((t, i) =>
    `<p class="beat" data-from="${(0.68 + i * 0.1).toFixed(2)}">${esc(t)}</p>`).join('');

  $('#letter-body').innerHTML = S.letter.map((t) => `<p>${esc(t)}</p>`).join('');

  // 生日蜡烛：用岁数的每一位做数字蜡烛
  $('#candles').innerHTML = String(age).split('').map((d) =>
    `<div class="candle"><span class="flame"></span><b>${d}</b></div>`).join('');

  // 成长时间轴
  const lastYear = now.getFullYear();
  const growth = S.growth.slice().sort((a, b) => a.year - b.year);
  $('#timeline-dots').innerHTML = growth.map((g) =>
    `<i style="left:${((g.year - 2003) / (lastYear - 2003)) * 100}%"></i>`).join('');

  /* ---------- 音乐 ---------- */
  const bgm = (window.bgm = new window.Bgm(M));
  const np = $('#now-playing');
  bgm.onchange = (tr) => {
    np.textContent = tr.missing ? '♪ 氛围音' : `♪ ${tr.title} · ${tr.artist}`;
    np.classList.remove('flash'); void np.offsetWidth; np.classList.add('flash');
  };
  $('#sound').addEventListener('click', () => {
    document.body.classList.toggle('muted', bgm.toggleMute());
  });

  /* ---------- 开场 ---------- */
  const scenes = $$('.scene');
  let active = null;

  $('#gate-btn').addEventListener('click', () => {
    bgm.unlock();
    document.body.classList.remove('locked');
    document.body.classList.add('started');
    $('#gate').classList.add('open');
    setTimeout(() => $('#gate').remove(), 1600);
    active = null; // 强制按当前位置重新选歌
    if (location.search.includes('tune')) tuner();
  });

  /* ---------- 章节导航 ---------- */
  $('#dots').innerHTML = scenes.map((s) =>
    `<a href="#${s.id}" data-id="${s.id}"><span>${esc(s.dataset.title)}</span></a>`).join('');

  /* ---------- 出现动画 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const lived = e.target.querySelector('[data-days-lived]');
      if (lived && !lived.dataset.done) { lived.dataset.done = 1; countUp(lived, daysBetween(birth, now)); }
      const tog = e.target.querySelector('[data-days-together]');
      if (tog && !tog.dataset.done) { tog.dataset.done = 1; countUp(tog, daysBetween(day(S.togetherSince), now) + 1); }
      io.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .memory').forEach((el) => io.observe(el));

  /* ---------- 滚动驱动 ---------- */
  const beatsOf = new Map(scenes.map((s) => [s, $$('.beat', s)]));
  const yearEl = $('#year'), ageEl = $('#age'), msEl = $('#milestone'), fillEl = $('#timeline-fill');
  let lastMilestone = null;

  function setActive(s) {
    active = s;
    document.body.dataset.scene = s.id;
    window.Sky.setScene(s.id);
    $$('#dots a').forEach((a) => a.classList.toggle('on', a.dataset.id === s.id));
    if (!document.body.classList.contains('started')) return;
    bgm.switchTo(s.dataset.track);
    if (!s.dataset.fxEnd) bgm.applyFx(M.fx[s.dataset.fx]);
  }

  function update() {
    const vh = innerHeight;
    const doc = document.documentElement;
    $('#progress i').style.transform = `scaleX(${clamp(scrollY / (doc.scrollHeight - vh))})`;

    for (const s of scenes) {
      const r = s.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;

      if (r.top <= vh / 2 && r.bottom > vh / 2 && active !== s) setActive(s);

      const sticky = s.classList.contains('sticky-scene');
      const p = sticky ? clamp(-r.top / (r.height - vh)) : clamp((vh - r.top) / (vh + r.height));
      s.style.setProperty('--p', p.toFixed(4));

      for (const b of beatsOf.get(s)) {
        const from = parseFloat(b.dataset.from || 0), to = parseFloat(b.dataset.to || 1.01);
        b.classList.toggle('on', p >= from && p < to);
        b.style.setProperty('--q', clamp((p - from) / (Math.min(to, 1) - from)).toFixed(4));
      }

      if (s.id === 'growing') {
        const y = Math.round(2003 + (lastYear - 2003) * p);
        yearEl.textContent = y;
        ageEl.textContent = `${y - 2003} 岁`;
        fillEl.style.transform = `scaleX(${p})`;
        let ms = growth[0];
        for (const g of growth) if (g.year <= y) ms = g;
        if (ms !== lastMilestone) {
          lastMilestone = ms;
          msEl.classList.remove('show'); void msEl.offsetWidth;
          msEl.textContent = ms.text; msEl.classList.add('show');
        }
      }

      if (s.id === 'quarrel') {
        s.classList.toggle('resolved', p > 0.64);
        if (active === s) window.Sky.setRain(p > 0.02 && p < 0.64);
      }

      // 同一首歌在段落内从一种处理渐变到另一种（吵架：闷 → 清）
      if (active === s && s.dataset.fxEnd && bgm.ready) {
        bgm.blendFx(M.fx[s.dataset.fx], M.fx[s.dataset.fxEnd], ease(clamp((p - 0.55) / 0.4)));
      }
    }
    if (active && active.id !== 'quarrel') window.Sky.setRain(false);
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  /* ---------- 吹蜡烛 ---------- */
  const cake = $('#cake');
  cake.addEventListener('click', () => {
    if (cake.classList.contains('out')) return;
    cake.classList.add('out');
    const r = cake.getBoundingClientRect();
    window.Sky.burst(r.left + r.width / 2, r.top + r.height * 0.2);
    setTimeout(() => window.Sky.burst(innerWidth * 0.2, innerHeight * 0.3), 500);
    setTimeout(() => window.Sky.burst(innerWidth * 0.8, innerHeight * 0.3), 900);
    bgm.playBirthdaySong();
    $('#cake-hint').textContent = '愿望会实现的。';
    setTimeout(() => {
      $('#letter').classList.add('show');
      $('#letter').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1400);
  });

  $('#again').addEventListener('click', () => {
    cake.classList.remove('out');
    $('#letter').classList.remove('show');
    $('#cake-hint').textContent = '闭上眼睛许个愿，然后点一下蜡烛';
    scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 调音面板：网址后加 ?tune ---------- */
  function tuner() {
    const panel = document.createElement('div');
    panel.id = 'tuner';
    panel.innerHTML = `<b>调音面板</b><div id="tn-info"></div>
      <div class="row"><button data-k="-5">-5s</button><button data-k="-1">-1s</button><button data-k="1">+1s</button><button data-k="5">+5s</button></div>
      <div class="row"><button data-set="start">设为起点</button><button data-set="end">设为终点</button><button data-set="test">试听循环点</button></div>
      <pre id="tn-out"></pre>`;
    document.body.appendChild(panel);
    const cur = () => bgm.tracks[bgm.current];
    panel.addEventListener('click', (e) => {
      const tr = cur(); if (!tr || tr.missing) return;
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.k) tr.el.currentTime = Math.max(0, tr.el.currentTime + Number(b.dataset.k));
      if (b.dataset.set === 'start') tr.start = Math.round(tr.el.currentTime * 10) / 10;
      if (b.dataset.set === 'end') tr.end = Math.round(tr.el.currentTime * 10) / 10;
      if (b.dataset.set === 'test' && tr.end) tr.el.currentTime = Math.max(0, tr.end - M.loopFade - 3);
    });
    setInterval(() => {
      const tr = cur();
      $('#tn-info').textContent = tr ? `${tr.title}  ${tr.missing ? '(文件缺失)' : tr.el.currentTime.toFixed(1) + 's'}` : '';
      $('#tn-out').textContent = Object.values(bgm.tracks)
        .map((t) => `${t.id}: start: ${t.start}, end: ${t.end}`).join('\n');
    }, 200);
  }
})();
