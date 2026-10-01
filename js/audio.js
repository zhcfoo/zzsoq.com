/* 声音引擎
 * 1. 背景音乐：每一章一段。放了音乐文件就播文件（跳前奏、区间循环），没放就由网页实时“作曲”——
 *    每章一首风格不同的合成曲（八音盒、钢琴、拨弦、铃音、柔和铺底），切章时交叉淡入淡出。
 * 2. 音效：开花铃音、翻页、火箭轰鸣、星星坠落、快门、雨声、雷声、心跳、点火、吹蜡烛、礼炮、拆信等，全部用 Web Audio 合成。
 * 链路：音乐 -> bus -> 低通 -> (干 + 混响) -> level -> duck -> master -> 压缩 -> 扬声器；音效 -> sfx -> master */
(function () {
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10];

  /* ---------------- 合成曲目 ---------------- */
  // chords: 每个和弦的 MIDI 音；arp: 八分音符位置上弹第几个和弦音（null = 休止）
  const PIECES = {
    dream: { name: 'Prelude · 序曲', bpm: 66, meter: 4, bpc: 1, key: 53, scale: MAJ,
      chords: [[53, 57, 60, 64], [57, 60, 64, 67], [58, 62, 65, 69], [60, 64, 67, 70]],
      arp: [0, 2, 4, 3, 5, 4, 2, 3], arpInst: 'musicbox', arpVel: .16, arpOct: 12,
      pad: .022, bass: .1, mel: { inst: 'bell', density: .22, lo: 77, hi: 89, vel: .06 } },
    bright: { name: 'Liftoff · 升空', bpm: 96, meter: 4, bpc: 1, key: 62, scale: MAJ,
      chords: [[50, 57, 62, 66], [57, 61, 64, 69], [59, 62, 66, 71], [55, 59, 62, 67]],
      arp: [0, 1, 2, 3, 4, 3, 2, 1], arpInst: 'pluck', arpVel: .1, arpOct: 12, sixteenth: true,
      pad: .018, bass: .13, bassHits: [0, 3, 4, 6], hats: .018, kick: .32,
      mel: { inst: 'bell', density: .35, lo: 74, hi: 88, vel: .06 } },
    tender: { name: 'Tender · 时光', bpm: 72, meter: 4, bpc: 1, key: 60, scale: MAJ,
      chords: [[48, 55, 60, 64], [47, 55, 59, 62], [45, 52, 57, 60], [41, 53, 57, 60]],
      arp: [0, 2, 3, 2, 4, 2, 3, 2], arpInst: 'piano', arpVel: .13, arpOct: 0,
      pad: .014, bass: .1, mel: { inst: 'piano', density: .3, lo: 72, hi: 84, vel: .1 } },
    waltz: { name: 'Waltz · 长大', bpm: 116, meter: 3, bpc: 1, key: 55, scale: MAJ, 
      chords: [[43, 59, 62, 67], [40, 59, 64, 67], [36, 60, 64, 67], [38, 57, 62, 66]],
      arp: [0, null, 1, 3, 2, 3], arpInst: 'musicbox', arpVel: .15, arpOct: 12,
      pad: .012, bass: .12, mel: { inst: 'musicbox', density: .45, lo: 79, hi: 91, vel: .11 } },
    sweet: { name: 'Sweet · 遇见', bpm: 84, meter: 4, bpc: 1, key: 64, scale: MAJ,
      chords: [[52, 59, 64, 68], [59, 63, 66, 71], [61, 64, 68, 73], [57, 61, 64, 69]],
      arp: [0, 2, 1, 3, 2, 4, 3, 2], arpInst: 'pluck', arpVel: .09, arpOct: 0,
      pad: .02, bass: .12, bassHits: [0, 3, 4], hats: .01,
      mel: { inst: 'piano', density: .4, lo: 71, hi: 83, vel: .12 } },
    blue: { name: 'Rain · 雨', bpm: 58, meter: 4, bpc: 2, key: 57, scale: MIN,
      chords: [[45, 52, 57, 60], [41, 53, 57, 60], [48, 52, 55, 60], [43, 50, 55, 59]],
      arp: [0, null, 2, null, 3, null, 2, null], arpInst: 'piano', arpVel: .1, arpOct: 0,
      pad: .024, bass: .09, mel: { inst: 'piano', density: .18, lo: 69, hi: 79, vel: .08 } },
    warm: { name: 'Everywhere · 相爱', bpm: 70, meter: 4, bpc: 1, key: 62, scale: MAJ,
      chords: [[54, 57, 62, 66], [55, 59, 62, 67], [57, 61, 64, 69], [59, 62, 66, 71]],
      arp: [0, 1, 2, 3, 4, 3, 2, 1], arpInst: 'piano', arpVel: .1, arpOct: 0,
      pad: .028, bass: .12, mel: { inst: 'bell', density: .3, lo: 74, hi: 86, vel: .07 } },
    celebrate: { name: 'Celebrate · 生日', bpm: 104, meter: 4, bpc: 1, key: 60, scale: MAJ,
      chords: [[48, 60, 64, 67], [45, 60, 64, 69], [41, 60, 65, 69], [43, 59, 62, 67]],
      arp: [0, 2, 1, 3, 2, 4, 3, 5], arpInst: 'musicbox', arpVel: .13, arpOct: 12, sixteenth: true,
      pad: .016, bass: .13, bassHits: [0, 4], hats: .014, kick: .26,
      mel: { inst: 'bell', density: .4, lo: 76, hi: 88, vel: .06 } },
  };

  /* ---------------- 乐器 ---------------- */
  function env(g, t, a, peak, decay) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + decay);
  }
  const INST = {
    musicbox(c, out, f, t, v) {
      [[1, 1], [2, .16], [3.98, .05]].forEach(([m, k]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f * m;
        env(g, t, .003, v * k, 1.9 / Math.sqrt(m));
        o.connect(g).connect(out); o.start(t); o.stop(t + 2.2);
      });
    },
    piano(c, out, f, t, v) {
      const lp = c.createBiquadFilter(); lp.type = 'lowpass';
      lp.frequency.setValueAtTime(Math.min(12000, f * 8), t);
      lp.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.5), t + 1.6);
      const g = c.createGain(); env(g, t, .004, v, 2.6);
      [['triangle', 1, 1], ['sine', 2, .35], ['sine', 3, .1]].forEach(([type, m, k]) => {
        const o = c.createOscillator(), og = c.createGain();
        o.type = type; o.frequency.value = f * m; og.gain.value = k;
        o.connect(og).connect(lp); o.start(t); o.stop(t + 2.8);
      });
      lp.connect(g).connect(out);
    },
    pluck(c, out, f, t, v) {
      const o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      lp.type = 'lowpass'; lp.Q.value = 3;
      lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(500, t + .3);
      env(g, t, .003, v, .7);
      o.connect(lp).connect(g).connect(out); o.start(t); o.stop(t + .9);
    },
    bell(c, out, f, t, v) {
      const car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain();
      car.type = 'sine'; car.frequency.value = f;
      mod.type = 'sine'; mod.frequency.value = f * 3.5;
      mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * .05, t + 1.4);
      env(g, t, .004, v, 2.8);
      mod.connect(mg).connect(car.frequency);
      car.connect(g).connect(out);
      car.start(t); mod.start(t); car.stop(t + 3); mod.stop(t + 3);
    },
  };

  class Composer {
    constructor(ctx, out, p, noise) {
      this.c = ctx; this.out = out; this.p = p; this.noise = noise;
      this.step = 0; this.timer = null; this.prevMel = Math.round((p.mel.lo + p.mel.hi) / 2);
    }
    start() {
      this.next = this.c.currentTime + .08;
      this.timer = setInterval(() => this.schedule(), 90);
      this.schedule();
    }
    stop() { clearInterval(this.timer); this.timer = null; }
    schedule() {
      const p = this.p, sub = p.sixteenth ? 4 : 2, dur = 60 / p.bpm / sub;
      while (this.next < this.c.currentTime + .5) { this.play(this.step++, this.next, sub, dur); this.next += dur; }
    }
    play(s, t, sub, dur) {
      const p = this.p, c = this.c, perBar = p.meter * sub;
      const bar = Math.floor(s / perBar), pos = s % perBar;
      const ci = Math.floor(bar / p.bpc) % p.chords.length;
      const chord = p.chords[ci];
      const barDur = perBar * dur;
      if (pos === 0 && bar % p.bpc === 0) this.pad(chord, t, barDur * p.bpc);
      // 低音
      const bassAt = p.bassHits || [0];
      if (pos % (sub / 2) === 0 && bassAt.includes(pos / (sub / 2))) this.bass(chord[0] - 12, t, p.bass * (pos ? .7 : 1));
      // 琶音
      const ai = p.arp[pos % p.arp.length];
      if (ai != null) {
        const sorted = chord.slice(1).length ? chord.slice(1) : chord;
        const n = sorted.length;
        const note = sorted[ai % n] + 12 * Math.floor(ai / n) + p.arpOct;
        INST[p.arpInst](c, this.out, midi(note), t, p.arpVel * (pos === 0 ? 1 : .8 + Math.random() * .2));
      }
      // 旋律：在调内音阶上小步游走，落在强拍时偏向和弦音
      const m = p.mel;
      if (pos % sub === 0 && Math.random() < m.density) {
        const cand = [];
        for (let x = m.lo; x <= m.hi; x++) if (p.scale.includes(((x - p.key) % 12 + 12) % 12)) cand.push(x);
        let near = cand.filter((x) => Math.abs(x - this.prevMel) <= 4);
        if (pos === 0) { const ct = near.filter((x) => chord.some((y) => (y - x) % 12 === 0)); if (ct.length) near = ct; }
        const note = near[Math.floor(Math.random() * near.length)] || this.prevMel;
        this.prevMel = note;
        INST[m.inst](c, this.out, midi(note), t + .005, m.vel);
      }
      // 节奏
      if (p.hats && pos % 2 === 1) this.hat(t, p.hats);
      if (p.kick && (pos === 0 || pos === perBar / 2)) this.kick(t, p.kick);
    }
    pad(chord, t, len) {
      const c = this.c, lp = c.createBiquadFilter(), g = c.createGain();
      lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = .4;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(this.p.pad, t + Math.min(1.4, len * .4));
      g.gain.setValueAtTime(this.p.pad, t + len - .3);
      g.gain.linearRampToValueAtTime(0, t + len + 1.2);
      chord.forEach((n) => [-7, 7].forEach((d) => {
        const o = c.createOscillator();
        o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = d;
        o.connect(lp); o.start(t); o.stop(t + len + 1.4);
      }));
      lp.connect(g).connect(this.out);
    }
    bass(n, t, v) {
      const c = this.c, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = midi(n);
      env(g, t, .02, v, 1.3);
      o.connect(g).connect(this.out); o.start(t); o.stop(t + 1.5);
    }
    hat(t, v) {
      const c = this.c, s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; hp.type = 'highpass'; hp.frequency.value = 7500;
      env(g, t, .002, v, .06);
      s.connect(hp).connect(g).connect(this.out); s.start(t, Math.random()); s.stop(t + .1);
    }
    kick(t, v) {
      const c = this.c, o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .14);
      env(g, t, .004, v, .3);
      o.connect(g).connect(this.out); o.start(t); o.stop(t + .4);
    }
  }

  /* ---------------- 引擎 ---------------- */
  class Bgm {
    constructor(cfg) {
      this.cfg = cfg;
      this.voices = {};
      this.current = null;
      this.scene = null;
      this.ready = false;
      this.muted = false;
      this.onchange = () => {};
    }

    unlock() {
      if (this.ready) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      const c = (this.ctx = new AC());
      this.comp = c.createDynamicsCompressor();
      this.comp.threshold.value = -24; this.comp.knee.value = 12; this.comp.ratio.value = 5;
      this.comp.attack.value = .01; this.comp.release.value = .25;
      this.makeup = c.createGain(); this.makeup.gain.value = 2.2;
      this.master = c.createGain(); this.master.gain.value = this.cfg.volume;
      this.duck = c.createGain();
      this.level = c.createGain();
      this.bus = c.createGain();
      this.filter = c.createBiquadFilter();
      this.filter.type = 'lowpass'; this.filter.frequency.value = 20000; this.filter.Q.value = .6;
      this.dry = c.createGain();
      this.wet = c.createGain(); this.wet.gain.value = .15;
      this.verb = c.createConvolver(); this.verb.buffer = this.impulse(3.4, 2.2);
      this.bus.connect(this.filter);
      this.filter.connect(this.dry).connect(this.level);
      this.filter.connect(this.verb).connect(this.wet).connect(this.level);
      this.level.connect(this.duck).connect(this.master);
      this.master.connect(this.comp).connect(this.makeup).connect(c.destination);
      this.sfxBus = c.createGain(); this.sfxBus.gain.value = this.cfg.sfxVolume ?? .8;
      this.sfxVerb = c.createGain(); this.sfxVerb.gain.value = .35;
      this.sfxBus.connect(this.master);
      this.sfxBus.connect(this.sfxVerb).connect(this.verb);
      this.noise = this.makeNoise(2);
      this.rainGain = null;

      c.resume();
      this.ready = true;
      setInterval(() => this.tick(), 100);
      document.addEventListener('visibilitychange', () => {
        const v = this.voices[this.current];
        if (document.hidden) {
          if (v && v.el) v.el.pause();
          c.suspend();
        } else {
          c.resume();
          if (v && v.el && v.playing) v.el.play().catch(() => {});
        }
      });
    }

    makeNoise(sec) {
      const c = this.ctx, b = c.createBuffer(1, c.sampleRate * sec, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      return b;
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
    ramp(param, value, dur) {
      const now = this.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(value, now + dur);
    }

    // 某一章该播什么：有可用的音乐文件就播文件，否则播这一章的合成曲
    voiceFor(sceneId) {
      const sc = this.cfg.scenes[sceneId];
      if (!sc) return null;
      if (sc.src) {
        const key = `song:${sc.src}#${sc.start || 0}`;
        let v = this.voices[key];
        if (!v) v = this.makeSong(key, sc);
        if (!v.missing) return v;
      }
      const key = `synth:${sc.synth}`;
      return this.voices[key] || this.makeSynth(key, sc.synth);
    }

    makeSong(key, sc) {
      const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.bus);
      const v = (this.voices[key] = { key, kind: 'song', title: sc.title, artist: sc.artist, start: sc.start || 0, end: sc.end || null, gain: g, pos: null, playing: false, missing: false, looping: false });
      const el = (v.el = new Audio());
      el.preload = 'metadata';
      el.addEventListener('error', () => {
        if (v.missing) return;
        v.missing = true;
        // 文件不存在：如果正在用它，立刻换成这一章的合成曲
        if (this.current === key) { this.current = null; this.ramp(g.gain, 0, .3); this.playScene(this.scene, true); }
      });
      el.addEventListener('ended', () => { if (v.playing) { el.currentTime = v.start; el.play().catch(() => {}); } });
      el.src = sc.src;
      try { this.ctx.createMediaElementSource(el).connect(g); } catch (e) { v.missing = true; }
      return v;
    }

    makeSynth(key, name) {
      const g = this.ctx.createGain(); g.gain.value = 0; g.connect(this.bus);
      const p = PIECES[name] || PIECES.dream;
      return (this.voices[key] = { key, kind: 'synth', title: p.name, artist: '', piece: p, gain: g, playing: false });
    }

    playScene(sceneId, force) {
      if (!this.ready) return;
      this.scene = sceneId;
      const v = this.voiceFor(sceneId);
      if (!v || (v.key === this.current && !force)) return;
      const prev = this.voices[this.current];
      if (prev && prev !== v) this.fadeOut(prev);
      this.current = v.key;
      this.fadeIn(v);
      this.onchange(v);
    }

    fadeIn(v) {
      clearTimeout(v.stopTimer);
      v.playing = true;
      this.ramp(v.gain.gain, 1, this.cfg.crossfade);
      if (v.kind === 'synth') {
        if (!v.comp) { v.comp = new Composer(this.ctx, v.gain, v.piece, this.noise); v.comp.start(); }
        return;
      }
      const el = v.el;
      el.preload = 'auto';
      if (el.paused) {
        const s = v.pos != null ? v.pos : v.start;
        if (el.readyState >= 1) el.currentTime = s;
        else el.addEventListener('loadedmetadata', () => { el.currentTime = s; }, { once: true });
        el.play().catch(() => {});
      }
    }

    fadeOut(v) {
      v.playing = false;
      this.ramp(v.gain.gain, 0, this.cfg.crossfade);
      clearTimeout(v.stopTimer);
      v.stopTimer = setTimeout(() => {
        if (v.playing) return;
        if (v.kind === 'synth') { if (v.comp) { v.comp.stop(); v.comp = null; } return; }
        v.pos = v.el.currentTime;
        v.el.pause();
      }, this.cfg.crossfade * 1000 + 200);
    }

    tick() {
      const v = this.voices[this.current];
      if (!v || v.kind !== 'song' || v.missing || !v.playing || v.looping || v.el.paused) return;
      const el = v.el, end = v.end || el.duration, lf = this.cfg.loopFade;
      if (!end || !isFinite(end)) return;
      if (el.currentTime >= end - lf) {
        v.looping = true;
        this.ramp(v.gain.gain, 0, lf);
        setTimeout(() => {
          v.looping = false;
          if (!v.playing) return;
          el.currentTime = v.start;
          if (el.paused) el.play().catch(() => {});
          this.ramp(v.gain.gain, 1, lf);
        }, lf * 1000);
      }
    }

    applyFx(f, smooth) {
      if (!this.ready || !f) return;
      const now = this.ctx.currentTime, tc = smooth == null ? .6 : smooth;
      this.filter.frequency.setTargetAtTime(f.cutoff, now, tc);
      this.wet.gain.setTargetAtTime(f.reverb, now, tc);
      this.dry.gain.setTargetAtTime(1 - f.reverb * .5, now, tc);
      this.level.gain.setTargetAtTime(f.level, now, tc);
    }
    blendFx(a, b, p) {
      const lerp = (x, y) => x + (y - x) * p;
      this.applyFx({ cutoff: Math.exp(lerp(Math.log(a.cutoff), Math.log(b.cutoff))), reverb: lerp(a.reverb, b.reverb), level: lerp(a.level, b.level) }, .15);
    }

    toggleMute() {
      if (!this.ready) return this.muted;
      this.muted = !this.muted;
      this.ramp(this.master.gain, this.muted ? 0 : this.cfg.volume, .6);
      return this.muted;
    }

    /* ---------------- 音效 ---------------- */
    noiseNode(t, dur, filters, g0) {
      const c = this.ctx, s = c.createBufferSource(), g = c.createGain();
      s.buffer = this.noise; s.loop = true;
      let node = s;
      filters.forEach(([type, f, q]) => { const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; node.connect(fl); node = fl; });
      node.connect(g).connect(this.sfxBus);
      s.start(t, Math.random()); s.stop(t + dur + .1);
      g.gain.value = g0 ?? 0;
      return { g, s, last: node };
    }
    tone(inst, notes, gap, vel, delay = 0) {
      const t = this.ctx.currentTime + delay;
      notes.forEach((n, i) => INST[inst](this.ctx, this.sfxBus, midi(n), t + i * gap, vel));
    }
    sfx(name, o = {}) {
      if (!this.ready || this.muted) return;
      const c = this.ctx, t = c.currentTime;
      switch (name) {
        case 'bloom':   // 花开：上行铃音
          this.tone('bell', [72, 76, 79, 83, 84, 88], .11, .07); break;
        case 'open': {  // 打开花束：一阵风 + 闪光琶音
          const n = this.noiseNode(t, 1.4, [['bandpass', 600, .8]]);
          n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(.35, t + .25); n.g.gain.exponentialRampToValueAtTime(.001, t + 1.4);
          n.last.frequency.setValueAtTime(400, t); n.last.frequency.exponentialRampToValueAtTime(4000, t + 1.2);
          this.tone('musicbox', [84, 88, 91, 96, 100, 103], .06, .12, .1); break;
        }
        case 'whoosh': { // 换章：轻轻的风声
          const n = this.noiseNode(t, .9, [['bandpass', 800, 1.2]]);
          n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(o.v ?? .12, t + .3); n.g.gain.exponentialRampToValueAtTime(.001, t + .9);
          n.last.frequency.setValueAtTime(300, t); n.last.frequency.exponentialRampToValueAtTime(2500, t + .8); break;
        }
        case 'rumble': { // 火箭点火：低频轰鸣
          const n = this.noiseNode(t, 3.2, [['lowpass', 180, .7]]);
          n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(.9, t + .5); n.g.gain.exponentialRampToValueAtTime(.001, t + 3.2);
          const o2 = c.createOscillator(), g2 = c.createGain();
          o2.frequency.setValueAtTime(38, t); o2.frequency.linearRampToValueAtTime(60, t + 2.5);
          env(g2, t, .4, .25, 2.6); o2.connect(g2).connect(this.sfxBus); o2.start(t); o2.stop(t + 3.2);
          const n2 = this.noiseNode(t + .3, 2.4, [['bandpass', 1200, .6]]);
          n2.g.gain.setValueAtTime(0, t + .3); n2.g.gain.linearRampToValueAtTime(.12, t + 1); n2.g.gain.exponentialRampToValueAtTime(.001, t + 2.7);
          n2.last.frequency.setValueAtTime(600, t); n2.last.frequency.exponentialRampToValueAtTime(3000, t + 2.6); break;
        }
        case 'ping':    // 轨道上的亮点
          this.tone('bell', [91], 0, .06); break;
        case 'shimmer': // CD 滑出：上行琶音
          this.tone('musicbox', [79, 83, 86, 91, 95, 98, 103], .07, .1); break;
        case 'fall':    // 星星坠落：下行闪光
          this.tone('bell', [100, 96, 93, 88, 84, 81], .09, .05); break;
        case 'land':    // 星星落海：温柔的大和弦
          this.tone('bell', [60, 67, 72, 76, 79], .03, .07);
          this.tone('musicbox', [84, 88, 91], .12, .1, .4); break;
        case 'tick': {
          const o2 = c.createOscillator(), g2 = c.createGain();
          o2.type = 'sine'; o2.frequency.value = 2600 + Math.random() * 300;
          env(g2, t, .001, .025, .03); o2.connect(g2).connect(this.sfxBus); o2.start(t); o2.stop(t + .06); break;
        }
        case 'shutter': { // 拍立得：快门 + 出片
          [0, .07].forEach((d, i) => {
            const n = this.noiseNode(t + d, .06, [['highpass', 2500]]);
            n.g.gain.setValueAtTime(0, t + d); n.g.gain.linearRampToValueAtTime(i ? .18 : .28, t + d + .003); n.g.gain.exponentialRampToValueAtTime(.001, t + d + .05);
          });
          const n = this.noiseNode(t + .15, .5, [['bandpass', 3000, 1]]);
          n.g.gain.setValueAtTime(0, t + .15); n.g.gain.linearRampToValueAtTime(.06, t + .3); n.g.gain.exponentialRampToValueAtTime(.001, t + .6); break;
        }
        case 'swish': { // 翻卡片：纸张划过
          const n = this.noiseNode(t, .45, [['bandpass', 2500, 1.4]]);
          n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(.13, t + .12); n.g.gain.exponentialRampToValueAtTime(.001, t + .45);
          n.last.frequency.setValueAtTime(1500, t); n.last.frequency.exponentialRampToValueAtTime(5000, t + .4); break;
        }
        case 'thunder': {
          const n = this.noiseNode(t, 4, [['lowpass', 260, .5]]);
          n.g.gain.setValueAtTime(0, t);
          let tt = t;
          for (let i = 0; i < 6; i++) { tt += .08 + Math.random() * .25; n.g.gain.linearRampToValueAtTime(.4 + Math.random() * .6, tt); }
          n.g.gain.exponentialRampToValueAtTime(.001, t + 4); break;
        }
        case 'dawn':    // 雨停：明亮的上行和弦
          this.tone('bell', [64, 71, 76, 79, 83, 88], .16, .06);
          this.tone('musicbox', [88, 91, 96], .2, .09, 1); break;
        case 'heartbeat': {
          [[0, .55], [.22, .35]].forEach(([d, v]) => {
            const o2 = c.createOscillator(), g2 = c.createGain();
            o2.frequency.setValueAtTime(70, t + d); o2.frequency.exponentialRampToValueAtTime(38, t + d + .14);
            env(g2, t + d, .01, v * (o.v ?? .5), .2); o2.connect(g2).connect(this.sfxBus); o2.start(t + d); o2.stop(t + d + .3);
          });
          break;
        }
        case 'sparkle': { // 点屏幕：一颗随机的高音
          const pent = [84, 86, 88, 91, 93, 96, 98, 100];
          INST.musicbox(c, this.sfxBus, midi(pent[Math.floor(Math.random() * pent.length)]), t, o.v ?? .05); break;
        }
        case 'ignite': {  // 点亮蜡烛
          const n = this.noiseNode(t, .5, [['bandpass', 1400, .7]]);
          n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(.12, t + .05); n.g.gain.exponentialRampToValueAtTime(.001, t + .45);
          this.tone('bell', [79], 0, .04, .05); break;
        }
        case 'blow': {    // 吹蜡烛
          const n = this.noiseNode(t, .9, [['bandpass', 900, .5], ['lowpass', 2500]]);
          n.g.gain.setValueAtTime(0, t); n.g.gain.linearRampToValueAtTime(.5, t + .2); n.g.gain.exponentialRampToValueAtTime(.001, t + .9); break;
        }
        case 'pop': {     // 礼炮
          const n = this.noiseNode(t, .25, [['highpass', 600]]);
          n.g.gain.setValueAtTime(.5, t); n.g.gain.exponentialRampToValueAtTime(.001, t + .2);
          const o2 = c.createOscillator(), g2 = c.createGain();
          o2.frequency.setValueAtTime(400, t); o2.frequency.exponentialRampToValueAtTime(80, t + .15);
          env(g2, t, .002, .3, .18); o2.connect(g2).connect(this.sfxBus); o2.start(t); o2.stop(t + .25);
          const n2 = this.noiseNode(t + .1, 1.4, [['highpass', 5000]]);
          n2.g.gain.setValueAtTime(0, t + .1);
          for (let i = 0; i < 14; i++) n2.g.gain.setValueAtTime(Math.random() * .08, t + .1 + i * .09);
          n2.g.gain.exponentialRampToValueAtTime(.001, t + 1.5); break;
        }
        case 'seal': {    // 拆封蜡
          const n = this.noiseNode(t, .08, [['highpass', 1800]]);
          n.g.gain.setValueAtTime(.35, t); n.g.gain.exponentialRampToValueAtTime(.001, t + .07);
          this.tone('bell', [88, 91], .08, .05, .05); break;
        }
        case 'paper': {   // 信纸展开
          const n = this.noiseNode(t, 1.1, [['bandpass', 3200, .9]]);
          n.g.gain.setValueAtTime(0, t);
          for (let i = 0; i < 10; i++) n.g.gain.linearRampToValueAtTime(.04 + Math.random() * .1, t + .05 + i * .09);
          n.g.gain.exponentialRampToValueAtTime(.001, t + 1.1); break;
        }
        default: break;
      }
    }

    // 雨声：持续的白噪声，音量随雨大小变化
    setRain(level) {
      if (!this.ready) return;
      if (!this.rainGain) {
        const c = this.ctx, s = c.createBufferSource(), hp = c.createBiquadFilter(), lp = c.createBiquadFilter();
        s.buffer = this.noise; s.loop = true;
        hp.type = 'highpass'; hp.frequency.value = 900; lp.type = 'lowpass'; lp.frequency.value = 7000;
        this.rainGain = c.createGain(); this.rainGain.gain.value = 0;
        s.connect(hp).connect(lp).connect(this.rainGain).connect(this.sfxBus);
        s.start();
      }
      this.rainGain.gain.setTargetAtTime(level * .16, this.ctx.currentTime, .5);
    }

    // 八音盒版《生日快乐》（旋律为公有领域），播放时背景音乐自动压低
    playBirthdaySong() {
      if (!this.ready) return;
      const c = this.ctx, beat = .42;
      const song = [
        [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
        [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
        [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
        [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3],
      ];
      let t = c.currentTime + .4;
      const total = song.reduce((s, n) => s + n[1], 0) * beat;
      this.ramp(this.duck.gain, .2, .8);
      song.forEach(([m, d]) => { INST.musicbox(c, this.sfxBus, midi(m + 12), t, .2); t += d * beat; });
      setTimeout(() => this.ramp(this.duck.gain, 1, 3), (total + 1.4) * 1000);
    }
  }

  window.Bgm = Bgm;
})();
