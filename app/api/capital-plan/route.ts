import { NextRequest, NextResponse } from "next/server";
import { annualizedGrowth } from "@/lib/risk";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { capital, targetAmount, durationYears, winRate, riskPerTrade } = body;

  const requiredGrowth = annualizedGrowth(capital, targetAmount, durationYears);
  const tradeCount = Math.ceil((durationYears * 252) / 3);
  const expectedEdge = (winRate / 100) * (riskPerTrade / 100) * tradeCount;
  const feasibility =
    requiredGrowth > 55
      ? "Target growth requires extremely high risk exposure."
      : requiredGrowth > 30
        ? "Feasible but demands strict execution and controlled drawdown."
        : "Feasible under disciplined risk management and diversification.";

  return NextResponse.json({
    requiredGrowth,
    estimatedTradeCount: tradeCount,
    expectedEdge,
    feasibility,
    feeImpact: Math.max(0.5, tradeCount * 0.04),
    diversificationSuggestion:
      requiredGrowth > 40
        ? "Increase diversification across uncorrelated assets to stabilize returns."
        : "Maintain balanced exposure and avoid concentration above 35% in one asset.",
  });
}
