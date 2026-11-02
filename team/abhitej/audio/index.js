// Owner: Abhitej
// Procedural audio kit. No audio files, no AudioContext until unlock().
// Contract: docs/INTEGRATION.md, section "Abhitej". Validate: npm run check:team

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/** Roughly +/-5 percent, so repeated sounds do not machine-gun. */
function vary(freq) {
  return freq * (1 + (Math.random() * 0.1 - 0.05));
}

export function createAudioKit(options = {}) {
  const baseVolume = clamp(options.volume === undefined ? 0.8 : options.volume, 0, 1);

  let ctx = null;
  let bus = null;
  let muted = false;
  let noiseBuffer = null;

  let musicTimer = null;
  let musicGain = null;
  let musicStep = 0;

  let lastCollapse = 0;

  function ready() {
    return ctx !== null && ctx.state === 'running' && !muted;
  }

  function unlock() {
    if (typeof window === 'undefined') return;

    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }

    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;

    ctx = new Ctor();

    // A compressor, not hope. Keeps peaks under control when six sounds stack.
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.12;

    bus = ctx.createGain();
    bus.gain.value = muted ? 0 : baseVolume;

    limiter.connect(bus);
    bus.connect(ctx.destination);

    // One reusable noise buffer for all the noisy sounds.
    const frames = Math.floor(ctx.sampleRate * 0.5);
    noiseBuffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = Math.random() * 2 - 1;

    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(spec) {
    if (!ready()) return;
    const type = spec.type || 'square';
    const dur = spec.dur || 0.12;
    const gain = spec.gain === undefined ? 0.2 : spec.gain;
    const delay = spec.delay || 0;
    const attack = spec.attack || 0.004;

    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, vary(spec.freq)), t0);
    if (spec.to) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, spec.to), t0 + dur);
    }

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(env);
    env.connect(ctx.destination === bus ? bus : bus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function noise(spec) {
    if (!ready() || !noiseBuffer) return;
    const dur = spec.dur || 0.08;
    const gain = spec.gain === undefined ? 0.12 : spec.gain;
    const cutoff = spec.cutoff || 1800;
    const delay = spec.delay || 0;

    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    src.buffer = noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;

    env.gain.setValueAtTime(gain, t0);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(filter);
    filter.connect(env);
    env.connect(bus);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  return {
    unlock,

    hookFire() {
      noise({ dur: 0.05, gain: 0.1, cutoff: 3200 });
      tone({ type: 'sawtooth', freq: 520, to: 900, dur: 0.09, gain: 0.12 });
    },

    hookAttach() {
      tone({ type: 'square', freq: 240, to: 110, dur: 0.08, gain: 0.2 });
      noise({ dur: 0.04, gain: 0.08, cutoff: 900 });
    },

    beacon() {
      tone({ type: 'triangle', freq: 660, dur: 0.1, gain: 0.18 });
      tone({ type: 'triangle', freq: 990, dur: 0.16, gain: 0.16, delay: 0.08 });
    },

    hurt() {
      tone({ type: 'sawtooth', freq: 170, to: 65, dur: 0.24, gain: 0.24 });
      noise({ dur: 0.14, gain: 0.12, cutoff: 700 });
    },

    collapseTick(level) {
      const now = Date.now();
      if (now - lastCollapse < 250) return;
      lastCollapse = now;

      const closeness = clamp(level === undefined ? 0 : level, 0, 1);
      tone({
        type: 'sine',
        freq: 90 + closeness * 70,
        dur: 0.05 + closeness * 0.04,
        gain: 0.1 + closeness * 0.1
      });
    },

    win() {
      [523, 659, 784, 1047].forEach((freq, index) => {
        tone({ type: 'triangle', freq, dur: 0.22, gain: 0.16, delay: index * 0.11 });
      });
    },

    lose() {
      [392, 330, 262].forEach((freq, index) => {
        tone({ type: 'sawtooth', freq, dur: 0.3, gain: 0.14, delay: index * 0.16 });
      });
    },

    uiConfirm() {
      tone({ type: 'square', freq: 880, dur: 0.05, gain: 0.1 });
    },

    uiCancel() {
      tone({ type: 'square', freq: 330, to: 220, dur: 0.07, gain: 0.1 });
    },

    startMusic() {
      if (!ready() || musicTimer) return;

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.05;
      musicGain.connect(bus);

      // A minor arpeggio, sparse on purpose so effects stay on top.
      const notes = [220, 261.6, 329.6, 392, 329.6, 261.6, 196, 261.6];

      musicStep = 0;
      musicTimer = setInterval(() => {
        if (!ready() || !musicGain) return;
        const freq = notes[musicStep % notes.length];
        musicStep += 1;

        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        env.gain.setValueAtTime(0.0001, t0);
        env.gain.exponentialRampToValueAtTime(1, t0 + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
        osc.connect(env);
        env.connect(musicGain);
        osc.start(t0);
        osc.stop(t0 + 0.36);
      }, 280);
    },

    stopMusic() {
      if (musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
      }
      if (musicGain && ctx) {
        musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      }
      musicGain = null;
    },

    setMuted(next) {
      muted = Boolean(next);
      if (bus && ctx) {
        bus.gain.setTargetAtTime(muted ? 0 : baseVolume, ctx.currentTime, 0.02);
      }
    },

    isMuted() {
      return muted;
    },

    dispose() {
      if (musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
      }
      musicGain = null;
      if (ctx) {
        ctx.close();
        ctx = null;
      }
      bus = null;
      noiseBuffer = null;
    }
  };
}
