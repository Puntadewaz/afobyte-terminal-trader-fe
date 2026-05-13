"use client";

import { useQuery } from "@tanstack/react-query";
import type { MarketKind } from "@/types/market";
import { fetchAnalysis, fetchCandles } from "@/services/api/analysis";
import { useUiStore } from "@/stores/ui-store";

export type CandleInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export function useAnalysisQuery(market: MarketKind, symbol?: string) {
  const mode = useUiStore((state) => state.analysisMode);

  return useQuery({
    queryKey: ["analysis", market, symbol, mode],
    queryFn: () => fetchAnalysis(market, symbol, mode),
    enabled: Boolean(symbol),
    refetchInterval: 60_000,
  });
}

export function useCandleQuery(market: MarketKind, symbol?: string, interval: CandleInterval = "15m") {
  return useQuery({
    queryKey: ["candles", market, symbol, interval],
    queryFn: () => fetchCandles(symbol, interval),
    enabled: Boolean(symbol),
    refetchInterval: 10_000,
  });
}
