import { http } from "@/services/api/http";
import type { AnalysisSignal, MarketKind } from "@/types/market";
import { mapAnalysis, marketToSymbol, toApiMode } from "@/services/api/mappers";

interface AnalysisApiData {
  as_of?: string;
  symbol: string;
  market: string;
  mode: "long_term" | "swing" | "intraday";
  timeframe?: string;
  bullish_probability: number;
  bearish_probability: number;
  confidence_label?: "low" | "medium" | "high";
  confidence_score: number;
  risk_level: "low" | "medium" | "high" | "extreme";
  manipulation_score: number;
  quality_score?: number;
  holding_duration?: string;
  cut_loss?: number;
  take_profit?: number[];
  entry_zone?: {
    min: number;
    max: number;
  };
  is_gorengan?: boolean;
  gorengan_reasons?: string[];
  recommendation?: string;
  explanation?: Record<string, unknown>;
}

export async function fetchAnalysis(
  market: MarketKind,
  symbol: string | undefined,
  mode: "long-term" | "swing" | "intraday" = "swing",
): Promise<AnalysisSignal> {
  const selectedSymbol = symbol?.trim() || marketToSymbol(market);
  const apiMode = toApiMode(mode);
  const payload = await http<AnalysisApiData>(
    `/api/v1/analysis?symbol=${encodeURIComponent(selectedSymbol)}&mode=${apiMode}`,
  );
  return mapAnalysis(payload);
}

export function fetchCandles(symbol = "BTCUSDT", interval: "1m" | "5m" | "15m" | "1h" | "4h" | "1d" = "15m") {
  const selectedSymbol = symbol.trim() || "BTCUSDT";
  return http<Array<{ time: string; open: number; high: number; low: number; close: number }>>(
    `/api/v1/candles?symbol=${encodeURIComponent(selectedSymbol)}&interval=${encodeURIComponent(interval)}&limit=300`,
  );
}
