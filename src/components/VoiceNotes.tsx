import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Download, Mic, Pause, Play, RotateCcw } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { apiGet } from "@/lib/api";
import type { Memory } from "@/lib/types";
import { playPop } from "@/lib/sounds";

function formatTime(seconds: number) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

/** Voice notes from her — audio memories rendered as cozy custom players. */
export default function VoiceNotes() {
  const { data } = useQuery({
    queryKey: ["memories"],
    queryFn: () => apiGet<Memory[]>("/memories"),
  });
  const audios = (data ?? []).filter((m) => m.media_type === "audio");

  return (
    <section id="voice" className="relative py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          badge="Her Voice"
          title="Little Voice Notes 🎙️"
          subtitle="Because some memories are best captured in her own voice, laughter, and iconic words."
        />
        <div className="mt-10 flex flex-col gap-4">
          {audios.length === 0 ? (
            <div className="rounded-2xl border border-purple-500/20 bg-[#151632]/60 p-6 text-center text-pink-100/70 backdrop-blur-xl">
              Voice notes are loading 🎧
            </div>
          ) : (
            audios.map((a, i) => <VoiceCard key={a.id} memory={a} index={i} />)
          )}
        </div>
      </div>
    </section>
  );
}

function VoiceCard({ memory, index }: { memory: Memory; index: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTrackRef = useRef<HTMLDivElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Sync duration when metadata loads
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (!duration && audio.duration) {
        setDuration(audio.duration);
      }
    };

    const onEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [duration]);

  // Coordinate across voice cards: pause when another voice note plays
  useEffect(() => {
    const handleOtherPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      if (customEvent.detail?.id !== memory.id) {
        const audio = audioRef.current;
        if (audio && !audio.paused) {
          audio.pause();
          setPlaying(false);
        }
      }
    };

    window.addEventListener("voice-note-started", handleOtherPlay);
    return () => window.removeEventListener("voice-note-started", handleOtherPlay);
  }, [memory.id]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      playPop();
      window.dispatchEvent(new CustomEvent("voice-note-started", { detail: { id: memory.id } }));
      void audio.play();
      setPlaying(true);
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!playing) {
      void audio.play();
      setPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const track = progressTrackRef.current;
    const audio = audioRef.current;
    if (!track || !audio || !duration) return;

    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = pct * duration;
    setCurrentTime(audio.currentTime);
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative flex flex-col gap-3 rounded-3xl border p-5 backdrop-blur-xl transition-all sm:flex-row sm:items-center ${
        playing
          ? "border-pink-500/50 bg-[#171838]/90 shadow-[0_0_35px_rgba(255,117,143,0.25)]"
          : "border-pink-500/20 bg-[#151632]/70 shadow-[0_8px_32px_rgba(255,117,143,0.10)] hover:border-pink-500/40"
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          data-testid={`voice-note-play-${index + 1}`}
          aria-label={playing ? `Pause ${memory.title}` : `Play ${memory.title}`}
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-white transition-all active:scale-95 ${
            playing
              ? "bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 shadow-[0_0_28px_rgba(255,117,143,0.6)] scale-105"
              : "bg-gradient-to-br from-rose-500 to-purple-500 shadow-[0_0_20px_rgba(255,117,143,0.35)] hover:scale-105"
          }`}
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
        </button>

        <div className="min-w-0 sm:hidden">
          <p className="font-heading text-base font-bold text-white">{memory.title}</p>
          {memory.caption ? <p className="text-xs text-pink-200/80">{memory.caption}</p> : null}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="hidden sm:block">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-heading text-base font-bold text-white">{memory.title}</p>
            <span className="font-mono text-xs font-medium text-pink-200/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          {memory.caption ? <p className="mt-0.5 truncate text-xs text-pink-200/80">{memory.caption}</p> : null}
        </div>

        {/* Dancing equalizer visualizer */}
        <div className="mt-2.5 flex h-6 items-end gap-[3px]" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className={`w-[4px] rounded-full transition-all duration-150 ${
                playing ? "animate-[eq-bounce_0.75s_ease-in-out_infinite]" : "opacity-50"
              }`}
              style={{
                height: playing ? undefined : `${5 + ((i * 11) % 15)}px`,
                animationDelay: `${i * 0.05}s`,
                background: playing
                  ? `linear-gradient(to top, #ec4899, #f43f5e)`
                  : "rgba(192, 132, 252, 0.45)",
                ...(playing ? { height: `${6 + ((i * 9) % 16)}px` } : {}),
              }}
            />
          ))}
        </div>

        {/* Clickable scrub bar */}
        <div
          ref={progressTrackRef}
          onClick={handleTrackClick}
          className="group/track relative mt-2.5 h-2 w-full cursor-pointer overflow-hidden rounded-full bg-purple-500/20"
          title="Click to seek"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {/* Mobile timestamps */}
        <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-pink-200/70 sm:hidden">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-1.5 self-end sm:self-center">
        <button
          type="button"
          onClick={restart}
          title="Restart from beginning"
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-pink-200/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={cycleSpeed}
          title="Playback speed"
          className="rounded-full border border-white/10 px-2 py-1 text-xs font-bold text-pink-200/90 transition-colors hover:bg-white/10 hover:text-white"
        >
          {playbackRate}x
        </button>

        <a
          href={memory.image_url}
          download={memory.title}
          title="Download voice note"
          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-pink-200/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Download className="h-3.5 w-3.5" />
        </a>
      </div>

      <audio ref={audioRef} src={memory.image_url} preload="metadata" />
    </motion.div>
  );
}
