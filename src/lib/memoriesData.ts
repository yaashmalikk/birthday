import type { Memory } from "./types";
import sampleMemories from "../data/memories.sample.json";

// Attempt to load private memories if present locally (git-ignored)
const privateModules = import.meta.glob("../data/memories.private.json", {
  eager: true,
  import: "default",
});

const privateData = privateModules["../data/memories.private.json"] as Memory[] | undefined;

// Use private memories when available unless explicitly disabled
const usePrivate = import.meta.env.VITE_USE_PRIVATE_MEMORIES !== "false";
const rawMemories: Memory[] = usePrivate && privateData && privateData.length > 0 ? privateData : (sampleMemories as Memory[]);

// Base path or CDN URL for media (defaults to /media)
const mediaBaseUrl = (import.meta.env.VITE_MEDIA_BASE_URL || "/media").replace(/\/+$/, "");

export const INITIAL_MEMORIES: Memory[] = rawMemories.map((m) => {
  if (m.image_url.startsWith("/media/")) {
    return {
      ...m,
      image_url: m.image_url.replace(/^\/media/, mediaBaseUrl),
    };
  }
  return m;
});
