import { http } from "@/services/api/http";

export interface WatchlistItem {
  symbol: string;
  market?: string;
  note?: string;
  last_price?: number;
  change_pct?: number;
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const payload = await http<WatchlistItem[] | { items: WatchlistItem[] }>("/api/v1/watchlist", undefined, {
    withUserId: true,
  });

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}
