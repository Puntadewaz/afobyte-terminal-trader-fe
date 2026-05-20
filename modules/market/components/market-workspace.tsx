"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LightweightChart, type LightweightChartHandle } from "@/components/charts/lightweight-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { AdvancedChartWidget } from "@/components/widgets/tradingview/advanced-chart-widget";
import { FundamentalDataWidget } from "@/components/widgets/tradingview/fundamental-data-widget";
import { TechnicalAnalysisWidget } from "@/components/widgets/tradingview/technical-analysis-widget";
import { useAnalysisQuery, useCandleQuery, type CandleInterval } from "@/hooks/use-analysis";
import { useRankingsQuery } from "@/hooks/use-rankings";
import { marketToSymbol } from "@/services/api/mappers";
import { analyzeSnapshot, type SnapshotAnalysisResult } from "@/services/api/snapshot-analysis";
import { useUiStore } from "@/stores/ui-store";
import type { MarketKind } from "@/types/market";
import { AnalysisPanel } from "./analysis-panel";

const labelMap: Record<MarketKind, string> = {
  crypto: "Crypto",
  idx: "IDX",
  us: "US Stocks",
};

const CHART_INTERVALS: CandleInterval[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
const DEFAULT_USD_TO_IDR_RATE = 16_000;
type PriceCurrency = "USD" | "IDR";

function toTradingViewInterval(interval: CandleInterval): string {
  if (interval === "1m") return "1";
  if (interval === "5m") return "5";
  if (interval === "15m") return "15";
  if (interval === "1h") return "60";
  if (interval === "4h") return "240";
  return "D";
}

function toTechnicalAnalysisInterval(interval: CandleInterval): string {
  if (interval === "1m") return "1m";
  if (interval === "5m") return "5m";
  if (interval === "15m") return "15m";
  if (interval === "1h") return "1h";
  if (interval === "4h") return "4h";
  return "1D";
}

function toTradingViewSymbol(market: MarketKind, symbol: string): string {
  const normalized = symbol.trim().toUpperCase();
  if (!normalized) return "BINANCE:BTCUSDT";
  if (market === "crypto") {
    if (normalized.includes(":")) return normalized;
    if (normalized.endsWith("USDT")) return `BINANCE:${normalized}`;
    return `BINANCE:${normalized}USDT`;
  }

  if (market === "idx") {
    if (normalized.includes(":")) return normalized;
    return `IDX:${normalized}`;
  }

  if (normalized.includes(":")) return normalized;
  return normalized;
}

function recommendationVariant(recommendation?: string) {
  if (!recommendation) return "neutral" as const;
  if (recommendation.includes("long")) return "bullish" as const;
  if (recommendation.includes("short")) return "bearish" as const;
  return "info" as const;
}

function confidenceVariant(label?: string) {
  if (!label) return "neutral" as const;
  if (label.toLowerCase() === "high") return "bullish" as const;
  if (label.toLowerCase() === "medium") return "info" as const;
  return "warning" as const;
}

export function MarketWorkspace({ market }: { market: MarketKind }) {
  const snapshotChartRef = useRef<LightweightChartHandle | null>(null);
  const mode = useUiStore((state) => state.analysisMode);
  const setMode = useUiStore((state) => state.setAnalysisMode);
  const defaultSymbol = useMemo(() => marketToSymbol(market), [market]);
  const rankingMarket = market === "us" ? "us_stock" : market === "crypto" ? "crypto" : undefined;
  const { data: rankings } = useRankingsQuery(20, rankingMarket);

  const recommendedSymbols = useMemo(() => {
    const rows = (rankings ?? [])
      .filter((item) => item.market === market)
      .map((item) => item.symbol)
      .filter((symbol, index, all) => all.indexOf(symbol) === index)
      .slice(0, 20);

    if (market !== "crypto" && !rows.includes(defaultSymbol)) {
      rows.unshift(defaultSymbol);
    }

    return rows;
  }, [defaultSymbol, market, rankings]);

  const [selectedSymbol, setSelectedSymbol] = useState(() => (market === "crypto" ? "" : defaultSymbol));
  const [chartInterval, setChartInterval] = useState<CandleInterval>("15m");
  const [currency, setCurrency] = useState<PriceCurrency>("USD");
  const [isChartVisible, setIsChartVisible] = useState(true);
  const [snapshotAnalysis, setSnapshotAnalysis] = useState<SnapshotAnalysisResult | null>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);

  useEffect(() => {
    if (mode !== "swing") {
      setMode("swing");
    }
  }, [mode, setMode]);

  const isWaitingForRankingSymbol = market === "crypto" && recommendedSymbols.length === 0;
  const activeSymbol = recommendedSymbols.includes(selectedSymbol)
    ? selectedSymbol
    : isWaitingForRankingSymbol
      ? ""
      : (recommendedSymbols[0] ?? defaultSymbol);

  function handleSymbolChange(nextSymbol: string) {
    setSelectedSymbol(nextSymbol);
    setSnapshotAnalysis(null);
    setSnapshotError(null);
    setIsSnapshotLoading(false);
  }

  const querySymbol = activeSymbol || undefined;
  const {
    data: candles,
    isLoading: isCandlesLoading,
    isError: isCandlesError,
    error: candlesError,
  } = useCandleQuery(market, querySymbol, chartInterval);
  const { data: analysis, isLoading: isAnalysisLoading } = useAnalysisQuery(market, querySymbol);
  const usdToIdrRate = Number(process.env.NEXT_PUBLIC_USD_TO_IDR_RATE ?? DEFAULT_USD_TO_IDR_RATE);
  const baseTradingViewSymbol = useMemo(() => toTradingViewSymbol(market, activeSymbol), [activeSymbol, market]);
  const { data: resolvedUsSymbol, isLoading: isResolvingUsSymbol } = useQuery({
    queryKey: ["tradingview-symbol-resolver", activeSymbol],
    enabled: market === "us" && Boolean(activeSymbol),
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const response = await fetch(`/api/v1/tradingview/resolve-symbol?symbol=${encodeURIComponent(activeSymbol)}`, {
        cache: "no-store",
      });
      const json = (await response.json()) as {
        success?: boolean;
        data?: { symbol?: string };
      };

      if (!response.ok || !json.success) return null;
      return json.data?.symbol ?? null;
    },
  });
  const tradingViewSymbol = market === "us" ? (resolvedUsSymbol ?? `NASDAQ:${baseTradingViewSymbol}`) : baseTradingViewSymbol;
  const tradingViewInterval = useMemo(() => toTradingViewInterval(chartInterval), [chartInterval]);
  const technicalInterval = useMemo(() => toTechnicalAnalysisInterval(chartInterval), [chartInterval]);
  const snapshotIndicators = useMemo(
    () => ({
      ema20: true,
      ema50: true,
      ema200: true,
      rsi14: true,
      macd: true,
    }),
    [],
  );

  const chartCandles = useMemo(() => {
    if (!candles) return candles;
    if (currency === "USD") return candles;

    return candles.map((item) => ({
      ...item,
      open: Number((item.open * usdToIdrRate).toFixed(5)),
      high: Number((item.high * usdToIdrRate).toFixed(5)),
      low: Number((item.low * usdToIdrRate).toFixed(5)),
      close: Number((item.close * usdToIdrRate).toFixed(5)),
    }));
  }, [candles, currency, usdToIdrRate]);

  const structureConfidence: "low" | "medium" | "high" =
    (analysis?.probability.confidence ?? 0) >= 70
      ? "high"
      : (analysis?.probability.confidence ?? 0) >= 50
        ? "medium"
        : "low";

  const chartFeatures = {
    vol_spike: (analysis?.manipulationRisk ?? "low") === "high" || (analysis?.manipulationRisk ?? "low") === "extreme",
    vol_z: Number((((analysis?.volatilityScore ?? 0) / 100) * 3).toFixed(5)),
    structure_confidence: structureConfidence,
    symbol: activeSymbol,
    interval: chartInterval,
    market,
  };

  async function handleAnalyzeSnapshot() {
    setSnapshotError(null);

    if (isCandlesLoading) {
      setSnapshotError("Chart data masih loading. Coba lagi sebentar.");
      return;
    }

    if (isCandlesError) {
      setSnapshotError(`Gagal mengambil data candle: ${candlesError instanceof Error ? candlesError.message : "Unknown error"}`);
      return;
    }

    if (!chartCandles || chartCandles.length === 0) {
      setSnapshotError("Data candle tidak tersedia untuk snapshot.");
      return;
    }

    const imageBase64 = snapshotChartRef.current?.takeSnapshot();
    if (!imageBase64) {
      setSnapshotError("Snapshot belum siap. Tunggu chart selesai render lalu coba lagi.");
      return;
    }

    setIsSnapshotLoading(true);
    try {
      const result = await analyzeSnapshot({
        imageBase64,
        timeframe: mode,
        chartFeatures,
        symbol: activeSymbol,
        interval: chartInterval,
      });
      setSnapshotAnalysis(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analyze snapshot request failed";
      setSnapshotError(message);
    } finally {
      setIsSnapshotLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">{labelMap[market]} Analysis Workspace</h2>
          <p className="text-sm text-zinc-400">
            Probability-based analysis designed to support better decision quality.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={activeSymbol}
            onChange={(event) => handleSymbolChange(event.target.value)}
            disabled={isWaitingForRankingSymbol}
          >
            {isWaitingForRankingSymbol ? (
              <option value="">Waiting rankings...</option>
            ) : null}
            {recommendedSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </Select>

          <Select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as "swing")
            }
          >
            <option value="swing">Swing</option>
          </Select>

          <Select
            value={chartInterval}
            onChange={(event) => setChartInterval(event.target.value as CandleInterval)}
          >
            {CHART_INTERVALS.map((interval) => (
              <option key={interval} value={interval}>
                {interval}
              </option>
            ))}
          </Select>

          <div className="flex items-center overflow-hidden rounded-md border border-zinc-700">
            <Button
              type="button"
              size="sm"
              variant={currency === "USD" ? "secondary" : "outline"}
              className="rounded-none border-0"
              onClick={() => setCurrency("USD")}
            >
              USD
            </Button>
            <Button
              type="button"
              size="sm"
              variant={currency === "IDR" ? "secondary" : "outline"}
              className="rounded-none border-0"
              onClick={() => setCurrency("IDR")}
            >
              IDR
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <CardTitle>TradingView Advanced Chart - {chartInterval} ({currency})</CardTitle>
            <div className="flex items-center gap-2">
              {market === "us" ? (
                <Badge variant="info">{isResolvingUsSymbol ? "Resolving exchange..." : tradingViewSymbol}</Badge>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChartVisible((prev) => !prev)}
              >
                {isChartVisible ? "Hide Chart" : "Show Chart"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAnalyzeSnapshot}
                disabled={
                  isSnapshotLoading ||
                  isWaitingForRankingSymbol ||
                  isCandlesLoading ||
                  !chartCandles ||
                  chartCandles.length === 0
                }
              >
                {isSnapshotLoading ? "Analyzing..." : "Analyze Snapshot"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!isChartVisible ? (
            <p className="text-sm text-zinc-400">Chart is hidden.</p>
          ) : (
            <>
              {isWaitingForRankingSymbol ? (
                <p className="text-sm text-zinc-400">Waiting symbol from rankings...</p>
              ) : (
                <AdvancedChartWidget
                  symbol={tradingViewSymbol}
                  interval={tradingViewInterval}
                  minHeight={440}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {market === "crypto" || market === "us" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis (TradingView)</CardTitle>
            </CardHeader>
            <CardContent>
              <TechnicalAnalysisWidget symbol={tradingViewSymbol} interval={technicalInterval} minHeight={380} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fundamental Data (TradingView)</CardTitle>
            </CardHeader>
            <CardContent>
              <FundamentalDataWidget symbol={tradingViewSymbol} minHeight={380} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card className="border-cyan-800/70">
        <CardHeader>
          <div className="flex w-full items-center justify-between gap-2">
            <CardTitle>Snapshot Analysis Result</CardTitle>
            {snapshotAnalysis?.recommendation ? (
              <Badge variant={recommendationVariant(snapshotAnalysis.recommendation)}>
                {snapshotAnalysis.recommendation}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-300">
          {snapshotError ? <p className="text-red-400">{snapshotError}</p> : null}

          {!snapshotError && !snapshotAnalysis ? (
            <p>Capture chart snapshot untuk mendapatkan analisa khusus dari gambar.</p>
          ) : null}

          {snapshotAnalysis ? (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <p className="text-xs text-zinc-500">Confidence</p>
                <p className="text-lg font-semibold text-zinc-100">
                  {typeof snapshotAnalysis.confidence === "number"
                    ? `${snapshotAnalysis.confidence.toFixed(5)}%`
                    : "n/a"}
                </p>
                {snapshotAnalysis.confidenceLabel ? (
                  <Badge variant={confidenceVariant(snapshotAnalysis.confidenceLabel)} className="mt-2">
                    {snapshotAnalysis.confidenceLabel}
                  </Badge>
                ) : null}
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <p className="text-xs text-zinc-500">Timeframe</p>
                <p className="text-lg font-semibold text-zinc-100">
                  {snapshotAnalysis.timeframe ?? "n/a"}
                </p>
              </div>

              <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                <p className="text-xs text-zinc-500">Gorengan Signal</p>
                <p className="text-lg font-semibold text-zinc-100">
                  {typeof snapshotAnalysis.isGorengan === "boolean"
                    ? snapshotAnalysis.isGorengan
                      ? "Yes"
                      : "No"
                    : "n/a"}
                </p>
              </div>
            </div>
          ) : null}

          {typeof snapshotAnalysis?.bullishProbability === "number" &&
          typeof snapshotAnalysis?.bearishProbability === "number" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-zinc-800 p-3">
                <p className="mb-1 text-xs text-zinc-500">Bullish Probability</p>
                <p className="text-sm text-zinc-100">{snapshotAnalysis.bullishProbability.toFixed(5)}%</p>
                <Progress className="mt-2" value={snapshotAnalysis.bullishProbability} />
              </div>
              <div className="rounded-md border border-zinc-800 p-3">
                <p className="mb-1 text-xs text-zinc-500">Bearish Probability</p>
                <p className="text-sm text-zinc-100">{snapshotAnalysis.bearishProbability.toFixed(5)}%</p>
                <Progress className="mt-2" value={snapshotAnalysis.bearishProbability} />
              </div>
            </div>
          ) : null}

          {snapshotAnalysis?.summary ? (
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Snapshot Summary</p>
              <p className="mt-1 text-zinc-200">{snapshotAnalysis.summary}</p>
            </div>
          ) : null}

          {snapshotAnalysis?.tradePlan ? (
            <div className="rounded-md border border-cyan-900/70 bg-cyan-950/10 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Trade Plan</p>
              <p className="mt-1 text-zinc-100">{snapshotAnalysis.tradePlan}</p>
            </div>
          ) : null}

          {Array.isArray(snapshotAnalysis?.gorenganReasons) && snapshotAnalysis.gorenganReasons.length > 0 ? (
            <div className="space-y-1 rounded-md border border-zinc-800 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Gorengan Reasons</p>
              {snapshotAnalysis.gorenganReasons.map((reason) => <p key={reason}>- {reason}</p>)}
            </div>
          ) : null}

          {Array.isArray(snapshotAnalysis?.reasons) && snapshotAnalysis.reasons.length > 0 ? (
            <div className="space-y-1 rounded-md border border-zinc-800 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Confluence Reasons</p>
              {snapshotAnalysis.reasons.map((reason) => <p key={reason}>- {reason}</p>)}
            </div>
          ) : null}

          {snapshotAnalysis?.chartFeaturesExtracted ? (
            <pre className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300">
              {JSON.stringify(snapshotAnalysis.chartFeaturesExtracted, null, 2)}
            </pre>
          ) : null}

          {snapshotAnalysis && !snapshotAnalysis.recommendation && !snapshotAnalysis.summary && !snapshotAnalysis.tradePlan ? (
            <pre className="overflow-x-auto rounded-md border border-zinc-800 bg-zinc-950/60 p-3 text-xs text-zinc-300">
              {JSON.stringify(snapshotAnalysis.raw ?? snapshotAnalysis, null, 2)}
            </pre>
          ) : null}
        </CardContent>
      </Card>

      <AnalysisPanel market={market} symbol={activeSymbol} currency={currency} usdToIdrRate={usdToIdrRate} />

      {market === "crypto" ? (
        <Card className="border-amber-700/50">
          <CardHeader>
            <CardTitle>Gorengan Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-zinc-300">
            {isAnalysisLoading ? (
              <p>Loading reason from API...</p>
            ) : (
              <>
                <p>
                  Signal: {typeof analysis?.isGorengan === "boolean" ? (analysis.isGorengan ? "Yes" : "No") : "n/a"}
                </p>
                {(analysis?.gorenganReasons?.length ?? 0) > 0 ? (
                  analysis?.gorenganReasons?.slice(0, 4).map((line) => <p key={line}>- {line}</p>)
                ) : (
                  <p>No dominant gorengan signal from API.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {chartCandles && chartCandles.length > 0 ? (
        <div className="pointer-events-none fixed -left-[200vw] top-0 w-[1200px] opacity-0" aria-hidden>
          <LightweightChart ref={snapshotChartRef} data={chartCandles} indicators={snapshotIndicators} />
        </div>
      ) : null}
    </div>
  );
}
