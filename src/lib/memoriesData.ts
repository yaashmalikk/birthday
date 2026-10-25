import type { Memory } from "./types";
import sampleMemories from "../data/memories.sample.json";

// Safely attempt to load private memories if present locally (git-ignored)
let privateData: Memory[] | undefined;
try {
  const privateModules = import.meta.glob("../data/memories.private.json", {
    eager: true,
    import: "default",
  });
  privateData = privateModules["../data/memories.private.json"] as Memory[] | undefined;
} catch {
  privateData = undefined;
}

// Use private memories when available unless explicitly disabled
const usePrivate = import.meta.env.VITE_USE_PRIVATE_MEMORIES !== "false";
const rawMemories: Memory[] =
  usePrivate && Array.isArray(privateData) && privateData.length > 0
    ? privateData
    : (Array.isArray(sampleMemories) ? (sampleMemories as Memory[]) : []);

// Base path or CDN URL for media (defaults to /media)
const mediaBaseUrl = (import.meta.env.VITE_MEDIA_BASE_URL || "/media").replace(/\/+$/, "");

export const INITIAL_MEMORIES: Memory[] = rawMemories.map((m) => {
  if (m && typeof m.image_url === "string" && m.image_url.startsWith("/media/")) {
    return {
      ...m,
      image_url: m.image_url.replace(/^\/media/, mediaBaseUrl),
    };
  }
  return m;
});
