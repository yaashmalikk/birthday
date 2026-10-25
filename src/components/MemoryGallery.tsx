import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play, Plus, Video } from "lucide-react";
import { toast } from "sonner";
import SectionHeading from "./SectionHeading";
import { apiGet, apiPost } from "@/lib/api";
import type { Memory, MemoryCreate } from "@/lib/types";
import { playSparkle } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MEDIA_LABELS: Record<string, string> = { photo: "Photo 📷", video: "Video 🎬", audio: "Voice Note 🎙️" };

export default function MemoryGallery() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["memories"],
    queryFn: () => apiGet<Memory[]>("/memories"),
  });

  const memories = useMemo(() => data ?? [], [data]);
  const deckItems = useMemo(() => memories.filter((m) => m.media_type !== "audio"), [memories]);

  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [lightbox, setLightbox] = useState<Memory | null>(null);
  const dragX = useRef<number | null>(null);

  const total = deckItems.length;
  useEffect(() => {
    if (total > 0) setIndex((i) => i % total);
  }, [total]);

  useEffect(() => {
    if (!auto || total <= 1) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), 4500);
    return () => window.clearInterval(id);
  }, [auto, total]);

  const go = (delta: number) => {
    if (total === 0) return;
    setIndex((i) => (i + delta + total) % total);
  };

  const [filter, setFilter] = useState<"all" | "video" | "photo">("all");
  const filteredGridItems = useMemo(() => {
    if (filter === "all") return deckItems;
    return deckItems.filter((m) => m.media_type === filter);
  }, [deckItems, filter]);

  const videoCount = useMemo(() => deckItems.filter((m) => m.media_type === "video").length, [deckItems]);
  const photoCount = useMemo(() => deckItems.filter((m) => m.media_type === "photo").length, [deckItems]);

  const lightboxIndex = useMemo(() => {
    if (!lightbox) return -1;
    return deckItems.findIndex((m) => m.id === lightbox.id);
  }, [lightbox, deckItems]);

  const goLightbox = (delta: number) => {
    if (lightboxIndex === -1 || deckItems.length === 0) return;
    const nextIdx = (lightboxIndex + delta + deckItems.length) % deckItems.length;
    setLightbox(deckItems[nextIdx]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === "ArrowLeft") goLightbox(-1);
      if (e.key === "ArrowRight") goLightbox(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightbox, lightboxIndex, deckItems]);

  return (
    <section id="memories" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          badge="Memory Vault"
          title="Every Moment With You 💜"
          subtitle="A 3D deck of our favourite frames — hackathon nights, random dramas, videos, and everything in between. Drag, tap or just watch them spin."
        />

        {isError ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-pink-500/25 bg-[#151632]/60 p-6 text-center backdrop-blur-xl">
            <p className="text-pink-100/80">The memories are a little shy right now 🥺</p>
            <Button variant="outline" className="mt-4" onClick={() => void refetch()} data-testid="memories-retry">
              Try again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="mx-auto mt-12 h-[420px] max-w-xs animate-pulse rounded-3xl border border-purple-500/20 bg-[#151632]/50" />
        ) : total === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-pink-500/25 bg-[#151632]/60 p-6 text-center backdrop-blur-xl">
            <p className="text-pink-100/80">No memories yet — add the very first one! 📸</p>
          </div>
        ) : (
          <>
            {/* 3D deck */}
            <div
              className="relative mx-auto mt-12 h-[380px] max-w-3xl select-none sm:h-[440px]"
              style={{ perspective: "1400px" }}
              data-testid="memory-deck"
              onPointerDown={(e) => {
                dragX.current = e.clientX;
              }}
              onPointerUp={(e) => {
                if (dragX.current === null) return;
                const delta = e.clientX - dragX.current;
                if (Math.abs(delta) > 40) go(delta < 0 ? 1 : -1);
                dragX.current = null;
              }}
            >
              {[-2, -1, 0, 1, 2].map((off) => {
                const item = deckItems[(index + off + total) % total];
                const depth = Math.abs(off);
                return (
                  <motion.div
                    key={`${item.id}-${off}`}
                    onClick={() => (off === 0 ? setLightbox(item) : setIndex((index + off + total) % total))}
                    data-testid={off === 0 ? "memory-card-active" : undefined}
                    className="absolute left-1/2 top-1/2 w-[min(72vw,280px)] cursor-pointer overflow-hidden rounded-3xl border border-pink-500/25 bg-[#151632] shadow-[0_8px_32px_rgba(255,117,143,0.18)]"
                    style={{
                      aspectRatio: "3 / 4",
                      transform: `translate(calc(-50% + ${off * 52}%), -50%) translateZ(${-depth * 110}px) rotateY(${-off * 30}deg) scale(${1 - depth * 0.12})`,
                      zIndex: 20 - depth,
                      opacity: depth === 2 ? 0.35 : 1,
                      filter: `brightness(${1 - depth * 0.22})`,
                      transition: "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s, filter 0.55s",
                    }}
                    initial={false}
                  >
                    {item.media_type === "video" ? (
                      <video src={item.image_url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    ) : (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.35";
                        }}
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0C1E]/95 via-[#0B0C1E]/55 to-transparent p-4 pt-10">
                      <p className="font-heading text-sm font-bold text-white">{item.title}</p>
                      {item.caption ? <p className="mt-0.5 text-xs text-pink-200/80">{item.caption}</p> : null}
                    </div>
                    {item.media_type === "video" ? (
                      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur">
                        <Video className="h-4 w-4" />
                      </span>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>

            {/* controls */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="outline" size="icon" onClick={() => go(-1)} data-testid="gallery-prev" aria-label="Previous memory">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-16 text-center text-sm font-semibold text-pink-200/80" data-testid="gallery-counter">
                {total === 0 ? 0 : index + 1} / {total}
              </span>
              <Button variant="outline" size="icon" onClick={() => go(1)} data-testid="gallery-next" aria-label="Next memory">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAuto((a) => !a)}
                data-testid="gallery-autoplay-toggle"
                aria-label={auto ? "Pause slideshow" : "Play slideshow"}
              >
                {auto ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            {/* all memories grid */}
            <div className="mt-14">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white md:text-2xl">
                    The Full Collection ({deckItems.length}) 🖼️
                  </h3>
                  <p className="text-xs text-pink-200/70 mt-1">
                    Click any memory to view in full resolution or watch video clips
                  </p>
                </div>
                
                {/* Filter tabs */}
                <div className="flex items-center gap-1.5 rounded-full border border-pink-500/20 bg-[#12132C]/80 p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      filter === "all"
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(255,117,143,0.4)]"
                        : "text-pink-100/70 hover:text-white"
                    }`}
                  >
                    All ({deckItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("video")}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      filter === "video"
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(255,117,143,0.4)]"
                        : "text-pink-100/70 hover:text-white"
                    }`}
                  >
                    Videos 🎬 ({videoCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("photo")}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      filter === "photo"
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_0_15px_rgba(255,117,143,0.4)]"
                        : "text-pink-100/70 hover:text-white"
                    }`}
                  >
                    Photos 📸 ({photoCount})
                  </button>
                </div>

                <Button
                  onClick={() => setAddOpen(true)}
                  data-testid="add-memory-button"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 font-bold text-white shadow-[0_0_25px_rgba(255,117,143,0.35)] transition-transform hover:scale-105"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add New Memory
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredGridItems.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setLightbox(m)}
                    data-testid={`memory-grid-item-${m.id}`}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-purple-500/20 bg-[#151632] transition-all hover:-translate-y-1 hover:border-pink-500/50 hover:shadow-[0_0_25px_rgba(255,117,143,0.3)]"
                  >
                    {m.media_type === "video" ? (
                      <video src={m.image_url} muted playsInline preload="metadata" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <img src={m.image_url} alt={m.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0C1E]/90 to-transparent p-2.5 pt-8 text-left">
                      <p className="truncate text-xs font-semibold text-white">{m.title}</p>
                    </div>
                    {m.media_type === "video" ? (
                      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur">
                        <Video className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* add memory dialog */}
      <AddMemoryDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdded={() => {
          void queryClient.invalidateQueries({ queryKey: ["memories"] });
        }}
      />

      {/* lightbox */}
      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl border border-pink-500/25 bg-[#12132C] p-5" data-testid="memory-lightbox">
          {lightbox ? (
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-xl bg-black">
                {lightbox.media_type === "video" ? (
                  <video src={lightbox.image_url} controls autoPlay playsInline className="max-h-[65vh] w-full object-contain" />
                ) : lightbox.media_type === "audio" ? (
                  <audio src={lightbox.image_url} controls className="w-full p-4" />
                ) : (
                  <img src={lightbox.image_url} alt={lightbox.title} className="max-h-[65vh] w-full object-contain" />
                )}

                {/* Lightbox nav arrows */}
                {deckItems.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goLightbox(-1);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-transform hover:scale-110 active:scale-95"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goLightbox(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-transform hover:scale-110 active:scale-95"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-bold text-white">{lightbox.title}</p>
                  {lightbox.caption ? <p className="text-sm text-pink-200/80">{lightbox.caption}</p> : null}
                </div>
                {lightboxIndex !== -1 ? (
                  <span className="shrink-0 text-xs font-semibold text-pink-300/80">
                    {lightboxIndex + 1} / {deckItems.length}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function AddMemoryDialog({
  open,
  onOpenChange,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdded: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("photo");

  const mutation = useMutation({
    mutationFn: (payload: MemoryCreate) => apiPost<Memory>("/memories", payload),
    onSuccess: () => {
      toast.success("Memory added to the vault ✨");
      playSparkle();
      setTitle("");
      setUrl("");
      setCaption("");
      setMediaType("photo");
      onOpenChange(false);
      onAdded();
    },
    onError: () => {
      toast.error("Could not add that memory — check the link and try again 🥺");
    },
  });

  const submit = () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Title and image link are needed 📝");
      return;
    }
    mutation.mutate({
      title: title.trim(),
      image_url: url.trim(),
      caption: caption.trim(),
      media_type: mediaType as MemoryCreate["media_type"],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-pink-500/25 bg-[#12132C]" data-testid="add-memory-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-white">Add a New Memory 💜</DialogTitle>
          <Description />
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memory-title" className="text-pink-100/80">Title</Label>
            <Input
              id="memory-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hackathon Champions"
              data-testid="add-memory-title"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memory-url" className="text-pink-100/80">Image / media link</Label>
            <Input
              id="memory-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              data-testid="add-memory-url"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memory-caption" className="text-pink-100/80">Caption (optional)</Label>
            <Textarea
              id="memory-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="The story behind this one…"
              rows={2}
              data-testid="add-memory-caption"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-pink-100/80">Type</Label>
            <Select value={mediaType} onValueChange={(v: string) => setMediaType(v)}>
              <SelectTrigger data-testid="add-memory-type">
                <SelectValue>{MEDIA_LABELS[mediaType]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEDIA_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={submit}
            disabled={mutation.isPending}
            data-testid="add-memory-submit"
            className="bg-gradient-to-r from-rose-500 to-pink-500 font-bold text-white shadow-[0_0_25px_rgba(255,117,143,0.35)]"
          >
            {mutation.isPending ? "Adding…" : "Add to the Vault ✨"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Split so DialogDescription keeps its import scope obvious
function Description() {
  return (
    <DialogDescription className="text-pink-200/70">
      Drop a photo or video link — it lands straight in the 3D gallery.
    </DialogDescription>
  );
}
