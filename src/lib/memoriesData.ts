import type { Memory } from "./types";
import sampleMemories from "../data/memories.sample.json";
import { DRIVE_MEDIA_ITEMS, DriveMediaItem } from "../data/driveMedia";

// Resolve media base path: if VITE_MEDIA_BASE_URL is a full URL, use it.
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

// Build normalization lookup map from Google Drive media items
const normKey = (s: string) => s.toLowerCase().replace(/[\s_()\-]/g, "");
const driveLookup = new Map<string, DriveMediaItem>();

DRIVE_MEDIA_ITEMS.forEach((item) => {
  driveLookup.set(normKey(item.name), item);
  driveLookup.set(item.name.toLowerCase(), item);
});

export function findDriveMedia(filename: string): DriveMediaItem | null {
  const clean = filename.replace(/^\/?media\//, "").trim();
  const n = normKey(clean);
  if (driveLookup.has(n)) return driveLookup.get(n)!;
  if (driveLookup.has(clean.toLowerCase())) return driveLookup.get(clean.toLowerCase())!;

  for (const [key, item] of driveLookup.entries()) {
    if (n.length > 5 && (n.includes(key) || key.includes(n))) {
      return item;
    }
  }
  return null;
}

export function getDriveImageFallback(url: string): string {
  if (url && url.includes("googleusercontent.com/d/")) {
    const id = url.split("googleusercontent.com/d/")[1]?.split(/[\/\?#=]/)[0];
    if (id) {
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
  }
  return url;
}

export function getDrivePreviewUrl(url: string): string {
  if (url && url.includes("googleusercontent.com/d/")) {
    const id = url.split("googleusercontent.com/d/")[1]?.split(/[\/\?#=]/)[0];
    if (id) {
      return `https://drive.google.com/file/d/${id}/preview`;
    }
  }
  return url;
}

// Convert all 48 Drive media items into Memory format
const driveMemories: Memory[] = DRIVE_MEDIA_ITEMS.map((item, idx) => ({
  id: item.id,
  title: item.title,
  image_url: item.thumbnail_url,
  caption: item.caption,
  media_type: item.media_type,
  order_index: idx,
  created_at: item.created_at,
}));

// Default voice notes stored in public/media
const defaultVoiceNotes: Memory[] = [
  {
    id: "voice-1",
    title: "Voice Note 1 🎙️",
    image_url: `${mediaBaseUrl}/its_taniya0111-20260102-0001.ogg`,
    caption: "Her Voice, Note One — Late night rants and iconic laughs! 🎧",
    media_type: "audio",
    order_index: 48,
    created_at: "2026-10-25T00:00:00.000Z",
  },
  {
    id: "voice-2",
    title: "Voice Note 2 🎙️💜",
    image_url: `${mediaBaseUrl}/its_taniya0111-20260102-0002.ogg`,
    caption: "Her Voice, Note Two — The iconic dialogues & celebration vibes! ✨",
    media_type: "audio",
    order_index: 49,
    created_at: "2026-10-25T00:00:00.000Z",
  },
];

// Safely attempt to load private memories if present locally
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

function processMemoryItem(m: Memory, idx: number): Memory {
  if (!m) return m;

  // Audio files use local mediaBaseUrl
  if (m.media_type === "audio" || (typeof m.image_url === "string" && m.image_url.endsWith(".ogg"))) {
    const cleanAudioPath = m.image_url.replace(/^\/?media\//, "");
    return {
      ...m,
      image_url: `${mediaBaseUrl}/${cleanAudioPath}`,
    };
  }

  // If image_url points to a local media file path (/media/...), resolve to Drive cloud URL
  if (typeof m.image_url === "string" && (m.image_url.startsWith("/media/") || m.image_url.startsWith("media/"))) {
    const driveItem = findDriveMedia(m.image_url);
    if (driveItem) {
      return {
        ...m,
        image_url: driveItem.thumbnail_url,
        media_type: driveItem.media_type,
      };
    }
    // Fallback to Drive item by index if name wasn't found
    const fallbackItem = DRIVE_MEDIA_ITEMS[idx % DRIVE_MEDIA_ITEMS.length];
    if (fallbackItem) {
      return {
        ...m,
        image_url: fallbackItem.thumbnail_url,
        media_type: fallbackItem.media_type,
      };
    }
  }

  return m;
}

// Assemble full raw list
const usePrivate = import.meta.env.VITE_USE_PRIVATE_MEMORIES !== "false";
let baseList: Memory[];

if (usePrivate && Array.isArray(privateData) && privateData.length > 0) {
  baseList = privateData.map((m, idx) => processMemoryItem(m, idx));
} else if (driveMemories.length > 0) {
  baseList = [...driveMemories, ...defaultVoiceNotes];
} else if (Array.isArray(sampleMemories) && sampleMemories.length > 0) {
  baseList = [...(sampleMemories as Memory[]), ...defaultVoiceNotes];
} else {
  baseList = [];
}

export const INITIAL_MEMORIES: Memory[] = baseList;
