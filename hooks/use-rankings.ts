"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRankings } from "@/services/api/rankings";

export function useRankingsQuery(limit = 20) {
  return useQuery({
    queryKey: ["rankings", limit],
    queryFn: () => fetchRankings(limit),
    refetchInterval: 40_000,
  });
}
