import { annualizedGrowth, calcRiskReward, getRiskLevel } from "@/lib/risk";

describe("risk utilities", () => {
  it("maps risk score to level", () => {
    expect(getRiskLevel(12)).toBe("low");
    expect(getRiskLevel(45)).toBe("medium");
    expect(getRiskLevel(70)).toBe("high");
    expect(getRiskLevel(92)).toBe("extreme");
  });

  it("calculates risk reward ratio", () => {
    expect(calcRiskReward(100, 95, 112)).toBeCloseTo(2.4);
  });

  it("calculates annualized growth", () => {
    expect(annualizedGrowth(10000, 14400, 2)).toBeCloseTo(20, 0);
  });
});
