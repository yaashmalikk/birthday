import type { ClaimStatus, GiftClaim, Counter, IncrementResponse, Memory, MemoryCreate } from "./types";
import { INITIAL_MEMORIES } from "./memoriesData";

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore storage errors */
  }
}

// Local mock API client that fulfills all requests with persistence
export async function apiGet<T>(endpoint: string): Promise<T> {
  await new Promise((r) => setTimeout(r, 80)); // realistic micro-delay

  if (endpoint.startsWith("/counter")) {
    const hugs = getStored<number>("birthday_hugs_count", 101);
    return { key: "virtual_hugs", count: hugs } as unknown as T;
  }

  if (endpoint.startsWith("/claim-status")) {
    const claim = getStored<ClaimStatus>("birthday_claim_status", {
      claimed: false,
      claimed_at: null,
      claimed_by: null,
      response_note: null,
    });
    return claim as unknown as T;
  }

  if (endpoint.startsWith("/memories")) {
    // Clear legacy keys if present
    try {
      localStorage.removeItem("birthday_memories_v3");
      localStorage.removeItem("birthday_memories_v2");
    } catch {
      /* ignore */
    }

    const stored = getStored<Memory[]>("birthday_memories_v5", []);
    const hasBrokenMedia =
      !Array.isArray(stored) ||
      stored.length === 0 ||
      stored.some(
        (m) =>
          m.media_type !== "audio" &&
          typeof m.image_url === "string" &&
          (m.image_url.startsWith("/media/") ||
            m.image_url.startsWith("media/") ||
            m.image_url.includes("./media/"))
      );

    if (hasBrokenMedia) {
      setStored("birthday_memories_v5", INITIAL_MEMORIES);
      return INITIAL_MEMORIES as unknown as T;
    }
    return stored as unknown as T;
  }

  return {} as T;
}

export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  await new Promise((r) => setTimeout(r, 80));

  if (endpoint.startsWith("/counter/increment")) {
    const hugs = getStored<number>("birthday_hugs_count", 101) + 1;
    setStored("birthday_hugs_count", hugs);
    return { key: "virtual_hugs", count: hugs } as unknown as T;
  }

  if (endpoint.startsWith("/claim-gift")) {
    const claimData: ClaimStatus = {
      claimed: true,
      claimed_at: new Date().toISOString(),
      claimed_by: body?.claimed_by || "Taniyaaa",
      response_note: body?.response_note || "Party confirmed! 🎉",
    };
    setStored("birthday_claim_status", claimData);
    return claimData as unknown as T;
  }

  if (endpoint.startsWith("/memories")) {
    const payload = body as MemoryCreate;
    const memories = getStored<Memory[]>("birthday_memories_v5", INITIAL_MEMORIES);
    const newMem: Memory = {
      id: "mem-" + Date.now(),
      title: payload.title || "Special Moment",
      image_url: payload.image_url || INITIAL_MEMORIES[0]?.image_url || "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
      caption: payload.caption || "",
      media_type: payload.media_type || "photo",
      order_index: memories.length,
      created_at: new Date().toISOString(),
    };
    const updated = [...memories, newMem];
    setStored("birthday_memories_v5", updated);
    return newMem as unknown as T;
  }

  return {} as T;
}
