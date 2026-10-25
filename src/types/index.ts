
export interface GiftClaim {
  id: string;
  claimed_by: string;
  claimed_at: string;
  response_note: string;
  status: string;
}

export interface ClaimStatus {
  claimed: boolean;
  claimed_at: string | null;
  claimed_by: string | null;
  response_note: string | null;
}

export interface Memory {
  id: string;
  title: string;
  image_url: string;
  caption: string;
  media_type: "photo" | "video" | "audio";
  order_index: number;
  created_at: string;
}

export interface MemoryCreate {
  title: string;
  image_url: string;
  caption?: string;
  media_type?: "photo" | "video" | "audio";
  order_index?: number;
}

export interface Counter {
  key: string;
  count: number;
}

export interface IncrementResponse {
  key: string;
  count: number;
}
