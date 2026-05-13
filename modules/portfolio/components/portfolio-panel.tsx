"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePortfolioQuery } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import { http } from "@/services/api/http";

interface PortfolioFormState {
  symbol: string;
  market: "crypto" | "idx" | "us";
  quantity: string;
  avgCost: string;
  lastPrice: string;
}

export function PortfolioPanel() {
  const queryClient = useQueryClient();
  const { data, isLoading } = usePortfolioQuery();
  const [form, setForm] = useState<PortfolioFormState>({
    symbol: "",
    market: "crypto",
    quantity: "",
    avgCost: "",
    lastPrice: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitPortfolio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await http(
        "/api/v1/portfolio",
        {
          method: "POST",
          body: JSON.stringify({
            symbol: form.symbol.trim().toUpperCase(),
            market: form.market,
            quantity: Number(form.quantity),
            avg_cost: Number(form.avgCost),
            last_price: Number(form.lastPrice),
          }),
        },
        { withUserId: true },
      );

      setForm({
        symbol: "",
        market: form.market,
        quantity: "",
        avgCost: "",
        lastPrice: "",
      });

      await queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save portfolio entry";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading || !data ? (
            <p className="text-sm text-zinc-400">Loading holdings...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-zinc-500">
                <tr className="border-b border-zinc-800">
                  <th className="px-2 py-2 text-left">Asset</th>
                  <th className="px-2 py-2 text-left">Allocation</th>
                  <th className="px-2 py-2 text-left">Avg Entry</th>
                  <th className="px-2 py-2 text-left">Current</th>
                  <th className="px-2 py-2 text-left">Qty</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.symbol} className="border-b border-zinc-900/60">
                    <td className="px-2 py-2 text-zinc-200">{row.symbol}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.allocation}%</td>
                    <td className="px-2 py-2 text-zinc-300">{formatCurrency(row.averageEntry)}</td>
                    <td className="px-2 py-2 text-zinc-300">{formatCurrency(row.currentPrice)}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Portfolio Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="space-y-3" onSubmit={submitPortfolio}>
            <label className="grid gap-1 text-xs text-zinc-400">
              Symbol
              <Input
                value={form.symbol}
                onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))}
                placeholder="BTCUSDT"
                required
              />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Market
              <Select
                value={form.market}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, market: event.target.value as PortfolioFormState["market"] }))
                }
              >
                <option value="crypto">Crypto</option>
                {/* <option value="idx">IDX</option> */}
                {/* <option value="us">US</option> */}
              </Select>
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Quantity
              <Input
                type="number"
                step="any"
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
                required
              />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Average Cost
              <Input
                type="number"
                step="any"
                value={form.avgCost}
                onChange={(event) => setForm((prev) => ({ ...prev, avgCost: event.target.value }))}
                required
              />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Last Price
              <Input
                type="number"
                step="any"
                value={form.lastPrice}
                onChange={(event) => setForm((prev) => ({ ...prev, lastPrice: event.target.value }))}
                required
              />
            </label>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Portfolio Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
