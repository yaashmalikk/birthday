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

// Resolve media base path: if VITE_MEDIA_BASE_URL is a full URL (http:// or https://), use it.
// Otherwise, resolve relative to Vite's BASE_URL (e.g., ./media or /birthday/media)
const rawBase = import.meta.env.BASE_URL || "./";
const normalizedBase = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

const customMediaUrl = import.meta.env.VITE_MEDIA_BASE_URL;
let mediaBaseUrl: string;

if (customMediaUrl && /^https?:\/\//i.test(customMediaUrl)) {
  mediaBaseUrl = customMediaUrl.replace(/\/+$/, "");
} else {
  const sub = (customMediaUrl || "media").replace(/^\/+/, "").replace(/\/+$/, "");
  mediaBaseUrl = `${normalizedBase}${sub}`;
}

export const INITIAL_MEMORIES: Memory[] = (rawMemories || []).map((m) => {
  if (m && typeof m.image_url === "string") {
    if (m.image_url.startsWith("/media/") || m.image_url.startsWith("media/")) {
      const cleanPath = m.image_url.replace(/^\/?media\//, "");
      return {
        ...m,
        image_url: `${mediaBaseUrl}/${cleanPath}`,
      };
    }
  }
  return m;
});
