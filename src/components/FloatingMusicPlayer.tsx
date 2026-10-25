import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play, Volume2, VolumeX } from "lucide-react";

// WebAudio synthesized Birthday Lofi Melody fallback
class SynthMusic {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private timer: number | null = null;
  private step = 0;

  // Happy Birthday notes (frequency in Hz) and durations in beats
  // C4, C4, D4, C4, F4, E4 | C4, C4, D4, C4, G4, F4 | C4, C4, C5, A4, F4, E4, D4 | Bb4, Bb4, A4, F4, G4, F4
  private melody: { freq: number; dur: number }[] = [
    { freq: 261.63, dur: 0.35 },
    { freq: 261.63, dur: 0.35 },
    { freq: 293.66, dur: 0.7 },
    { freq: 261.63, dur: 0.7 },
    { freq: 349.23, dur: 0.7 },
    { freq: 329.63, dur: 1.2 },

    { freq: 261.63, dur: 0.35 },
    { freq: 261.63, dur: 0.35 },
    { freq: 293.66, dur: 0.7 },
    { freq: 261.63, dur: 0.7 },
    { freq: 392.00, dur: 0.7 },
    { freq: 349.23, dur: 1.2 },

    { freq: 261.63, dur: 0.35 },
    { freq: 261.63, dur: 0.35 },
    { freq: 523.25, dur: 0.7 },
    { freq: 440.00, dur: 0.7 },
    { freq: 349.23, dur: 0.7 },
    { freq: 329.63, dur: 0.7 },
    { freq: 293.66, dur: 1.2 },

    { freq: 466.16, dur: 0.35 },
    { freq: 466.16, dur: 0.35 },
    { freq: 440.00, dur: 0.7 },
    { freq: 349.23, dur: 0.7 },
    { freq: 392.00, dur: 0.7 },
    { freq: 349.23, dur: 1.5 },
  ];

  start() {
    if (this.isPlaying) return;
    const Ctor = window.AudioContext || (window as any).webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.scheduleNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  private scheduleNext() {
    if (!this.isPlaying || !this.ctx) return;
    const note = this.melody[this.step % this.melody.length];
    this.step++;

    if (!this.isMuted) {
      this.playNote(note.freq, note.dur * 0.9);
    }

    this.timer = window.setTimeout(() => {
      this.scheduleNext();
    }, note.dur * 700);
  }

  private playNote(freq: number, dur: number) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Main soft bell / rhodes synth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);

      // Sub harmonic for warmth
      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq / 2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + dur + 0.05);
      osc2.stop(now + dur + 0.05);
    } catch {
      /* ignore */
    }
  }
}

export default function FloatingMusicPlayer() {
  const synthRef = useRef<SynthMusic | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [everStarted, setEverStarted] = useState(false);

  useEffect(() => {
    synthRef.current = new SynthMusic();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  const togglePlay = () => {
    const synth = synthRef.current;
    if (!synth) return;
    if (playing) {
      synth.stop();
      setPlaying(false);
    } else {
      synth.start();
      setPlaying(true);
      setEverStarted(true);
    }
  };

  const toggleMute = () => {
    const synth = synthRef.current;
    if (!synth) return;
    const nextMuted = !muted;
    synth.setMuted(nextMuted);
    setMuted(nextMuted);
  };

  return (
    <div
      data-testid="music-widget"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-pink-500/20 bg-[#0B0C1E]/85 px-4 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
    >
      <div className="relative grid h-10 w-10 place-items-center">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-rose-400 ${
            playing ? "animate-[spin-slow_4s_linear_infinite]" : ""
          }`}
        >
          <div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0B0C1E]" />
        </div>
        <Music className="relative z-10 h-4 w-4 text-white/95" />
      </div>

      <div className="flex items-end gap-[3px]" data-testid="music-equalizer" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full bg-pink-400 transition-all ${
              playing ? "animate-[eq-bounce_0.9s_ease-in-out_infinite]" : "h-[4px] opacity-40"
            }`}
            style={
              playing
                ? { height: "14px", animationDelay: `${i * 0.15}s` }
                : undefined
            }
          />
        ))}
      </div>

      <button
        type="button"
        onClick={togglePlay}
        data-testid={playing ? "music-pause-button" : "music-play-button"}
        aria-label={playing ? "Pause birthday music" : "Play birthday music"}
        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_18px_rgba(255,117,143,0.5)] transition-transform hover:scale-110 active:scale-95"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>

      <button
        type="button"
        onClick={toggleMute}
        data-testid="music-mute-button"
        aria-label={muted ? "Unmute music" : "Mute music"}
        className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-pink-100/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {!everStarted && !playing ? (
        <span className="absolute -top-9 right-0 whitespace-nowrap rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1 text-[11px] font-semibold text-white shadow-lg animate-bounce">
          Tap for birthday tunes ♪
        </span>
      ) : null}
    </div>
  );
}
