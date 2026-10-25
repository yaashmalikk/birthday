// Celebration sound effects synthesized with WebAudio — no audio assets, no network.
// Every call happens inside a user gesture (click), so the AudioContext is allowed to start.

let ctx: AudioContext | null = null;

function ac(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function noiseBuffer(duration: number): AudioBuffer {
  const context = ac();
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Deep booms + crackles — plays when the candles are blown out. */
export function playFireworks(): void {
  try {
    const context = ac();
    const now = context.currentTime;

    // three staggered booms
    [0, 0.28, 0.62].forEach((offset, i) => {
      const src = context.createBufferSource();
      src.buffer = noiseBuffer(0.9);
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(900 - i * 200, now + offset);
      filter.frequency.exponentialRampToValueAtTime(60, now + offset + 0.7);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.5, now + offset + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.85);
      src.connect(filter).connect(gain).connect(context.destination);
      src.start(now + offset);
      src.stop(now + offset + 0.95);
    });

    // sparkly crackles
    for (let i = 0; i < 10; i++) {
      const at = now + 0.2 + Math.random() * 1.6;
      const src = context.createBufferSource();
      src.buffer = noiseBuffer(0.08);
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2500 + Math.random() * 4500;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.14, at);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
      src.connect(filter).connect(gain).connect(context.destination);
      src.start(at);
      src.stop(at + 0.09);
    }
  } catch {
    /* audio is decorative — never break the flow for it */
  }
}

/** Soft pop for hugs / likes. */
export function playPop(): void {
  try {
    const context = ac();
    const now = context.currentTime;
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    /* decorative */
  }
}

/** Warm chime — candles relight / contract signed. */
export function playChime(): void {
  try {
    const context = ac();
    const now = context.currentTime;
    [880, 1108.7, 1318.5].forEach((freq, i) => {
      const osc = context.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const gain = context.createGain();
      const at = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.18, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.6);
      osc.connect(gain).connect(context.destination);
      osc.start(at);
      osc.stop(at + 0.65);
    });
  } catch {
    /* decorative */
  }
}

/** Tiny sparkle arpeggio — envelope opening. */
export function playSparkle(): void {
  try {
    const context = ac();
    const now = context.currentTime;
    [523.3, 659.3, 784, 1046.5].forEach((freq, i) => {
      const osc = context.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = context.createGain();
      const at = now + i * 0.09;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.15, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
      osc.connect(gain).connect(context.destination);
      osc.start(at);
      osc.stop(at + 0.5);
    });
  } catch {
    /* decorative */
  }
}
