import { http } from "@/services/api/http";

export interface SnapshotAnalysisResult {
  recommendation?: string;
  summary?: string;
  confidence?: number;
  reasons?: string[];
  bullishProbability?: number;
  bearishProbability?: number;
  confidenceLabel?: string;
  timeframe?: string;
  isGorengan?: boolean;
  gorenganReasons?: string[];
  tradePlan?: string;
  chartFeaturesExtracted?: Record<string, unknown>;
  raw?: unknown;
  [key: string]: unknown;
}

export interface SnapshotChartFeatures {
  vol_spike?: boolean;
  vol_z?: number;
  structure_confidence?: "low" | "medium" | "high";
  [key: string]: unknown;
}

interface SnapshotApiInner {
  bearish_probability?: number;
  bullish_probability?: number;
  confidence_label?: string;
  confidence_score?: number;
  gorengan_reasons?: string[];
  is_gorengan?: boolean;
  recommendation?: string;
  timeframe?: string;
  trade_plan?: string;
  chart_features_extracted?: Record<string, unknown>;
  probability_explanation?: {
    headline?: string;
    top_positive?: Array<{ reason?: string }>;
    top_negative?: Array<{ reason?: string }>;
  };
}

interface SnapshotApiPayload {
  data?: SnapshotApiInner;
  meta?: Record<string, unknown>;
  success?: boolean;
}

function normalizeSnapshotPayload(payload: SnapshotApiPayload): SnapshotAnalysisResult {
  const data = payload.data ?? {};
  const topPositive = (data.probability_explanation?.top_positive ?? [])
    .map((item) => item.reason)
    .filter((line): line is string => Boolean(line));
  const topNegative = (data.probability_explanation?.top_negative ?? [])
    .map((item) => item.reason)
    .filter((line): line is string => Boolean(line));

  return {
    recommendation: data.recommendation,
    summary: data.probability_explanation?.headline,
    confidence: data.confidence_score,
    confidenceLabel: data.confidence_label,
    bullishProbability: data.bullish_probability,
    bearishProbability: data.bearish_probability,
    timeframe: data.timeframe,
    isGorengan: data.is_gorengan,
    gorenganReasons: data.gorengan_reasons ?? [],
    tradePlan: data.trade_plan,
    chartFeaturesExtracted: data.chart_features_extracted,
    reasons: [...topPositive, ...topNegative],
    raw: payload,
  };
}

export async function analyzeSnapshot(input: {
  imageBase64: string;
  timeframe: string;
  chartFeatures?: SnapshotChartFeatures;
  symbol: string;
  interval: string;
}) {
  const payload = await http<SnapshotApiPayload>(
    "/api/v1/analyze-snapshot",
    {
      method: "POST",
      body: JSON.stringify({
        timeframe: input.timeframe,
        image_base64: input.imageBase64,
        chart_features: input.chartFeatures ?? {},
        symbol: input.symbol,
        interval: input.interval,
      }),
    },
    { withUserId: true },
  );

  return normalizeSnapshotPayload(payload);
}
