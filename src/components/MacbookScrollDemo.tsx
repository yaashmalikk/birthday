import React, { useState, useEffect } from "react";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { Sparkles, Heart, ExternalLink, Film, Play } from "lucide-react";
import { DRIVE_MEDIA_ITEMS, GOOGLE_DRIVE_FOLDER_URL } from "@/data/driveMedia";

export default function MacbookScrollDemo() {
  const [slideIdx, setSlideIdx] = useState(0);

  // Rotate through a few showcase images on the Macbook screen
  useEffect(() => {
    if (DRIVE_MEDIA_ITEMS.length === 0) return;
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % Math.min(8, DRIVE_MEDIA_ITEMS.length));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activeMedia = DRIVE_MEDIA_ITEMS[slideIdx] || DRIVE_MEDIA_ITEMS[0];

  return (
    <section className="relative w-full overflow-hidden bg-[#0B0C1E] py-10 md:py-20">
      {/* Subtle ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-tr from-pink-600/15 via-purple-600/15 to-transparent blur-3xl" />

      <MacbookScroll
        title={
          <div className="space-y-3 px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold text-pink-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-pink-400 animate-pulse" />
              <span>Scroll Down To Unfold The Presentation</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 bg-clip-text text-transparent">
              Every Memory, Captured in Ultra HD 💻✨
            </h2>
            <p className="max-w-xl mx-auto text-sm md:text-base text-pink-200/70">
              A private digital presentation engineered just for you. Scroll down to open the MacBook and watch your moments in 4K resolution.
            </p>
          </div>
        }
        badge={
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-black/80 px-3 py-1 text-xs font-medium text-pink-200 shadow-lg backdrop-blur-md">
            <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
            <span>Taniyaaa Edition · Google Drive Stream</span>
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
              taniya_presentation_slides.key
            </span>
            <div className="text-[10px] text-pink-400/80 font-bold"> 100%</div>
          </div>

          {/* Central Hero Visual on the MacBook Screen */}
          <div className="relative my-auto flex items-center justify-center p-2">
            <div className="group relative overflow-hidden rounded-xl border border-pink-500/30 shadow-2xl shadow-pink-500/20 max-w-[280px]">
              <img
                src={activeMedia?.thumbnail_url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80"}
                alt={activeMedia?.title || "Birthday Special"}
                referrerPolicy="no-referrer"
                className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-200 truncate">
                    {activeMedia?.title || "Devi Ji · The Main Character 👑"}
                  </span>
                  <span className="rounded bg-pink-500/80 px-1 py-0.5 text-[9px] font-mono text-white">
                    #{slideIdx + 1}/48
                  </span>
                </div>
                <span className="text-[10px] text-pink-300/70 truncate mt-0.5">
                  {activeMedia?.name || "Google Drive Presentation"}
                </span>
              </div>
            </div>
          </div>

          {/* macOS dock at the bottom of the screen */}
          <div className="flex items-center justify-center gap-3 rounded-xl bg-white/5 border border-white/10 p-1.5 backdrop-blur-md mx-auto">
            <a
              href="#presentation"
              className="text-xs font-semibold text-pink-300 hover:text-white flex items-center gap-1"
            >
              <Film className="h-3 w-3" />
              <span>Full Presentation</span>
            </a>
            <span className="text-white/20">|</span>
            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Google Drive</span>
            </a>
          </div>
        </div>
      </MacbookScroll>
    </section>
  );
}
