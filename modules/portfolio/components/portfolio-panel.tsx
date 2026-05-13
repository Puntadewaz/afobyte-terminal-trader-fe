"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

interface PortfolioFormState {
  symbol: string;
  market: "crypto" | "idx" | "us";
  quantity: string;
  avgCost: string;
  lastPrice: string;
}

interface PortfolioRow {
  id: string;
  symbol: string;
  market: "crypto" | "idx" | "us";
  quantity: number;
  averageEntry: number;
  currentPrice: number;
  allocation: number;
}

const STORAGE_KEY = "portfolio-investment-v1";

export function PortfolioPanel() {
  const [rows, setRows] = useState<PortfolioRow[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as PortfolioRow[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState<PortfolioFormState>({
    symbol: "",
    market: "crypto",
    quantity: "",
    avgCost: "",
    lastPrice: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const withAllocation = useMemo(() => {
    const total = rows.reduce((acc, item) => acc + item.currentPrice * item.quantity, 0);
    return rows.map((item) => ({
      ...item,
      allocation: total > 0 ? Number((((item.currentPrice * item.quantity) / total) * 100).toFixed(5)) : 0,
    }));
  }, [rows]);

  async function submitPortfolio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: PortfolioRow = {
      id: crypto.randomUUID(),
      symbol: form.symbol.trim().toUpperCase(),
      market: form.market,
      quantity: Number(form.quantity),
      averageEntry: Number(form.avgCost),
      currentPrice: Number(form.lastPrice),
      allocation: 0,
    };

    if (!payload.symbol || payload.quantity <= 0 || payload.averageEntry <= 0 || payload.currentPrice <= 0) {
      return;
    }

    setRows((prev) => [payload, ...prev]);
    setForm((prev) => ({ ...prev, symbol: "", quantity: "", avgCost: "", lastPrice: "" }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Investment Records</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {withAllocation.length === 0 ? (
            <p className="text-sm text-zinc-400">Belum ada catatan investment.</p>
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
                {withAllocation.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-900/60">
                    <td className="px-2 py-2 text-zinc-200">{row.symbol}</td>
                    <td className="px-2 py-2 text-zinc-300">{row.allocation.toFixed(5)}%</td>
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
          <CardTitle>Add Investment Record</CardTitle>
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

            <Button type="submit" className="w-full">
              Save Investment Record
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
