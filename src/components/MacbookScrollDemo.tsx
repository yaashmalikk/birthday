import React from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Sparkles, Heart } from "lucide-react";

export default function MacbookScrollDemo() {
  // Use relative base so assets load reliably on GitHub Pages and local dev
  const rawBase = import.meta.env.BASE_URL || "./";
  const normalizedBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
  const defaultImage = `${normalizedBase}media/DSC_0524.JPG`;

  return (
    <section className="relative w-full overflow-hidden bg-[#0B0C1E] py-10 md:py-20">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-pink-600/15 via-purple-600/15 to-transparent blur-3xl" />

      <MacbookScroll
        title={
          <div className="space-y-3 px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold text-pink-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
              <span>Scroll Down To Unfold Memories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              Every Memory, Captured in Ultra HD 💻✨
            </h2>
            <p className="max-w-xl mx-auto text-sm md:text-base text-pink-200/70">
              A private digital archive engineered just for you. Scroll down to open the MacBook and reveal the celebration.
            </p>
          </div>
        }
        badge={
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-black/80 px-3 py-1 text-xs font-medium text-pink-200 shadow-lg backdrop-blur-md">
            <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
            <span>Taniyaaa Edition · M3 Max</span>
          </div>
        }
        showGradient={true}
      >
        {/* Custom Screen Inside The Macbook */}
        <div className="relative h-full w-full bg-gradient-to-br from-[#12132C] via-[#1a1136] to-[#0a071b] p-4 text-white flex flex-col justify-between overflow-hidden">
          {/* macOS window header */}
          <div className="flex items-center justify-between border-b border-pink-500/20 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] font-mono tracking-wider text-pink-200/60 uppercase">
              birthday_universe_v1.0.app
            </span>
            <div className="text-[10px] text-pink-400/80 font-bold"> 100%</div>
          </div>

          {/* Central Hero Visual on the MacBook Screen */}
          <div className="relative my-auto flex items-center justify-center p-3">
            <div className="group relative overflow-hidden rounded-xl border border-pink-500/30 shadow-2xl shadow-pink-500/20 max-w-[280px]">
              <img
                src={defaultImage}
                alt="Birthday Special"
                className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  // Fallback if local image not found
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-pink-200">
                  Devi Ji · The Main Character 👑
                </span>
                <span className="text-[10px] text-pink-300/70">
                  Captured through the years
                </span>
              </div>
            </div>
          </div>

          {/* macOS dock at the bottom of the screen */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 p-1.5 backdrop-blur-md mx-auto">
            <span className="text-sm">🎂</span>
            <span className="text-sm">📸</span>
            <span className="text-sm">🎙️</span>
            <span className="text-sm">💌</span>
            <span className="text-sm">✨</span>
          </div>
        </div>
      </MacbookScroll>
    </section>
  );
}
