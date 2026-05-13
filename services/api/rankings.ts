import { http } from "@/services/api/http";
import type { RankingItem } from "@/types/market";
import { mapRankings } from "@/services/api/mappers";
import type { RankingsMarket, RankingsType } from "@/hooks/use-rankings";

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

export async function fetchRankings(
  limit = DEFAULT_RECOMMENDATION_LIMIT,
  market?: RankingsMarket,
  type: RankingsType = "swing",
): Promise<RankingItem[]> {
  const marketQuery = market ? `&market=${encodeURIComponent(market)}` : "";
  const rows = await http<RankingApiRow[]>(
    `/api/v1/rankings?type=${encodeURIComponent(type)}&limit=${encodeURIComponent(String(limit))}${marketQuery}`,
  );
  return mapRankings(rows);
}
