export type MarketKind = "crypto" | "idx" | "us";

export type TrendState = "bullish" | "bearish" | "sideways";

export type RiskLevel = "low" | "medium" | "high" | "extreme";

export type RankingState = "new" | "stable" | "weakening" | "removed";

export type Severity = "low" | "medium" | "high" | "extreme";

export interface ProbabilityBreakdown {
  bullish: number;
  bearish: number;
  confidence: number;
}

export interface AnalysisSignal {
  asset: string;
  asOf?: string;
  market: MarketKind;
  trend: TrendState;
  probability: ProbabilityBreakdown;
  confidenceLabel?: "low" | "medium" | "high";
  risk: RiskLevel;
  volatilityScore: number;
  manipulationRisk: Severity;
  recommendation?: string;
  timeframe?: string;
  qualityScore?: number;
  providerSource?: string;
  usingManualFallback?: boolean;
  agreementScore?: number;
  uncertaintyScore?: number;
  topPositiveReasons?: string[];
  topNegativeReasons?: string[];
  isGorengan?: boolean;
  gorenganReasons?: string[];
  headline?: string;
  commentary?: string;
  suggestedStyle: "long-term" | "swing" | "intraday";
  holdingDuration: string;
  tradeScenario?: string;
  tradeNote?: string;
  riskWarnings?: string[];
  entryZone: [number, number];
  takeProfits: number[];
  cutLoss: number;
  explanation: string[];
}

export interface RankingItem {
  symbol: string;
  market: MarketKind;
  mode: "long-term" | "swing" | "intraday";
  score: number;
  probability: number;
  confidence: number;
  liquidityScore: number;
  cycleConfirmations: number;
  riskScore: number;
  asOf?: string;
  risk: RiskLevel;
  marketQuality: number;
  state: RankingState;
  rank: number;
  previousRank: number;
}

export interface PortfolioHolding {
  symbol: string;
  market: MarketKind;
  allocation: number;
  averageEntry: number;
  currentPrice: number;
  quantity: number;
}

export interface AlertItem {
  id: string;
  type: "signal" | "risk" | "breakout" | "ranking" | "manipulation";
  severity: Severity;
  title: string;
  detail: string;
  createdAt: string;
  market: MarketKind;
}

export interface DashboardSnapshot {
  totalPortfolioValue: number;
  dailyPnl: number;
  weeklyPnl: number;
  riskExposure: number;
  fearGreed: number;
  topOpportunities: RankingItem[];
  recentAlerts: AlertItem[];
  allocation: Array<{ label: string; value: number }>;
}
