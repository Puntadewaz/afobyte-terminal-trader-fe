"use client";

import { useAnalysisQuery } from "@/hooks/use-analysis";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MarketKind } from "@/types/market";

type PriceCurrency = "USD" | "IDR";

function riskVariant(risk: string) {
  if (risk === "low") return "bullish" as const;
  if (risk === "medium") return "info" as const;
  if (risk === "high") return "warning" as const;
  return "bearish" as const;
}

export function AnalysisPanel({
  market,
  symbol,
  currency = "USD",
  usdToIdrRate = 16_000,
}: {
  market: MarketKind;
  symbol?: string;
  currency?: PriceCurrency;
  usdToIdrRate?: number;
}) {
  const { data, isLoading } = useAnalysisQuery(market, symbol);

  if (isLoading || !data) {
    return <p className="text-sm text-zinc-400">Loading probability engine...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.asset} Analysis Panel</CardTitle>
        <Badge variant={riskVariant(data.risk)}>{data.risk} risk</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Bullish Probability" value={data.probability.bullish} />
          <Metric label="Bearish Probability" value={data.probability.bearish} />
          <Metric label="Confidence" value={data.probability.confidence} />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Trend" value={data.trend} />
          <Info label="Timeframe" value={data.timeframe ?? "n/a"} />
          <Info label="Recommendation" value={data.recommendation ?? "n/a"} />
          <Info label="Volatility" value={`${data.volatilityScore}/100`} />
          <Info label="Manipulation Risk" value={data.manipulationRisk} />
          <Info label="Suggested Style" value={data.suggestedStyle} />
          <Info label="Holding Duration" value={data.holdingDuration} />
          <Info label={`Entry Zone (${currency})`} value={formatEntryZone(data.entryZone, currency, usdToIdrRate)} />
          <Info label={`Take Profit (${currency})`} value={formatTakeProfits(data.takeProfits, currency, usdToIdrRate)} />
          <Info label={`Cut Loss (${currency})`} value={formatPrice(data.cutLoss, currency, usdToIdrRate)} />
          <Info label="Quality Score" value={data.qualityScore !== undefined ? formatMetric(data.qualityScore) : "n/a"} />
          <Info label="Agreement Score" value={data.agreementScore !== undefined ? formatMetric(data.agreementScore) : "n/a"} />
          <Info
            label="Uncertainty Score"
            value={data.uncertaintyScore !== undefined ? formatMetric(data.uncertaintyScore) : "n/a"}
          />
        </div>

        {data.tradeScenario || data.tradeNote ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Trading Plan</p>
            {data.tradeScenario ? <p className="mt-1 text-sm text-zinc-200">Scenario: {data.tradeScenario}</p> : null}
            {data.tradeNote ? <p className="mt-1 text-sm text-zinc-300">{data.tradeNote}</p> : null}
          </div>
        ) : null}

        {data.riskWarnings && data.riskWarnings.length > 0 ? (
          <div className="rounded-md border border-amber-900/60 bg-amber-950/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-amber-300">Risk Warnings</p>
            {data.riskWarnings.map((warning) => (
              <p key={warning} className="mt-1 text-sm text-amber-100">
                - {warning}
              </p>
            ))}
          </div>
        ) : null}

        {data.topPositiveReasons && data.topPositiveReasons.length > 0 ? (
          <div className="rounded-md border border-emerald-900/50 bg-emerald-950/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-emerald-300">Top Positive Factors</p>
            {data.topPositiveReasons.map((reason) => (
              <p key={reason} className="mt-1 text-sm text-emerald-100">
                - {reason}
              </p>
            ))}
          </div>
        ) : null}

        {data.topNegativeReasons && data.topNegativeReasons.length > 0 ? (
          <div className="rounded-md border border-rose-900/60 bg-rose-950/20 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-rose-300">Top Negative Factors</p>
            {data.topNegativeReasons.map((reason) => (
              <p key={reason} className="mt-1 text-sm text-rose-100">
                - {reason}
              </p>
            ))}
          </div>
        ) : null}

        {data.headline ? (
          <div className="rounded-md border border-cyan-900/70 bg-cyan-950/10 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Headline</p>
            <p className="mt-1 text-sm text-zinc-100">{data.headline}</p>
          </div>
        ) : null}

        {data.commentary ? (
          <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Commentary</p>
            <p className="mt-1 text-sm text-zinc-300">{data.commentary}</p>
          </div>
        ) : null}

        <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Explanation Engine</p>
          {data.explanation.map((line) => (
            <p key={line} className="text-sm text-zinc-300">
              - {line}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatMetric(value: number): string {
  return value.toFixed(2);
}

function formatPrice(value: number, currency: PriceCurrency, usdToIdrRate: number): string {
  if (!Number.isFinite(value) || value <= 0) return "n/a";
  const multiplier = currency === "IDR" ? usdToIdrRate : 1;
  const converted = value * multiplier;
  const locale = currency === "IDR" ? "id-ID" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(converted);
}

function formatEntryZone([min, max]: [number, number], currency: PriceCurrency, usdToIdrRate: number): string {
  if (min <= 0 && max <= 0) return "n/a";
  return `${formatPrice(min, currency, usdToIdrRate)} - ${formatPrice(max, currency, usdToIdrRate)}`;
}

function formatTakeProfits(values: number[], currency: PriceCurrency, usdToIdrRate: number): string {
  if (values.length === 0) return "n/a";
  return values.map((value) => formatPrice(value, currency, usdToIdrRate)).join(" / ");
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-100">{value}%</p>
      <Progress className="mt-2" value={value} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 p-2">
      <p className="text-[11px] uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  );
}
