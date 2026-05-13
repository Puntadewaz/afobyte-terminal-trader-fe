"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWatchlist } from "@/services/api/watchlist";

export function useWatchlistQuery() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: fetchWatchlist,
    refetchInterval: 30_000,
  });
}
