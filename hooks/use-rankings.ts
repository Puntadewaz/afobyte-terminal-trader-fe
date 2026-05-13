"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRankings } from "@/services/api/rankings";

export type RankingsMarket = "crypto" | "us_stock";
export type RankingsType = "long_term" | "swing" | "intraday";

export function useRankingsQuery(limit = 20, market?: RankingsMarket, type: RankingsType = "swing") {
  return useQuery({
    queryKey: ["rankings", limit, market ?? "all", type],
    queryFn: () => fetchRankings(limit, market, type),
    refetchInterval: 40_000,
  });
}
