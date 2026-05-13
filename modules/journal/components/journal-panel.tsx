"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRankingsQuery } from "@/hooks/use-rankings";

interface JournalRow {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  profitPct: number;
  createdAt: string;
}

interface JournalFormState {
  symbol: string;
  entryPrice: string;
  exitPrice: string;
}

const STORAGE_KEY = "journal-simple-v1";

export function JournalPanel() {
  const { data: cryptoRankings } = useRankingsQuery(20, "crypto", "swing");
  const { data: usRankings } = useRankingsQuery(20, "us_stock", "swing");
  const symbols = useMemo(() => {
    const rows = [
      ...(cryptoRankings ?? []).map((item) => item.symbol),
      ...(usRankings ?? []).map((item) => item.symbol),
      "BTCUSDT",
      "ETHUSDT",
      "AAPL",
      "MSFT",
    ];
    return rows.filter((value, index, all) => Boolean(value) && all.indexOf(value) === index);
  }, [cryptoRankings, usRankings]);

  const [rows, setRows] = useState<JournalRow[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as JournalRow[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState<JournalFormState>({
    symbol: "BTCUSDT",
    entryPrice: "",
    exitPrice: "",
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  async function submitJournal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const entry = Number(form.entryPrice);
    const exit = Number(form.exitPrice);

    if (!Number.isFinite(entry) || !Number.isFinite(exit) || entry <= 0) {
      return;
    }

    const profitPct = ((exit - entry) / entry) * 100;
    const payload: JournalRow = {
      id: crypto.randomUUID(),
      symbol: form.symbol.trim().toUpperCase(),
      entryPrice: entry,
      exitPrice: exit,
      profitPct: Number(profitPct.toFixed(5)),
      createdAt: new Date().toISOString(),
    };

    setRows((prev) => [payload, ...prev]);
    setForm((prev) => ({ ...prev, entryPrice: "", exitPrice: "" }));
  }

  const wins = rows.filter((d) => d.profitPct > 0).length;
  const winRate = rows.length ? (wins / rows.length) * 100 : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Trade Journal (Simple Record)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-zinc-400">Belum ada catatan trading.</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="rounded-md border border-zinc-800 p-3">
                <p className="text-sm font-medium text-zinc-100">{row.symbol}</p>
                <p className="text-xs text-zinc-400">
                  In: {row.entryPrice.toFixed(5)} | Out: {row.exitPrice.toFixed(5)} | PnL: {row.profitPct.toFixed(5)}%
                </p>
                <p className="text-xs text-zinc-500">{new Date(row.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Trade Record</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="space-y-3" onSubmit={submitJournal}>
            <label className="grid gap-1 text-xs text-zinc-400">
              Symbol
              <Select
                value={form.symbol}
                onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))}
              >
                {symbols.map((symbol) => (
                  <option key={symbol} value={symbol}>
                    {symbol}
                  </option>
                ))}
              </Select>
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Entry Price (In)
              <Input
                type="number"
                step="any"
                value={form.entryPrice}
                onChange={(event) => setForm((prev) => ({ ...prev, entryPrice: event.target.value }))}
                required
              />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Exit Price (Out)
              <Input
                type="number"
                step="any"
                value={form.exitPrice}
                onChange={(event) => setForm((prev) => ({ ...prev, exitPrice: event.target.value }))}
                required
              />
            </label>

            <Button type="submit" className="w-full">
              Save Journal Trade
            </Button>
          </form>

          <div className="space-y-1 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
            <p>Current Winrate: {winRate.toFixed(5)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
