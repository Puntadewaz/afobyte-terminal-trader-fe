import type { RiskLevel } from "@/types/market";

export function getRiskLevel(score: number): RiskLevel {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "extreme";
}

export function calcRiskReward(entry: number, cutLoss: number, target: number): number {
  const risk = Math.abs(entry - cutLoss);
  const reward = Math.abs(target - entry);
  if (risk === 0) return 0;
  return reward / risk;
}

export function annualizedGrowth(start: number, target: number, years: number): number {
  if (start <= 0 || target <= 0 || years <= 0) return 0;
  return (Math.pow(target / start, 1 / years) - 1) * 100;
}
