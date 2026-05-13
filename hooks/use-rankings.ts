"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRankings } from "@/services/api/rankings";

export type RankingsMarket = "crypto" | "us_stock";

export function useRankingsQuery(limit = 20, market?: RankingsMarket) {
  return useQuery({
    queryKey: ["rankings", limit, market ?? "all"],
    queryFn: () => fetchRankings(limit, market),
    refetchInterval: 40_000,
  });
}
