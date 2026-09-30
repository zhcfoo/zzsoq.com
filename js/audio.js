/* 背景音乐引擎：分段切歌、交叉淡入淡出、跳过前奏、区间循环、实时滤波/混响处理。
 * 音频链路：每首歌 -> 各自的 gain -> bus -> 低通滤波 -> (干声 + 混响) -> duck -> master -> 扬声器 */
(function () {
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // 没有放音乐文件时的合成氛围音
  const SYNTHS = {
    dream:  { len: 4.2, chords: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], sparkle: 0.5 },
    bright: { len: 3.2, chords: [[48, 55, 60, 64], [47, 55, 59, 62], [45, 52, 57, 60], [41, 53, 57, 60]], sparkle: 0.8 },
    blue:   { len: 5.0, chords: [[45, 52, 57, 60], [41, 53, 57, 60], [48, 52, 55, 60], [43, 50, 55, 59]], sparkle: 0.2 },
    warm:   { len: 4.0, chords: [[50, 57, 62, 66], [49, 57, 61, 64], [47, 54, 59, 62], [43, 55, 59, 62]], sparkle: 0.6 },
  };

  class PadSynth {
    constructor(ctx, out, preset) {
      this.ctx = ctx; this.out = out; this.p = preset; this.i = 0; this.next = 0; this.timer = null;
    }
    start() {
      this.next = this.ctx.currentTime + 0.05;
      this.timer = setInterval(() => this.schedule(), 250);
      this.schedule();
    }
    stop() { clearInterval(this.timer); this.timer = null; }
    schedule() {
      const c = this.ctx;
      while (this.next < c.currentTime + 1.5) {
        const chord = this.p.chords[this.i++ % this.p.chords.length];
        const t = this.next, len = this.p.len;
        chord.forEach((m, k) => {
          ['triangle', 'sine'].forEach((type, j) => {
            const o = c.createOscillator(), g = c.createGain();
            o.type = type; o.frequency.value = midi(m + (j ? 12 : 0));
            o.detune.value = (k - 1.5) * 4 + (j ? 3 : -3);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(j ? 0.018 : 0.035, t + 1.4);
            g.gain.setTargetAtTime(0, t + len - 0.2, 0.9);
            o.connect(g).connect(this.out);
            o.start(t); o.stop(t + len + 4);
          });
        });
        // 高音区零星的“闪光”音符
        const beats = Math.floor(len / 0.8);
        for (let b = 0; b < beats; b++) {
          if (Math.random() > this.p.sparkle) continue;
          const m = chord[Math.floor(Math.random() * chord.length)] + 24;
          const tt = t + b * 0.8 + Math.random() * 0.1;
          const o = c.createOscillator(), g = c.createGain();
          o.type = 'sine'; o.frequency.value = midi(m);
          g.gain.setValueAtTime(0, tt);
          g.gain.linearRampToValueAtTime(0.03, tt + 0.01);
          g.gain.exponentialRampToValueAtTime(0.0005, tt + 2.2);
          o.connect(g).connect(this.out);
          o.start(tt); o.stop(tt + 2.4);
        }
        this.next += len;
      }
    }
  }

  class Bgm {
    constructor(cfg) {
      this.cfg = cfg;
      this.tracks = {};
      this.current = null;
      this.ready = false;
      this.muted = false;
      this.onchange = () => {};
    }

    unlock() {
      if (this.ready) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      const c = (this.ctx = new AC());
      this.master = c.createGain(); this.master.gain.value = this.cfg.volume;
      this.duck = c.createGain();
      this.level = c.createGain();
      this.bus = c.createGain();
      this.filter = c.createBiquadFilter();
      this.filter.type = 'lowpass'; this.filter.frequency.value = 20000; this.filter.Q.value = 0.6;
      this.dry = c.createGain();
      this.wet = c.createGain(); this.wet.gain.value = 0.15;
      this.verb = c.createConvolver(); this.verb.buffer = this.impulse(3.4, 2.2);

      this.bus.connect(this.filter);
      this.filter.connect(this.dry).connect(this.level);
      this.filter.connect(this.verb).connect(this.wet).connect(this.level);
      this.level.connect(this.duck).connect(this.master).connect(c.destination);

      // 音效（生日歌八音盒）不经过滤波，但带一点混响
      this.sfx = c.createGain();
      this.sfx.connect(this.master);
      this.sfx.connect(this.verb);

      Object.entries(this.cfg.tracks).forEach(([id, t]) => this.makeTrack(id, t));
      c.resume();
      this.ready = true;
      setInterval(() => this.tick(), 100);

      document.addEventListener('visibilitychange', () => {
        const tr = this.tracks[this.current];
        if (document.hidden) {
          if (tr && !tr.missing) tr.el.pause();
          c.suspend();
        } else {
          c.resume();
          if (tr && !tr.missing && tr.playing) tr.el.play().catch(() => {});
        }
      });
    }

    impulse(seconds, decay) {
      const c = this.ctx, n = Math.floor(c.sampleRate * seconds);
      const buf = c.createBuffer(2, n, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
      }
      return buf;
    }

    makeTrack(id, t) {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.connect(this.bus);
      const tr = (this.tracks[id] = { id, ...t, gain: g, pos: null, playing: false, missing: false, looping: false });
      const el = (tr.el = new Audio());
      el.preload = 'metadata';
      el.addEventListener('error', () => {
        tr.missing = true;
        if (tr.playing) this.startSynth(tr);
        if (this.current === id) this.onchange(tr);
      });
      el.addEventListener('ended', () => {
        if (!tr.playing) return;
        this.seek(el, tr.start || 0);
        el.play().catch(() => {});
      });
      el.src = t.src;
      try {
        this.ctx.createMediaElementSource(el).connect(g);
      } catch (e) {
        tr.missing = true; // 极少数浏览器不支持，退回合成音
      }
    }

    seek(el, s) {
      if (el.readyState >= 1) el.currentTime = s;
      else el.addEventListener('loadedmetadata', () => { el.currentTime = s; }, { once: true });
    }

    ramp(param, value, dur) {
      const now = this.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(value, now + dur);
    }

    switchTo(id) {
      if (!this.ready || this.current === id || !this.tracks[id]) return;
      const prev = this.tracks[this.current];
      if (prev) this.fadeOut(prev);
      this.current = id;
      this.fadeIn(this.tracks[id]);
      this.onchange(this.tracks[id]);
    }

    fadeIn(tr) {
      clearTimeout(tr.stopTimer);
      tr.playing = true;
      tr.looping = false;
      this.ramp(tr.gain.gain, 1, this.cfg.crossfade);
      if (tr.missing) return this.startSynth(tr);
      const el = tr.el;
      el.preload = 'auto';
      if (el.paused) {
        this.seek(el, tr.pos != null ? tr.pos : tr.start || 0);
        el.play().catch(() => {});
      }
      // 当前这首开始后，顺便预加载其他歌，切换时更顺
      setTimeout(() => Object.values(this.tracks).forEach((t) => { if (!t.missing) t.el.preload = 'auto'; }), 4000);
    }

    fadeOut(tr) {
      tr.playing = false;
      this.ramp(tr.gain.gain, 0, this.cfg.crossfade);
      clearTimeout(tr.stopTimer);
      tr.stopTimer = setTimeout(() => {
        if (tr.playing) return;
        if (!tr.missing) {
          tr.pos = tr.el.currentTime; // 回来时接着放，而不是重头再来
          tr.el.pause();
        }
        this.stopSynth(tr);
      }, this.cfg.crossfade * 1000 + 150);
    }

    startSynth(tr) {
      if (tr.synthObj) return;
      tr.synthObj = new PadSynth(this.ctx, tr.gain, SYNTHS[tr.synth] || SYNTHS.dream);
      tr.synthObj.start();
    }

    stopSynth(tr) {
      if (tr.synthObj) { tr.synthObj.stop(); tr.synthObj = null; }
    }

    // 区间循环：快到 end 时淡出，跳回 start 再淡入
    tick() {
      const tr = this.tracks[this.current];
      if (!tr || tr.missing || !tr.playing || tr.looping || tr.el.paused) return;
      const el = tr.el;
      const end = tr.end || el.duration;
      if (!end || !isFinite(end)) return;
      const lf = this.cfg.loopFade;
      if (el.currentTime >= end - lf) {
        tr.looping = true;
        this.ramp(tr.gain.gain, 0, lf);
        setTimeout(() => {
          tr.looping = false;
          if (!tr.playing) return;
          el.currentTime = tr.start || 0;
          if (el.paused) el.play().catch(() => {});
          this.ramp(tr.gain.gain, 1, lf);
        }, lf * 1000);
      }
    }

    applyFx(f, smooth) {
      if (!this.ready || !f) return;
      const now = this.ctx.currentTime, tc = smooth == null ? 0.6 : smooth;
      this.filter.frequency.setTargetAtTime(f.cutoff, now, tc);
      this.wet.gain.setTargetAtTime(f.reverb, now, tc);
      this.dry.gain.setTargetAtTime(1 - f.reverb * 0.5, now, tc);
      this.level.gain.setTargetAtTime(f.level, now, tc);
    }

    // 在两种处理之间按进度 p 渐变（例如吵架段落从“闷”慢慢变“清楚”）
    blendFx(a, b, p) {
      const lerp = (x, y) => x + (y - x) * p;
      this.applyFx({
        cutoff: Math.exp(lerp(Math.log(a.cutoff), Math.log(b.cutoff))),
        reverb: lerp(a.reverb, b.reverb),
        level: lerp(a.level, b.level),
      }, 0.15);
    }

    toggleMute() {
      if (!this.ready) return this.muted;
      this.muted = !this.muted;
      this.ramp(this.master.gain, this.muted ? 0 : this.cfg.volume, 0.6);
      return this.muted;
    }

    // 八音盒版《生日快乐》（旋律为公有领域），播放时背景音乐自动压低
    playBirthdaySong() {
      if (!this.ready) return;
      const c = this.ctx, beat = 0.42;
      const song = [
        [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
        [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
        [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
        [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3],
      ];
      let t = c.currentTime + 0.3;
      const total = song.reduce((s, n) => s + n[1], 0) * beat;
      this.ramp(this.duck.gain, 0.25, 0.8);
      song.forEach(([m, d]) => {
        [[1, 0.16], [2, 0.05], [4, 0.015]].forEach(([mul, vol]) => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = 'sine'; o.frequency.value = midi(m + 12) * mul;
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
          o.connect(g).connect(this.sfx);
          o.start(t); o.stop(t + 1.7);
        });
        t += d * beat;
      });
      setTimeout(() => this.ramp(this.duck.gain, 1, 3), (total + 1.2) * 1000);
    }
  }

  window.Bgm = Bgm;
})();
