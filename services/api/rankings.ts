import { http } from "@/services/api/http";
import type { RankingItem } from "@/types/market";
import { mapRankings } from "@/services/api/mappers";

export const DEFAULT_RECOMMENDATION_LIMIT = 20;

interface RankingApiRow {
  as_of?: string;
  symbol: string;
  market: string;
  ranking_type: "long_term" | "swing" | "intraday";
  score: number;
  state: "new" | "stable" | "weakening" | "removed";
  probability_score: number;
  confidence_score: number;
  liquidity_score: number;
  cycle_confirmations: number;
  quality_score: number;
  risk_score: number;
}

export async function fetchRankings(limit = DEFAULT_RECOMMENDATION_LIMIT): Promise<RankingItem[]> {
  const rows = await http<RankingApiRow[]>(
    `/api/v1/rankings?type=swing&limit=${encodeURIComponent(String(limit))}`,
  );
  return mapRankings(rows);
}
