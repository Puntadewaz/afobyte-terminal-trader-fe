import type {
  AnalysisSignal,
  DashboardSnapshot,
  MarketKind,
  PortfolioHolding,
  RankingItem,
  RiskLevel,
} from "@/types/market";

export type ApiMode = "long_term" | "swing" | "intraday";

export function toApiMode(mode: "long-term" | "swing" | "intraday"): ApiMode {
  if (mode === "long-term") return "long_term";
  return mode;
}

export function marketToSymbol(market: MarketKind): string {
  if (market === "crypto") return "BTCUSDT";
  if (market === "idx") return "BBCA";
  return "AAPL";
}

export function mapRiskFromScore(score: number): RiskLevel {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "extreme";
}

export function mapMarket(raw: string): MarketKind {
  if (raw === "idx") return "idx";
  if (raw === "us" || raw === "us-stocks" || raw === "us_stocks" || raw === "us_stock") return "us";
  return "crypto";
}

interface AnalysisApiData {
  as_of?: string;
  symbol: string;
  market: string;
  mode: ApiMode;
  timeframe?: string;
  bullish_probability: number;
  bearish_probability: number;
  confidence_label?: "low" | "medium" | "high";
  confidence_score: number;
  risk_level: RiskLevel;
  manipulation_score: number;
  is_gorengan?: boolean;
  gorengan_reasons?: string[];
  recommendation?: string;
  quality_score?: number;
  holding_duration?: string;
  cut_loss?: number;
  take_profit?: number[];
  entry_zone?: {
    min: number;
    max: number;
  };
  explanation?: {
    headline?: string;
    commentary?: string;
    education?: string;
    human_reasons?: string[];
    chart_analysis?: string[];
    gorengan_reasons?: string[];
    is_gorengan?: boolean;
    provider_source?: string;
    using_manual_fallback?: boolean;
    probability?: {
      agreement_score?: number;
      uncertainty_score?: number;
      top_positive?: Array<{ reason?: string }>;
      top_negative?: Array<{ reason?: string }>;
    };
    risk?: {
      warnings?: string[];
      atr_stop?: number;
    };
    trading_plan?: {
      scenario?: string;
      note?: string;
      holding_duration?: string;
      cut_loss?: number;
      take_profit?: number[];
      entry_zone?: {
        min: number;
        max: number;
      };
    };
    [key: string]: unknown;
  };
}

function collectText(value: unknown, out: string[]) {
  if (typeof value === "string") {
    const line = value.trim();
    if (line) out.push(line);
    return;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    out.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, out));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectText(item, out));
  }
}

function mapExplanationLines(data: AnalysisApiData): string[] {
  const prioritized = [
    ...(data.explanation?.human_reasons ?? []),
    ...(data.explanation?.chart_analysis ?? []),
    ...(data.explanation?.commentary ? [data.explanation.commentary] : []),
    ...(data.explanation?.education ? [data.explanation.education] : []),
  ].map((line) => line.trim()).filter(Boolean);

  if (prioritized.length > 0) {
    return prioritized.slice(0, 8);
  }

  const lines: string[] = [];
  collectText(data.explanation, lines);

  const unique = lines.filter((line, index, all) => all.indexOf(line) === index).slice(0, 8);
  if (unique.length > 0) {
    return unique;
  }

  return [
    `Recommendation: ${data.recommendation ?? "watch"}.`,
    `Bullish probability ${data.bullish_probability.toFixed(1)}% vs bearish ${data.bearish_probability.toFixed(1)}%.`,
  ];
}

function mapGorenganReasons(data: AnalysisApiData): string[] {
  const reasons = [
    ...(data.gorengan_reasons ?? []),
    ...(data.explanation?.gorengan_reasons ?? []),
  ]
    .map((line) => line.trim())
    .filter(Boolean);

  return reasons.filter((line, index, all) => all.indexOf(line) === index);
}

export function mapAnalysis(data: AnalysisApiData): AnalysisSignal {
  const gorenganReasons = mapGorenganReasons(data);
  const plan = data.explanation?.trading_plan;
  const entryMin = data.entry_zone?.min ?? plan?.entry_zone?.min ?? 0;
  const entryMax = data.entry_zone?.max ?? plan?.entry_zone?.max ?? 0;
  const takeProfits = data.take_profit ?? plan?.take_profit ?? [];
  const cutLoss = data.cut_loss ?? plan?.cut_loss ?? data.explanation?.risk?.atr_stop ?? 0;
  const topPositiveReasons = (data.explanation?.probability?.top_positive ?? [])
    .map((item) => (item.reason ?? "").trim())
    .filter(Boolean);
  const topNegativeReasons = (data.explanation?.probability?.top_negative ?? [])
    .map((item) => (item.reason ?? "").trim())
    .filter(Boolean);

  return {
    asset: data.symbol,
    asOf: data.as_of,
    market: mapMarket(data.market),
    trend: data.bullish_probability >= 60 ? "bullish" : data.bearish_probability >= 60 ? "bearish" : "sideways",
    probability: {
      bullish: Number(data.bullish_probability.toFixed(5)),
      bearish: Number(data.bearish_probability.toFixed(5)),
      confidence: Number(data.confidence_score.toFixed(5)),
    },
    confidenceLabel: data.confidence_label,
    risk: data.risk_level,
    qualityScore: data.quality_score,
    providerSource: data.explanation?.provider_source,
    usingManualFallback: data.explanation?.using_manual_fallback,
    agreementScore: data.explanation?.probability?.agreement_score,
    uncertaintyScore: data.explanation?.probability?.uncertainty_score,
    topPositiveReasons,
    topNegativeReasons,
    volatilityScore: Number((100 - data.confidence_score).toFixed(5)),
    manipulationRisk: mapRiskFromScore(data.manipulation_score),
    recommendation: data.recommendation,
    timeframe: data.timeframe,
    isGorengan: data.is_gorengan ?? data.explanation?.is_gorengan,
    gorenganReasons,
    headline: data.explanation?.headline,
    commentary: data.explanation?.commentary,
    suggestedStyle: data.mode === "long_term" ? "long-term" : data.mode,
    holdingDuration:
      data.holding_duration ??
      plan?.holding_duration ??
      (data.mode === "intraday" ? "minutes to 1 day" : data.mode === "swing" ? "3-14 days" : "1-6 months"),
    tradeScenario: plan?.scenario,
    tradeNote: plan?.note,
    riskWarnings: data.explanation?.risk?.warnings ?? [],
    entryZone: [Number(entryMin.toFixed(8)), Number(entryMax.toFixed(8))],
    takeProfits: takeProfits.map((value) => Number(value.toFixed(8))),
    cutLoss: Number(cutLoss.toFixed(8)),
    explanation: mapExplanationLines(data),
  };
}

interface RankingApiRow {
  as_of?: string;
  symbol: string;
  market: string;
  ranking_type: ApiMode;
  score: number;
  state: "new" | "stable" | "weakening" | "removed";
  probability_score: number;
  confidence_score: number;
  liquidity_score: number;
  cycle_confirmations: number;
  quality_score: number;
  risk_score: number;
}

export function mapRankings(rows: RankingApiRow[]): RankingItem[] {
  return rows.map((row, index) => ({
    asOf: row.as_of,
    symbol: row.symbol,
    market: mapMarket(row.market),
    mode: row.ranking_type === "long_term" ? "long-term" : row.ranking_type,
    score: Number(row.score.toFixed(3)),
    probability: Number(row.probability_score.toFixed(1)),
    confidence: Number(row.confidence_score.toFixed(1)),
    liquidityScore: Number(row.liquidity_score.toFixed(1)),
    cycleConfirmations: row.cycle_confirmations,
    riskScore: Number(row.risk_score.toFixed(5)),
    risk: mapRiskFromScore(row.risk_score),
    marketQuality: Number(row.quality_score.toFixed(1)),
    state: row.state,
    rank: index + 1,
    previousRank: index + 1,
  }));
}

interface PortfolioApiRow {
  symbol: string;
  market: string;
  quantity: string;
  avg_cost: string;
  last_price: string;
}

export function mapPortfolio(rows: PortfolioApiRow[]): PortfolioHolding[] {
  const totals = rows.map((row) => Number(row.quantity) * Number(row.last_price));
  const total = totals.reduce((acc, n) => acc + n, 0);

  return rows.map((row, index) => ({
    symbol: row.symbol,
    market: mapMarket(row.market),
    allocation: total > 0 ? Number(((totals[index] / total) * 100).toFixed(5)) : 0,
    averageEntry: Number(row.avg_cost),
    currentPrice: Number(row.last_price),
    quantity: Number(row.quantity),
  }));
}

export function toDashboardSnapshot(rankings: RankingItem[], holdings: PortfolioHolding[]): DashboardSnapshot {
  const totalPortfolioValue = holdings.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);

  return {
    totalPortfolioValue,
    dailyPnl: 0,
    weeklyPnl: 0,
    riskExposure:
      holdings.length === 0 ? 0 : Number((holdings.reduce((acc, h) => acc + h.allocation, 0) / holdings.length).toFixed(1)),
    fearGreed: 50,
    topOpportunities: rankings.slice(0, 5),
    recentAlerts: [],
    allocation: [
      {
        label: "Crypto",
        value: Number(
          holdings.filter((h) => h.market === "crypto").reduce((acc, h) => acc + h.allocation, 0).toFixed(5),
        ),
      },
      {
        label: "IDX",
        value: Number(
          holdings.filter((h) => h.market === "idx").reduce((acc, h) => acc + h.allocation, 0).toFixed(5),
        ),
      },
      {
        label: "US",
        value: Number(
          holdings.filter((h) => h.market === "us").reduce((acc, h) => acc + h.allocation, 0).toFixed(5),
        ),
      },
    ],
  };
}
