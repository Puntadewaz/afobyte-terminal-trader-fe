import type {
  AlertItem,
  AnalysisSignal,
  DashboardSnapshot,
  MarketKind,
  PortfolioHolding,
  RankingItem,
} from "@/types/market";

function seeded(step: number, base: number, variance: number): number {
  const x = Math.sin(step * 9283.41) * 10000;
  return base + ((x - Math.floor(x)) - 0.5) * variance;
}

export function generateCandles(length = 80, start = 100): Array<{
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}> {
  let last = start;
  return Array.from({ length }, (_, i) => {
    const drift = seeded(i, 0.9, 4);
    const open = last;
    const close = Math.max(1, open + drift);
    const high = Math.max(open, close) + Math.abs(seeded(i + 2, 1.1, 1.6));
    const low = Math.min(open, close) - Math.abs(seeded(i + 1, 1, 1.4));
    last = close;
    return {
      time: new Date(Date.now() - (length - i) * 86_400_000).toISOString(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    };
  });
}

export const rankings: RankingItem[] = [
  {
    symbol: "BTC",
    market: "crypto",
    mode: "swing",
    score: 0.842,
    probability: 67,
    confidence: 72,
    liquidityScore: 91.5,
    cycleConfirmations: 3,
    riskScore: 41.2,
    risk: "medium",
    marketQuality: 84,
    state: "stable",
    rank: 1,
    previousRank: 1,
  },
  {
    symbol: "AVAX",
    market: "crypto",
    mode: "swing",
    score: 0.791,
    probability: 64,
    confidence: 69,
    liquidityScore: 74.2,
    cycleConfirmations: 2,
    riskScore: 62.8,
    risk: "high",
    marketQuality: 71,
    state: "new",
    rank: 2,
    previousRank: 7,
  },
  {
    symbol: "BBCA",
    market: "idx",
    mode: "long-term",
    score: 0.808,
    probability: 61,
    confidence: 80,
    liquidityScore: 88.3,
    cycleConfirmations: 4,
    riskScore: 24.7,
    risk: "low",
    marketQuality: 90,
    state: "stable",
    rank: 3,
    previousRank: 4,
  },
  {
    symbol: "AAPL",
    market: "us",
    mode: "long-term",
    score: 0.776,
    probability: 58,
    confidence: 74,
    liquidityScore: 93.1,
    cycleConfirmations: 2,
    riskScore: 37.9,
    risk: "medium",
    marketQuality: 87,
    state: "weakening",
    rank: 4,
    previousRank: 2,
  },
  {
    symbol: "SMRA",
    market: "idx",
    mode: "intraday",
    score: 0.412,
    probability: 47,
    confidence: 43,
    liquidityScore: 22.4,
    cycleConfirmations: 0,
    riskScore: 86.5,
    risk: "extreme",
    marketQuality: 29,
    state: "removed",
    rank: 5,
    previousRank: 3,
  },
];

export const alerts: AlertItem[] = [
  {
    id: "1",
    type: "ranking",
    severity: "medium",
    title: "AVAX entered Top Swing Opportunities",
    detail: "Probability rose to 64% with improving volume structure.",
    createdAt: new Date().toISOString(),
    market: "crypto",
  },
  {
    id: "2",
    type: "manipulation",
    severity: "high",
    title: "Abnormal volume detected on low-float IDX asset",
    detail: "Volume surge 8.7x normal with widening spread and weak close.",
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    market: "idx",
  },
  {
    id: "3",
    type: "risk",
    severity: "high",
    title: "Portfolio concentration exceeded 40%",
    detail: "Single asset concentration reached 44.2%. Diversification warning active.",
    createdAt: new Date(Date.now() - 6_000_000).toISOString(),
    market: "us",
  },
];

export const holdings: PortfolioHolding[] = [
  {
    symbol: "BTC",
    market: "crypto",
    allocation: 32,
    averageEntry: 63_120,
    currentPrice: 66_021,
    quantity: 0.24,
  },
  {
    symbol: "BBCA",
    market: "idx",
    allocation: 26,
    averageEntry: 8_850,
    currentPrice: 9_140,
    quantity: 3200,
  },
  {
    symbol: "AAPL",
    market: "us",
    allocation: 22,
    averageEntry: 188,
    currentPrice: 192.4,
    quantity: 41,
  },
  {
    symbol: "TLKM",
    market: "idx",
    allocation: 20,
    averageEntry: 3_820,
    currentPrice: 3_760,
    quantity: 6700,
  },
];

export function getAnalysisByMarket(market: MarketKind): AnalysisSignal {
  const base: Record<MarketKind, AnalysisSignal> = {
    crypto: {
      asset: "BTC",
      market: "crypto",
      trend: "bullish",
      probability: { bullish: 67, bearish: 33, confidence: 72 },
      risk: "medium",
      volatilityScore: 63,
      manipulationRisk: "medium",
      suggestedStyle: "swing",
      holdingDuration: "5-14 days",
      entryZone: [64850, 65850],
      takeProfits: [67200, 68900, 70500],
      cutLoss: 63300,
      explanation: [
        "EMA20 remains above EMA50 with slope expansion.",
        "RSI rebounded from 45 to 58 while volume improved 18% above 20-day average.",
        "MACD histogram turned positive but momentum is not extreme, supporting controlled continuation.",
      ],
    },
    idx: {
      asset: "BBCA",
      market: "idx",
      trend: "sideways",
      probability: { bullish: 56, bearish: 44, confidence: 68 },
      risk: "medium",
      volatilityScore: 38,
      manipulationRisk: "low",
      suggestedStyle: "long-term",
      holdingDuration: "1-3 months",
      entryZone: [9020, 9150],
      takeProfits: [9350, 9480, 9650],
      cutLoss: 8820,
      explanation: [
        "Price consolidates above EMA200 with steady institutional accumulation profile.",
        "Liquidity remains strong and spread stays tight across sessions.",
        "No abnormal parabolic movement detected, reducing gorengan risk.",
      ],
    },
    us: {
      asset: "AAPL",
      market: "us",
      trend: "bullish",
      probability: { bullish: 58, bearish: 42, confidence: 74 },
      risk: "medium",
      volatilityScore: 41,
      manipulationRisk: "low",
      suggestedStyle: "long-term",
      holdingDuration: "1-6 months",
      entryZone: [186.5, 190.2],
      takeProfits: [196.7, 201.2, 208],
      cutLoss: 181.2,
      explanation: [
        "EMA50 is above EMA200, confirming broad trend support.",
        "Volatility remains moderate with healthy pullback structure.",
        "Probability remains moderate, so position sizing should stay disciplined.",
      ],
    },
  };

  return base[market];
}

export function getDashboardSnapshot(): DashboardSnapshot {
  return {
    totalPortfolioValue: 182_420,
    dailyPnl: 1.28,
    weeklyPnl: 4.92,
    riskExposure: 62,
    fearGreed: 57,
    topOpportunities: rankings.slice(0, 4),
    recentAlerts: alerts,
    allocation: [
      { label: "Crypto", value: 32 },
      { label: "IDX", value: 46 },
      { label: "US", value: 22 },
    ],
  };
}
