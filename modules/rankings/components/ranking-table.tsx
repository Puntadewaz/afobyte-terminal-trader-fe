"use client";

import { useState } from "react";
import { useRankingsQuery } from "@/hooks/use-rankings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RankingsTab = "crypto" | "us_stock";

const tabLabel: Record<RankingsTab, string> = {
  crypto: "Crypto",
  us_stock: "US Stocks",
};

function delta(rank: number, previousRank: number): string {
  const d = previousRank - rank;
  if (d > 0) return `+${d}`;
  if (d < 0) return `${d}`;
  return "0";
}

function stateVariant(state: string) {
  if (state === "new") return "info" as const;
  if (state === "stable") return "bullish" as const;
  if (state === "weakening") return "warning" as const;
  return "bearish" as const;
}

export function RankingTable() {
  const [activeTab, setActiveTab] = useState<RankingsTab>("crypto");
  const { data, isLoading } = useRankingsQuery(20, activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Opportunity Rankings</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={activeTab === "crypto" ? "secondary" : "outline"}
            onClick={() => setActiveTab("crypto")}
          >
            Crypto
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === "us_stock" ? "secondary" : "outline"}
            onClick={() => setActiveTab("us_stock")}
          >
            US Stocks
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading || !data ? (
          <p className="text-sm text-zinc-400">Loading rankings...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-zinc-400">No {tabLabel[activeTab]} rankings returned by API.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-zinc-800">
                <th className="px-2 py-2 text-left">Rank</th>
                <th className="px-2 py-2 text-left">Asset</th>
                <th className="px-2 py-2 text-left">Mode</th>
                <th className="px-2 py-2 text-left">Score</th>
                <th className="px-2 py-2 text-left">Probability</th>
                <th className="px-2 py-2 text-left">Confidence</th>
                <th className="px-2 py-2 text-left">Liquidity</th>
                <th className="px-2 py-2 text-left">Cycle</th>
                <th className="px-2 py-2 text-left">Risk</th>
                <th className="px-2 py-2 text-left">State</th>
                <th className="px-2 py-2 text-left">Delta</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={`${item.market}-${item.symbol}`} className="border-b border-zinc-900/60">
                  <td className="px-2 py-2 text-zinc-200">#{item.rank}</td>
                  <td className="px-2 py-2 text-zinc-200">{item.symbol}</td>
                  <td className="px-2 py-2 text-zinc-300">{item.mode}</td>
                  <td className="px-2 py-2 text-zinc-300">{item.score.toFixed(3)}</td>
                  <td className="px-2 py-2 text-zinc-300">{item.probability}%</td>
                  <td className="px-2 py-2 text-zinc-300">{item.confidence}%</td>
                  <td className="px-2 py-2 text-zinc-300">{item.liquidityScore.toFixed(1)}</td>
                  <td className="px-2 py-2 text-zinc-300">{item.cycleConfirmations}</td>
                  <td className="px-2 py-2 text-zinc-300">
                    {item.risk} ({item.riskScore.toFixed(5)})
                  </td>
                  <td className="px-2 py-2">
                    <Badge variant={stateVariant(item.state)}>{item.state}</Badge>
                  </td>
                  <td className="px-2 py-2 text-zinc-300">{delta(item.rank, item.previousRank)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
