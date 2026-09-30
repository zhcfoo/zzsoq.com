(function () {
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MotionPathPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const S = window.SITE, M = window.MUSIC, G = window.Glitter;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (n) => Math.round(n).toLocaleString('en-US');
  const day = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const rand = gsap.utils.random;

  /* =========================================================
   * 数据
   * ========================================================= */
  $$('[data-bind]').forEach((el) => { el.textContent = S[el.dataset.bind] || ''; });
  const now = new Date();
  const birth = day(S.birthday);
  const lived = Math.max(0, Math.floor((now - birth) / 864e5));
  const bdThisYear = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  const bdYear = now - bdThisYear < -183 * 864e5 ? now.getFullYear() - 1 : now.getFullYear();
  const age = bdYear - birth.getFullYear();
  const together = Math.max(1, Math.floor((now - day(S.togetherSince)) / 864e5) + 1);
  const lastYear = Math.max(now.getFullYear(), 2004);
  $('#age-num').textContent = age;
  $('#us-date').textContent = S.togetherSince.replace(/-/g, ' · ');

  /* =========================================================
   * 生成动态内容
   * ========================================================= */
  // 年份滚轮
  const odo = $('#odo');
  odo.innerHTML = '2003'.split('').map(() =>
    `<div class="odo__col">${'0123456789'.split('').map((d) => `<span>${d}</span>`).join('')}</div>`).join('');
  const odoCols = $$('.odo__col', odo);
  let shownYear = null;
  function setYear(y) {
    if (y === shownYear) return;
    shownYear = y;
    String(y).split('').forEach((d, i) => { odoCols[i].style.transform = `translateY(${-Number(d)}em)`; });
    $('#age-now').textContent = y - 2003;
    $$('#rail-dots i').forEach((dot) => dot.classList.toggle('on', Number(dot.dataset.year) <= y));
  }

  // 成长拍立得
  const growth = S.growth.slice().sort((a, b) => a.year - b.year);
  $('#stack').innerHTML = growth.map((g, i) => `
    <figure class="pol" style="z-index:${i + 1}">
      <div class="pol__img ${g.photo ? '' : 'ph'}" ${g.photo ? `style="background-image:url('${esc(g.photo)}')"` : ''}>${g.photo ? '' : `<span class="yr">${g.year}</span>`}</div>
      <figcaption class="pol__cap"><b>${g.year}</b><span>${esc(g.text)}</span></figcaption>
    </figure>`).join('');
  $('#rail-dots').innerHTML = growth.map((g) =>
    `<i data-year="${g.year}" style="left:${((g.year - 2003) / (lastYear - 2003)) * 100}%"></i>`).join('');
  setYear(2003);

  // 回忆卡片
  $('#track').innerHTML = S.memories.map((m, i) => `
    <article class="mcard">
      <div class="mcard__img ${m.photo ? '' : 'ph'}" ${m.photo ? `style="background-image:url('${esc(m.photo)}')"` : ''}>${m.photo ? '' : `<span>${['L', 'O', 'V', 'E', '♡'][i % 5]}</span>`}</div>
      <time>${esc(m.date)}</time>
      <h3>${esc(m.title)}</h3>
      <p>${esc(m.text)}</p>
    </article>`).join('') + `
    <article class="mcard mcard--end"><span class="script foil">to be continued</span><p>未完待续</p></article>`;

  $('#storm-lines').innerHTML = S.quarrel.map((t) => `<p class="sl">${esc(t)}</p>`).join('');
  $('#resolve-lines').innerHTML = S.resolve.map((t) => `<p class="rl">${esc(t)}</p>`).join('');
  $('#love-lines').innerHTML = S.love.map((t) => `<li>${esc(t)}</li>`).join('');
  $('#letter-body').innerHTML = S.letter.map((t) => `<p>${esc(t)}</p>`).join('');

  // 蛋糕：珍珠、小花、数字蜡烛
  const NS = 'http://www.w3.org/2000/svg';
  let pearls = '';
  for (let i = 0; i <= 18; i++) {
    const x = 48 + i * 11.3, y = 236 + (1 - ((x - 150) / 106) ** 2) * 13;
    pearls += `<circle cx="${x.toFixed(1)}" cy="${(y + 5).toFixed(1)}" r="3.3"/>`;
  }
  for (let i = 0; i <= 11; i++) {
    const x = 88 + i * 11.3, y = 160 + (1 - ((x - 150) / 66) ** 2) * 9;
    pearls += `<circle cx="${x.toFixed(1)}" cy="${(y + 4).toFixed(1)}" r="2.6"/>`;
  }
  $('.pearls').innerHTML = pearls;
  $('.cake-flowers').innerHTML = [
    ['#rose1', 206, 132, .5, 20], ['#rose0', 222, 146, .42, 80], ['#daisy', 192, 140, .5, 10], ['#bstar', 224, 126, .6, 0],
    ['#rose2', 214, 158, .36, 40], ['#cham', 200, 158, .6, 0], ['#rose4', 96, 170, .36, 10], ['#cham', 108, 174, .55, 0], ['#rose0', 60, 214, .38, 60], ['#daisy', 74, 222, .42, 30],
  ].map(([h, x, y, s, rot]) => `<use href="${h}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"/>`).join('');
  const digits = String(age).split('');
  $('#candles').innerHTML = digits.map((d, i) => {
    const x = 150 + (i - (digits.length - 1) / 2) * 46, base = 112, y0 = base - 62;
    return `<g class="candle">
      <path d="M${x} ${y0 + 2} V${y0 + 12}" stroke="#6b5040" stroke-width="1.4"/>
      <g class="candle-fire"><circle cx="${x}" cy="${y0 - 6}" r="18" fill="url(#flameHalo)"/>
      <path class="candle-flame" d="M${x} ${y0 - 22} C${x + 7} ${y0 - 10} ${x + 8} ${y0 - 2} ${x} ${y0 + 4} C${x - 8} ${y0 - 2} ${x - 7} ${y0 - 10} ${x} ${y0 - 22}Z" fill="url(#flameG)"/></g>
      <text x="${x}" y="${base}" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="500" font-size="70" fill="url(#foilText)" stroke="#a47b3f" stroke-width=".6">${d}</text>
    </g>`;
  }).join('');

  // “Happy Birthday” 花体字按实际字形宽度适配画布
  function fitHB() {
    try {
      const b = $('.hb__text').getBBox();
      if (b.width) $('.hb').setAttribute('viewBox', `${(b.x - 14).toFixed(0)} ${(b.y - 10).toFixed(0)} ${(b.width + 28).toFixed(0)} ${(b.height + 20).toFixed(0)}`);
    } catch (e) { /* 不支持 getBBox 时保持默认 */ }
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(fitHB);

  /* =========================================================
   * 平滑滚动
   * ========================================================= */
  const lenis = (window.lenis = new Lenis({ lerp: .085, smoothWheel: true }));
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* =========================================================
   * 音乐
   * ========================================================= */
  const bgm = (window.bgm = new window.Bgm(M));
  const toast = $('#toast');
  let toastTl;
  bgm.onchange = (tr) => {
    $('.toast__title', toast).textContent = tr.missing ? '氛围音乐' : `${tr.title} — ${tr.artist}`;
    toastTl && toastTl.kill();
    toastTl = gsap.timeline()
      .to(toast, { autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out' })
      .to(toast, { autoAlpha: 0, y: 12, duration: .8, ease: 'power2.in' }, '+=3.2');
  };
  $('#sound').addEventListener('click', () => document.body.classList.toggle('is-muted', bgm.toggleMute()));

  /* =========================================================
   * 场景配色
   * ========================================================= */
  const TINTS = {
    pearl:     ['#fbf8f4', '#f9dfe6', '#e7e1f5', '#dcecf7', '#f6ead2'],
    sky:       ['#f8fbfd', '#d9ebf8', '#eef1fb', '#f6e3ea', '#f3ecd9'],
    sea:       ['#fbf9f5', '#d8eef2', '#f8e7d8', '#e1eef8', '#f7e2e8'],
    blossom:   ['#fcf8f6', '#f8dbe4', '#f5ead8', '#e8e1f4', '#fbe7ee'],
    rose:      ['#fdf7f7', '#f7d3de', '#f3e1ea', '#e2e6f6', '#f8e9d6'],
    storm:     ['#eceef2', '#d3d9e2', '#dfe2e8', '#cdd4de', '#e4e2e6'],
    blush:     ['#fdf6f7', '#f8cbd8', '#f6dfe8', '#e9dcf3', '#fae8d8'],
    champagne: ['#fcf9f3', '#f6e7c8', '#f8dde5', '#e5ecf7', '#fbf0dc'],
  };
  function tint(name) {
    const [b, a1, a2, a3, a4] = TINTS[name] || TINTS.pearl;
    gsap.to(root, { '--base': b, '--a1': a1, '--a2': a2, '--a3': a3, '--a4': a4, duration: 1.8, ease: 'sine.inOut', overwrite: 'auto' });
  }

  /* =========================================================
   * 小工具
   * ========================================================= */
  const chars = (el) => SplitText.create(el, { type: 'chars', charsClass: 'char' }).chars;
  const charIn = { autoAlpha: 0, yPercent: 70, rotateX: -80, transformOrigin: '50% 100%' };
  const pinTl = (stage, len, extra = {}) => gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: stage, start: 'top top', end: `+=${len}%`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, ...extra },
  });
  function counter(el, to, from = 0) {
    const o = { v: from };
    return { o, onUpdate: () => { el.textContent = fmt(o.v); } };
  }

  /* =========================================================
   * 第一页：花束
   * ========================================================= */
  const gate = $('#gate');
  const bq = window.Bouquet.svg;
  const blooms = $$('.bloom', bq);
  let opened = false;

  function gateIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.gate__date', { autoAlpha: 0, y: 14, duration: 1.2 })
      .from('.gate__title > *', { autoAlpha: 0, y: 26, filter: 'blur(8px)', duration: 1.3, stagger: .18 }, .15)
      .from('.bq-wrap', { autoAlpha: 0, scale: .9, transformOrigin: '50% 60%', duration: 1.5 }, .2)
      .from('.bq-sprigs', { autoAlpha: 0, duration: 1.6 }, .6)
      .from(blooms, { scale: 0, rotation: -90, autoAlpha: 0, transformOrigin: '50% 50%', duration: 1.1, ease: 'back.out(1.7)', stagger: { each: 2.2 / blooms.length } }, .5)
      .from('.bq-front', { autoAlpha: 0, y: 16, duration: 1 }, 1.6)
      .from('.bq-ribbon', { autoAlpha: 0, y: -24, duration: 1.2 }, 1.8)
      .from('.bq-card', { autoAlpha: 0, y: -50, rotation: -8, transformOrigin: '50% 100%', duration: 1.4, ease: 'back.out(1.5)' }, 2.4)
      .from('.bq-gems', { autoAlpha: 0, duration: 1.2 }, 2.8)
      .call(() => {
        const r = $('#bouquet').getBoundingClientRect();
        G.burst(r.left + r.width / 2, r.top + r.height * .45, 50, 4);
      }, null, 2.9)
      .from('.gate__foot', { autoAlpha: 0, y: 16, duration: 1.2 }, 3.1)
      .to('#bouquet', { rotation: 1.2, transformOrigin: '50% 92%', duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 3.5);
    return tl;
  }
  let introTl;
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1800))])
    .then(() => { gsap.set(gate, { autoAlpha: 1 }); introTl = gateIntro(); });
  gsap.set(gate, { autoAlpha: 0 });

  $('#gate-btn').addEventListener('click', () => {
    if (opened) return;
    opened = true;
    bgm.unlock();
    introTl && introTl.progress(1).kill();
    gsap.killTweensOf('#bouquet');
    const box = $('#bouquet').getBoundingClientRect();
    G.burst(box.left + box.width / 2, box.top + box.height * .45, 140, 7);
    const { x: cx, y: cy } = window.Bouquet.center;
    gsap.timeline({ onComplete: () => { gsap.set(gate, { visibility: 'hidden', pointerEvents: 'none' }); } })
      .to('.gate__head, .gate__foot', { autoAlpha: 0, y: -20, duration: .6, ease: 'power2.in' }, 0)
      .to(blooms, {
        x: (i, el) => { const dx = el.dataset.x - cx, dy = el.dataset.y - cy, d = Math.hypot(dx, dy) || 1; return dx / d * rand(420, 900); },
        y: (i, el) => { const dx = el.dataset.x - cx, dy = el.dataset.y - cy, d = Math.hypot(dx, dy) || 1; return dy / d * rand(420, 900) - rand(0, 200); },
        rotation: () => rand(-240, 240), scale: () => rand(.6, 1.5), autoAlpha: 0,
        duration: () => rand(1.3, 2.1), ease: 'power2.out', stagger: { each: .0015, from: 'random' },
      }, .05)
      .to('.bq-wrap, .bq-front, .bq-sprigs, .bq-ribbon, .bq-card, .bq-gems', { autoAlpha: 0, scale: .92, transformOrigin: '50% 50%', duration: .9, ease: 'power2.in' }, .1)
      .to('#story', { opacity: 1, duration: 1.2 }, .8)
      .add(startStory, .9);
  });

  function startStory() {
    document.body.classList.remove('is-locked');
    scrollTo(0, 0);
    ScrollTrigger.refresh();
    lenis.start();
    gsap.to('.hud', { autoAlpha: 1, duration: 1.2, delay: .4 });
    setActive($('#prologue'), true);
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('#prologue .eyebrow', { autoAlpha: 0, y: 16, duration: 1.2 })
      .from('.pl1', { autoAlpha: 0, y: 20, filter: 'blur(8px)', duration: 1.4 }, .3)
      .from('.pl2', { autoAlpha: 0, y: 20, filter: 'blur(8px)', duration: 1.4 }, .8)
      .from('.scroll-cue', { autoAlpha: 0, duration: 1.2 }, 1.6);
    if (location.search.includes('tune')) tuner();
  }

  /* =========================================================
   * 场景动画（按页面顺序创建）
   * ========================================================= */

  // ---------- 序 ----------
  {
    const tl = pinTl('#prologue .stage', 170);
    tl.from(chars('.pl3'), { ...charIn, stagger: .06, duration: .6 })
      .from('.pl4', { autoAlpha: 0, letterSpacing: '.7em', filter: 'blur(12px)', y: 30, duration: 1.4 }, '+=.1')
      .from('.pl4 .foil', { scale: .7, display: 'inline-block', duration: 1.2, ease: 'back.out(2)' }, '<.2')
      .to('.scroll-cue', { autoAlpha: 0, duration: .5 }, '<')
      .to({}, { duration: .6 })
      .to('.pl1, .pl2, .pl3', { y: -60, autoAlpha: 0, filter: 'blur(6px)', stagger: .08, duration: .9, ease: 'power2.in' })
      .to('.pl4', { scale: 1.12, autoAlpha: 0, filter: 'blur(8px)', duration: 1, ease: 'power2.in' }, '<.2')
      .to('#prologue .eyebrow', { autoAlpha: 0, duration: .6 }, '<');
  }

  // ---------- I 那一天 ----------
  let dayActive = false, rocketFlying = false, starFalling = false;
  {
    const date = $('.date');
    const pA = $('.panel--launch'), pB = $('.panel--album'), pC = $('.panel--birth');
    gsap.set([pA, pB, pC], { autoAlpha: 0 });
    gsap.set('#orbit-dot, #birth-star', { autoAlpha: 0 });
    gsap.set('.birth-glow', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('.rocket__body path', { fillOpacity: 0 });
    gsap.set('#flame', { scale: 0, transformOrigin: '50% 0%' });

    const textIn = (panel, at, tl) => {
      tl.from($('.kicker', panel), { autoAlpha: 0, y: 16, duration: .5 }, at)
        .from(chars($('.h2', panel)), { ...charIn, stagger: .035, duration: .5 }, at + .15)
        .from($('.body', panel), { autoAlpha: 0, y: 18, filter: 'blur(6px)', duration: .6 }, at + .5);
      const note = $('.note', panel);
      if (note) tl.from(note, { autoAlpha: 0, y: 10, duration: .5 }, at + .8);
    };
    const out = (panel, at, tl) => tl.to(panel, { autoAlpha: 0, y: -40, filter: 'blur(8px)', duration: .7, ease: 'power2.in' }, at);

    const tl = pinTl('#day .stage', 620, {
      onToggle: (self) => { dayActive = self.isActive; },
      onUpdate: (self) => {
        const t = self.animation.time();
        rocketFlying = t > 2.25 && t < 3.9;
        starFalling = t > 8.9 && t < 10.3;
      },
    });
    tl.fromTo(date, { y: () => innerHeight / 2 - (date.offsetTop + date.offsetHeight / 2), scale: 1.35 }, { y: 0, scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
      // 神舟五号
      .to(pA, { autoAlpha: 1, duration: .3 }, .6)
      .from('.earth, .atmo', { autoAlpha: 0, duration: .8 }, .6)
      .from('.earth-line', { drawSVG: '50% 50%', duration: 1 }, .6)
      .from('.gantry path', { drawSVG: 0, duration: .8, stagger: .1 }, .9)
      .from('.rocket__body path', { drawSVG: 0, duration: 1, stagger: .05 }, 1)
      .to('.rocket__body path', { fillOpacity: 1, duration: .4 }, 1.7)
      .to('#flame', { scale: 1, duration: .3 }, 2)
      .to('#rocket', { y: -820, duration: 1.7, ease: 'power2.in' }, 2.2)
      .from('.orbit', { drawSVG: 0, duration: 1 }, 3.2)
      .to('#orbit-dot', { autoAlpha: 1, duration: .2 }, 3.3)
      .to('#orbit-dot', { motionPath: { path: '#orbit-path', align: '#orbit-path', alignOrigin: [.5, .5] }, duration: 1.3, ease: 'none' }, 3.3);
    textIn(pA, 1.2, tl);
    out(pA, 4.7, tl);
    // 《不可思议》
    tl.to(pB, { autoAlpha: 1, duration: .3 }, 5.2)
      .from('.album', { autoAlpha: 0, y: 50, scale: .86, duration: .9 }, 5.2)
      .to('.album', { xPercent: -22, duration: 1.2, ease: 'power2.inOut' }, 5.9)
      .to('.cd', { xPercent: 46, duration: 1.2, ease: 'power2.inOut' }, 5.9)
      .to('.cd', { rotation: 540, '--holo': '300deg', duration: 2.4, ease: 'none' }, 5.9)
      .to('.cd__shine', { rotation: -200, duration: 2.4, ease: 'none' }, 5.9);
    textIn(pB, 6.1, tl);
    out(pB, 8.1, tl);
    // 海口
    tl.to(pC, { autoAlpha: 1, duration: .3 }, 8.5)
      .from('.horizon', { drawSVG: '50% 50%', duration: .8 }, 8.5)
      .from('.wv', { drawSVG: 0, duration: .9, stagger: .15 }, 8.7)
      .to('#birth-star', { autoAlpha: 1, duration: .2 }, 8.9)
      .to('#birth-star', { motionPath: { path: '#star-path', align: '#star-path', alignOrigin: [.5, .5] }, rotation: 180, duration: 1.4, ease: 'power1.in' }, 8.9)
      .call(() => {
        if (!dayActive) return;
        const r = $('#birth-star').getBoundingClientRect();
        G.burst(r.left + r.width / 2, r.top + r.height / 2, 70, 5);
      }, null, 10.25)
      .to('.birth-glow', { scale: 1, duration: 1, ease: 'power2.out' }, 10.25)
      .to('#birth-star', { autoAlpha: 0, scale: 2, duration: .5 }, 10.3)
      .from('.coords', { autoAlpha: 0, letterSpacing: '.8em', duration: .8 }, 10.4);
    textIn(pC, 10.5, tl);
    tl.to({}, { duration: .8 });
    G.follow($('#flame'), { when: () => dayActive && rocketFlying, ox: .5, oy: .6, spread: 8, vy: .8, gravity: .02 });
    G.follow($('#birth-star'), { when: () => dayActive && starFalling, spread: 5, vy: .2 });
  }

  // ---------- II 从那天起 ----------
  {
    const tl = pinTl('#days .stage', 180);
    const c1 = counter($('#days-num'), lived), c2 = counter($('#hours-num'), lived * 24);
    const c3 = counter($('#moons-num'), lived / 29.53), c4 = counter($('#summers-num'), age);
    tl.from('#days .eyebrow', { autoAlpha: 0, y: 14, duration: .4 })
      .from(chars('.days__lead'), { ...charIn, stagger: .03, duration: .4 }, .1)
      .from('.bignum', { autoAlpha: 0, scale: .85, filter: 'blur(10px)', duration: .7 }, .5)
      .to(c1.o, { v: lived, duration: 2.2, ease: 'power2.out', onUpdate: c1.onUpdate }, .5)
      .from('.stat', { autoAlpha: 0, y: 24, stagger: .15, duration: .6 }, 1.4)
      .to(c2.o, { v: lived * 24, duration: 1.6, ease: 'power2.out', onUpdate: c2.onUpdate }, 1.4)
      .to(c3.o, { v: lived / 29.53, duration: 1.6, ease: 'power2.out', onUpdate: c3.onUpdate }, 1.55)
      .to(c4.o, { v: age, duration: 1.6, ease: 'power2.out', onUpdate: c4.onUpdate }, 1.7)
      .from('.days__tail', { autoAlpha: 0, y: 14, filter: 'blur(6px)', duration: .7 }, 2.9)
      .to({}, { duration: .6 });
  }

  // ---------- III 长大 ----------
  {
    const pols = $$('.pol');
    const span = lastYear - 2003;
    const tl = pinTl('#grow .stage', 120 + growth.length * 70);
    const yr = { y: 2003 };
    tl.to(yr, { y: lastYear, duration: 10, ease: 'none', onUpdate: () => setYear(Math.floor(yr.y)) }, 0)
      .to('#rail-fill', { scaleX: 1, duration: 10, ease: 'none' }, 0);
    gsap.set(pols, { rotation: () => rand(-5, 5) });
    pols.forEach((p, i) => {
      if (i === 0) return;
      const at = Math.max(.2, ((growth[i].year - 2003) / span) * 10 - .7);
      tl.from(p, { x: () => innerWidth * .75, y: 60, rotation: rand(14, 24), autoAlpha: 0, duration: .9, ease: 'power3.out' }, at);
      for (let k = 0; k < i; k++) tl.to(pols[k], { y: '-=9', scale: '-=.035', filter: `brightness(${1 - (i - k) * .03})`, duration: .6 }, at + .2);
    });
    tl.to({}, { duration: .8 });
  }

  // ---------- IV 遇见 ----------
  {
    gsap.timeline({ scrollTrigger: { trigger: '.us-intro', start: 'top 75%', end: 'center 45%', scrub: 1 } })
      .from('.us-intro .eyebrow', { autoAlpha: 0, y: 16, duration: .4 })
      .from(chars('.us-intro .display'), { ...charIn, stagger: .05, duration: .5 }, .1)
      .from('.us-date', { autoAlpha: 0, letterSpacing: '.9em', duration: .6 }, .5)
      .from('.us-count', { autoAlpha: 0, y: 20, duration: .5 }, .7);
    const c = counter($('#together-num'), together);
    gsap.to(c.o, { v: together, duration: 2.4, ease: 'power2.out', onUpdate: c.onUpdate, scrollTrigger: { trigger: '.us-count', start: 'top 85%', toggleActions: 'play none none reverse' } });
    gsap.to('.us-intro', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.us-intro', start: 'center center', end: 'bottom top', scrub: true } });

    const track = $('#track');
    const dist = () => track.scrollWidth - innerWidth;
    const hTween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => `+=${dist() * 1.1}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
    });
    $$('.mcard', track).forEach((card) => {
      gsap.timeline({ scrollTrigger: { containerAnimation: hTween, trigger: card, start: 'left right', end: 'right left', scrub: true } })
        .fromTo(card, { rotation: 7, y: 46, scale: .88 }, { rotation: 0, y: 0, scale: 1, ease: 'sine.out', duration: 1 })
        .to(card, { rotation: -7, y: 46, scale: .88, ease: 'sine.in', duration: 1 });
      const img = $('.mcard__img', card);
      if (img) gsap.fromTo(img, { '--shine': '-70%' }, { '--shine': '70%', ease: 'none', scrollTrigger: { containerAnimation: hTween, trigger: card, start: 'left right', end: 'right left', scrub: true } });
    });
  }

  // ---------- V 争吵 ----------
  let stormActive = false, stormTl, loveTl;
  {
    const lines = $$('.sl');
    const n = lines.length;
    gsap.set('.rl', { autoAlpha: 0 });
    const tl = (stormTl = pinTl('#storm .stage', 440, {
      onToggle: (self) => { stormActive = self.isActive; if (!self.isActive) G.setRain(false); },
      onUpdate: (self) => {
        const p = self.progress;
        if (!stormActive) return;
        G.setRain(p > .03 && p < .56);
        G.setAmbient(p > .6 ? 1 : .12);
        if (bgm.ready) bgm.blendFx(M.fx.distant, M.fx.warm, clamp((p - .55) / .35));
      },
    }));
    tl.from('#storm .eyebrow', { autoAlpha: 0, duration: .4 }, 0);
    lines.forEach((l, i) => {
      tl.from(l, { autoAlpha: 0, y: 34, filter: 'blur(12px)', duration: .8 }, .3 + i);
      if (i > 0) tl.to(lines.slice(0, i), { opacity: .28, filter: 'blur(1.5px)', duration: .6 }, .3 + i);
    });
    const e = n + .6;
    tl.to(lines, { autoAlpha: 0, y: -30, filter: 'blur(14px)', stagger: .06, duration: .8, ease: 'power2.in' }, e)
      .to('#storm .eyebrow', { autoAlpha: 0, duration: .4 }, e)
      .to('.dawn', { scale: 1, duration: 1.8, ease: 'power2.out' }, e + .4)
      .addLabel('heartIn', e + .7)
      .to('.rl', { autoAlpha: 1, stagger: .5, duration: .8 }, e + 1.8)
      .from('.rl', { y: 24, filter: 'blur(8px)', stagger: .5, duration: .8 }, e + 1.8)
      .to({}, { duration: .8 });
  }

  // ---------- VI 相爱 ----------
  {
    const tl = (loveTl = pinTl('#love .stage', 280));
    tl.from(chars('#love .display'), { ...charIn, stagger: .06, duration: .6 }, .1)
      .from('.love-sub', { autoAlpha: 0, y: 16, filter: 'blur(6px)', duration: .7 }, .9)
      .from('#love-lines li', { autoAlpha: 0, y: 18, filter: 'blur(8px)', stagger: .45, duration: .7 }, 1.4)
      .to({}, { duration: 1 })
      .addLabel('heartOut')
      .to({}, { duration: 1.4 })
      .to('.love-text', { autoAlpha: 0, y: -30, filter: 'blur(8px)', duration: 1, ease: 'power2.in' }, '<.3');
  }

  // 碎钻爱心：吵架结束时聚拢，“相爱”结束时散开（按两段时间轴的进度计算，来回滑动都一致）
  {
    const sm = (x) => x * x * (3 - 2 * x);
    gsap.ticker.add(() => {
      const hin = clamp((stormTl.time() - stormTl.labels.heartIn) / 2.4);
      const hout = clamp((loveTl.time() - loveTl.labels.heartOut) / 1.4);
      G.state.heart = sm(hin) * (1 - sm(hout));
    });
  }

  // ---------- VII 生日 ----------
  {
    gsap.set('.candle-fire', { scale: 0, transformOrigin: '50% 100%' });
    const tl = pinTl('.bday-hero', 170);
    tl.to('.hb__text', { strokeDashoffset: 0, duration: 2.2, ease: 'power1.inOut' })
      .to('.hb__text', { fillOpacity: 1, strokeOpacity: .25, duration: .9 }, 1.6)
      .from(chars('.bday-cn'), { ...charIn, stagger: .05, duration: .5 }, 1.9)
      .from('.cake', { autoAlpha: 0, y: 70, scale: .88, duration: 1, ease: 'power3.out' }, 2.3)
      .to('.candle-fire', { scale: 1, stagger: .2, duration: .5, ease: 'back.out(2)' }, 3.1)
      .from('#cake-hint', { autoAlpha: 0, y: 10, duration: .5 }, 3.4)
      .to({}, { duration: .6 });

    const cake = $('#cake');
    let blown = false;
    cake.addEventListener('click', () => {
      if (blown) return;
      blown = true;
      gsap.to('.candle-fire', { scale: 0, autoAlpha: 0, duration: .4, stagger: .1, ease: 'power2.in' });
      smoke();
      const r = cake.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * .25;
      G.burst(cx, cy, 90, 6);
      G.confetti(cx, cy, 220);
      setTimeout(() => G.confetti(innerWidth * .15, innerHeight * .9, 120), 350);
      setTimeout(() => G.confetti(innerWidth * .85, innerHeight * .9, 120), 650);
      bgm.playBirthdaySong();
      gsap.to('#cake-hint', { autoAlpha: 0, duration: .3, onComplete: () => { $('#cake-hint').textContent = '愿望，一定会实现。'; gsap.to('#cake-hint', { autoAlpha: 1, duration: .6 }); } });
      setTimeout(() => lenis.scrollTo('#letter-zone', { duration: 2.6 }), 2600);
    });
    function smoke() {
      $$('.candle', cake).forEach((c) => {
        const flame = $('.candle-flame', c).getBBox();
        for (let k = 0; k < 3; k++) {
          const p = document.createElementNS(NS, 'path');
          const x = flame.x + flame.width / 2, y = flame.y + flame.height * .8;
          p.setAttribute('d', `M${x} ${y} q-6 -12 0 -24 q6 -12 0 -24`);
          p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#cfc6c0'); p.setAttribute('stroke-width', '2'); p.setAttribute('stroke-linecap', 'round');
          c.appendChild(p);
          gsap.fromTo(p, { opacity: .8, y: 0, scaleX: 1 }, { opacity: 0, y: -40, x: rand(-10, 10), scaleX: 2, duration: 2.2, delay: k * .25, ease: 'power1.out', onComplete: () => p.remove() });
        }
      });
    }
    cake.resetCandles = () => { blown = false; gsap.to('.candle-fire', { scale: 1, autoAlpha: 1, duration: .5 }); $('#cake-hint').textContent = '闭上眼睛许个愿，然后轻触蜡烛'; };

    // 信封
    gsap.from('.envelope', { autoAlpha: 0, y: 80, rotation: -4, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '#letter-zone', start: 'top 70%', toggleActions: 'play none none reverse' } });
    gsap.from('.env-hint', { autoAlpha: 0, duration: 1, delay: .6, scrollTrigger: { trigger: '#letter-zone', start: 'top 70%', toggleActions: 'play none none reverse' } });
    const env = $('#envelope'), letter = $('#letter');
    let openedLetter = false;
    env.addEventListener('click', () => {
      if (openedLetter) return;
      openedLetter = true;
      const r = env.getBoundingClientRect();
      gsap.timeline()
        .to('.env__seal', { scale: 1.3, duration: .2 })
        .to('.env__seal', { scale: 0, autoAlpha: 0, duration: .35, ease: 'back.in(2)' })
        .call(() => G.burst(r.left + r.width / 2, r.top + r.height * .56, 50, 4))
        .to('.env__flap', { rotationX: 180, duration: .8, ease: 'power2.inOut' })
        .set('.env__flap', { zIndex: 0 }, '-=.4')
        .to('.env__card', { yPercent: -62, duration: .9, ease: 'power3.out' })
        .to('.env-hint', { autoAlpha: 0, duration: .3 }, '<')
        .to(env, { autoAlpha: 0, y: 40, scale: .96, duration: .6, ease: 'power2.in' }, '+=.2')
        .add(() => {
          env.style.display = 'none';
          $('.env-hint').style.display = 'none';
          letter.style.display = 'block';
          ScrollTrigger.refresh();
          const lr = letter.getBoundingClientRect();
          G.burst(lr.left + lr.width / 2, lr.top + 40, 60, 5);
        })
        .from(letter, { autoAlpha: 0, y: 80, scale: .94, rotationX: -12, transformPerspective: 900, duration: 1.3, ease: 'power3.out' })
        .from('.letter__head', { autoAlpha: 0, y: 14, duration: .8 }, '-=.6')
        .from('#letter-body p', { autoAlpha: 0, y: 16, filter: 'blur(6px)', stagger: .55, duration: .9 }, '-=.3')
        .from('.letter__sign', { autoAlpha: 0, y: 12, duration: .8 }, '-=.2');
    });

    // 结尾
    gsap.from('.finale__t', { clipPath: 'inset(0 100% 0 0)', ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top 85%', end: 'center 55%', scrub: 1 } });
    gsap.from('.again', { autoAlpha: 0, y: 16, scrollTrigger: { trigger: '.again', start: 'top 95%', toggleActions: 'play none none reverse' } });
    $('#again').addEventListener('click', () => {
      lenis.scrollTo(0, { duration: 5, onComplete: () => cake.resetCandles() });
    });
  }

  /* =========================================================
   * 当前场景：切歌、配色、章节名
   * ========================================================= */
  let active = null;
  const chapterNum = $('.chapter__num'), chapterName = $('.chapter__name');
  function setActive(scene, force) {
    if (!opened || (active === scene && !force)) return;
    active = scene;
    tint(scene.dataset.tint);
    G.setAmbient(scene.id === 'storm' ? .12 : 1);
    if (scene.id !== 'storm') G.setRain(false);
    bgm.switchTo(scene.dataset.track);
    if (!scene.dataset.fxEnd) bgm.applyFx(M.fx[scene.dataset.fx]);
    gsap.timeline()
      .to('.chapter > *', { yPercent: -100, autoAlpha: 0, duration: .3, ease: 'power2.in' })
      .call(() => { chapterNum.textContent = scene.dataset.num; chapterName.textContent = scene.dataset.name; })
      .fromTo('.chapter > *', { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .5, ease: 'power3.out', stagger: .06 });
  }
  $$('.scene').forEach((scene) => {
    ScrollTrigger.create({
      trigger: scene, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => { if (self.isActive) setActive(scene); },
    });
  });
  gsap.to('.progress i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: .3 } });
  ScrollTrigger.sort();
  addEventListener('load', () => ScrollTrigger.refresh());

  /* =========================================================
   * 调音面板：网址后加 ?tune
   * ========================================================= */
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
      $('#tn-out').textContent = Object.values(bgm.tracks).map((t) => `${t.id}: start: ${t.start}, end: ${t.end}`).join('\n');
    }, 200);
  }
})();
