import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Folder,
  ExternalLink,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
  Copy,
  Check,
  Sparkles,
  Film,
  Cloud,
  Maximize2,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import { Button } from "@/components/ui/button";
import {
  DRIVE_MEDIA_ITEMS,
  GOOGLE_DRIVE_FOLDER_URL,
  GOOGLE_DRIVE_EMBED_FOLDER_URL,
  DriveMediaItem,
} from "@/data/driveMedia";
import { getDriveImageFallback } from "@/lib/memoriesData";

export default function MediaPresentation() {
  const [activeTab, setActiveTab] = useState<"presentation" | "grid" | "embed">("presentation");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<"all" | "video" | "photo">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalItem, setActiveModalItem] = useState<DriveMediaItem | null>(null);

  const totalItems = DRIVE_MEDIA_ITEMS.length;
  const currentItem = DRIVE_MEDIA_ITEMS[currentIndex] || DRIVE_MEDIA_ITEMS[0];

  // Auto-play slideshow for presentation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, totalItems]);

  const copyFolderLink = () => {
    navigator.clipboard.writeText(GOOGLE_DRIVE_FOLDER_URL);
    setCopied(true);
    toast.success("Google Drive Folder link copied to clipboard! 📋");
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  // Filtered items for the grid
  const filteredItems = useMemo(() => {
    return DRIVE_MEDIA_ITEMS.filter((item) => {
      const matchesType = filter === "all" ? true : item.media_type === filter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caption.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filter, searchQuery]);

  const videoCount = DRIVE_MEDIA_ITEMS.filter((i) => i.media_type === "video").length;
  const photoCount = DRIVE_MEDIA_ITEMS.filter((i) => i.media_type === "photo").length;

  return (
    <section id="presentation" className="relative w-full overflow-hidden py-20 md:py-28 bg-[#0B0C1E]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-600/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-pink-600/15 to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* Section Heading */}
        <SectionHeading
          badge="Google Drive Presentation & Cloud Vault"
          title="Taniya's Media Presentation 🎬✨"
          subtitle="All 48 authentic moments streamed directly from Google Drive in high resolution. Browse the interactive theater, explore the full grid, or open directly in Drive."
        />

        {/* Global Action Header Bar */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-pink-500/25 bg-[#12132C]/80 p-4 md:p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(255,117,143,0.12)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 px-3 py-1 text-xs font-semibold text-pink-200">
              <Cloud className="h-3.5 w-3.5 text-pink-400" />
              <span>Drive Folder: Taniya</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-medium text-purple-200">
              <Film className="h-3.5 w-3.5 text-purple-400" />
              <span>{totalItems} Media Files</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-medium text-rose-200">
              <Video className="h-3.5 w-3.5 text-rose-400" />
              <span>{videoCount} Videos</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-medium text-amber-200">
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>{photoCount} HD Photos</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={copyFolderLink}
              className="border-pink-500/30 bg-pink-500/10 text-pink-200 hover:bg-pink-500/20 text-xs gap-1.5"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Link Copied!" : "Copy Drive Link"}</span>
            </Button>

            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,117,143,0.35)] transition-transform hover:scale-105 active:scale-95"
            >
              <Folder className="h-3.5 w-3.5" />
              <span>Open in Google Drive ↗</span>
            </a>
          </div>
        </div>

        {/* Presentation Navigation Tabs */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-pink-500/25 bg-[#151632]/90 p-1.5 backdrop-blur-xl shadow-lg">
            <button
              type="button"
              onClick={() => setActiveTab("presentation")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
                activeTab === "presentation"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(255,117,143,0.4)]"
                  : "text-pink-200/70 hover:text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span>Presentation Theater</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("grid")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
                activeTab === "grid"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(255,117,143,0.4)]"
                  : "text-pink-200/70 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>All 48 Media Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("embed")}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all ${
                activeTab === "embed"
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(255,117,143,0.4)]"
                  : "text-pink-200/70 hover:text-white"
              }`}
            >
              <Cloud className="h-3.5 w-3.5" />
              <span>Google Drive Explorer</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PRESENTATION THEATER */}
        {activeTab === "presentation" && (
          <div className="mt-8 space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-[#12132C] shadow-[0_12px_48px_rgba(255,117,143,0.2)]">
              {/* Top Bar of Theater */}
              <div className="flex items-center justify-between border-b border-pink-500/20 bg-black/40 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 rounded-full bg-rose-500" />
                  <span className="flex h-3 w-3 rounded-full bg-amber-500" />
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 font-mono text-xs text-pink-200/80">
                    Slide {currentIndex + 1} of {totalItems} · {currentItem.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {currentItem.media_type === "video" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[11px] font-bold text-purple-300">
                      <Video className="h-3 w-3" /> Video Clip
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/20 border border-pink-500/40 px-2.5 py-0.5 text-[11px] font-bold text-pink-300">
                      <ImageIcon className="h-3 w-3" /> Ultra HD Photo
                    </span>
                  )}
                  <a
                    href={currentItem.drive_view_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white transition-colors"
                  >
                    <span>Drive Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Central Viewing Frame */}
              <div className="relative flex min-h-[380px] md:min-h-[520px] w-full items-center justify-center bg-black/60 p-2 md:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.35 }}
                    className="relative max-h-[70vh] w-full flex items-center justify-center overflow-hidden rounded-2xl"
                  >
                    {currentItem.media_type === "video" ? (
                      <div className="relative h-[380px] md:h-[500px] w-full max-w-3xl overflow-hidden rounded-2xl border border-purple-500/30 bg-black">
                        <iframe
                          src={currentItem.preview_url}
                          title={currentItem.title}
                          className="h-full w-full border-0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="group relative max-h-[65vh] overflow-hidden rounded-2xl border border-pink-500/30">
                        <img
                          src={currentItem.thumbnail_url}
                          alt={currentItem.title}
                          referrerPolicy="no-referrer"
                          className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const fallback = getDriveImageFallback(currentItem.thumbnail_url);
                            if (fallback && fallback !== img.src) img.src = fallback;
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Left / Right Arrow Overlays */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 hover:bg-black/90 active:scale-95"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 hover:bg-black/90 active:scale-95"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* Bottom Details & Controls Bar */}
              <div className="border-t border-pink-500/20 bg-gradient-to-r from-[#12132C] via-[#1a1136] to-[#12132C] p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-white">
                      {currentItem.title}
                    </h3>
                    <p className="mt-1 text-xs md:text-sm text-pink-200/80">
                      {currentItem.caption}
                    </p>
                  </div>

                  {/* Player Controls */}
                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrev}
                      className="border-pink-500/30 bg-black/40 hover:bg-pink-500/20 text-white"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="border-pink-500/40 bg-pink-500/20 hover:bg-pink-500/30 text-white font-semibold text-xs gap-1.5 px-4"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 text-pink-300" /> : <Play className="h-4 w-4 text-pink-300 fill-pink-300" />}
                      <span>{isPlaying ? "Pause Presentation" : "Auto-Play Slides"}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNext}
                      className="border-pink-500/30 bg-black/40 hover:bg-pink-500/20 text-white"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <a
                      href={currentItem.drive_view_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-pink-500/30 bg-black/40 hover:bg-pink-500/20 p-2 text-white transition-colors"
                      title="Open full resolution in Google Drive"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {/* Filmstrip Carousel of All 48 Slides */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-pink-300/80 uppercase tracking-wider">
                      Presentation Filmstrip (Tap to jump)
                    </span>
                    <span className="text-[11px] text-pink-300/60 font-mono">
                      {currentIndex + 1} / {totalItems}
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-pink-500/30">
                    {DRIVE_MEDIA_ITEMS.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`group relative shrink-0 h-16 w-20 md:h-20 md:w-24 overflow-hidden rounded-xl border transition-all ${
                          idx === currentIndex
                            ? "border-pink-400 ring-2 ring-pink-500/50 scale-105"
                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-pink-500/40"
                        }`}
                      >
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            const fallback = getDriveImageFallback(item.thumbnail_url);
                            if (fallback && fallback !== img.src) img.src = fallback;
                          }}
                        />
                        {item.media_type === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <Video className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL 48 MEDIA CARDS GRID */}
        {activeTab === "grid" && (
          <div className="mt-8 space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-pink-500/20 bg-[#12132C]/80 p-3 md:p-4 backdrop-blur-md">
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    filter === "all"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-pink-200/70 hover:text-white"
                  }`}
                >
                  All ({totalItems})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("video")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    filter === "video"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-pink-200/70 hover:text-white"
                  }`}
                >
                  Videos 🎬 ({videoCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter("photo")}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    filter === "photo"
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-pink-200/70 hover:text-white"
                  }`}
                >
                  Photos 📸 ({photoCount})
                </button>
              </div>

              {/* Search input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media by title or name..."
                className="w-full sm:w-64 rounded-full border border-pink-500/30 bg-black/40 px-4 py-1.5 text-xs text-pink-100 placeholder-pink-300/40 focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Grid of 48 Items */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 md:gap-4">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-pink-500/20 bg-[#151632] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-pink-500/60 hover:shadow-[0_8px_30px_rgba(255,117,143,0.25)]"
                >
                  {/* Thumbnail Container */}
                  <div
                    className="relative aspect-square w-full cursor-pointer overflow-hidden bg-black"
                    onClick={() => {
                      setCurrentIndex(item.order_index);
                      setActiveTab("presentation");
                      window.scrollTo({ top: document.getElementById("presentation")?.offsetTop || 0, behavior: "smooth" });
                    }}
                  >
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        const fallback = getDriveImageFallback(item.thumbnail_url);
                        if (fallback && fallback !== img.src) img.src = fallback;
                      }}
                    />

                    {/* Media Type Badge */}
                    <div className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {item.media_type === "video" ? "🎬 Video" : "📸 Photo"}
                    </div>

                    {/* Slide Number */}
                    <div className="absolute right-2.5 top-2.5 rounded-full bg-pink-600/80 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-md">
                      #{item.order_index + 1}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <div className="rounded-full bg-pink-500 p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                        {item.media_type === "video" ? <Play className="h-5 w-5 fill-white" /> : <Eye className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Card Content & Action Links */}
                  <div className="flex flex-1 flex-col justify-between p-3">
                    <div>
                      <h4 className="truncate text-xs md:text-sm font-bold text-white">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 truncate text-[11px] text-pink-200/70">
                        {item.name}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentIndex(item.order_index);
                          setActiveTab("presentation");
                          window.scrollTo({ top: document.getElementById("presentation")?.offsetTop || 0, behavior: "smooth" });
                        }}
                        className="flex-1 rounded-lg bg-pink-500/15 border border-pink-500/30 py-1.5 text-center text-[10px] font-semibold text-pink-200 hover:bg-pink-500/25 transition-colors"
                      >
                        Play In Theater
                      </button>
                      <a
                        href={item.drive_view_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/10 hover:bg-white/20 p-1.5 text-white transition-colors"
                        title="Open in Google Drive"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-pink-500/20 bg-[#151632]/50 p-12 text-center">
                <p className="text-sm text-pink-200/70">No media items match your search. Try another keyword!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOOGLE DRIVE IN-PAGE EXPLORER */}
        {activeTab === "embed" && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-pink-500/10 border border-pink-500/30 p-3.5 text-xs text-pink-200">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-pink-400" />
                <span>
                  Browsing Google Drive folder <strong>Taniya</strong> directly within the browser.
                </span>
              </div>
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline hover:text-white"
              >
                Open in new tab ↗
              </a>
            </div>

            <div className="h-[600px] w-full overflow-hidden rounded-3xl border border-pink-500/30 bg-[#12132C] shadow-2xl">
              <iframe
                src={GOOGLE_DRIVE_EMBED_FOLDER_URL}
                title="Google Drive Folder Explorer"
                className="h-full w-full border-0"
                allow="autoplay"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
