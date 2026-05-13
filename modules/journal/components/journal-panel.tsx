"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { http } from "@/services/api/http";

interface JournalRow {
  id: string;
  asset: string;
  setup: string;
  outcome: string;
  rr: number;
  note: string;
  mistake: string;
}

interface ApiJournalRow {
  id: number;
  symbol: string;
  market?: string;
  setup_category: string;
  pnl: string;
  notes: string | null;
}

interface JournalFormState {
  symbol: string;
  market: "crypto" | "idx" | "us";
  setupCategory: string;
  pnl: string;
  notes: string;
}

export function JournalPanel() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<JournalFormState>({
    symbol: "",
    market: "crypto",
    setupCategory: "breakout",
    pnl: "0",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["journal"],
    queryFn: async () => {
      const rows = await http<ApiJournalRow[]>("/api/v1/journal", undefined, { withUserId: true });
      return rows.map((row) => ({
        id: String(row.id),
        asset: row.symbol,
        setup: row.setup_category,
        outcome: Number(row.pnl) >= 0 ? "win" : "loss",
        rr: 0,
        note: row.notes ?? "No notes",
        mistake: "n/a",
      })) as JournalRow[];
    },
  });

  async function submitJournal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await http(
        "/api/v1/journal",
        {
          method: "POST",
          body: JSON.stringify({
            symbol: form.symbol.trim().toUpperCase(),
            market: form.market,
            setup_category: form.setupCategory.trim(),
            pnl: Number(form.pnl),
            notes: form.notes.trim() || null,
          }),
        },
        { withUserId: true },
      );

      setForm((prev) => ({
        ...prev,
        symbol: "",
        pnl: "0",
        notes: "",
      }));

      await queryClient.invalidateQueries({ queryKey: ["journal"] });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save journal entry";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  const wins = data?.filter((d) => d.outcome === "win").length ?? 0;
  const winRate = data?.length ? (wins / data.length) * 100 : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Trade Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading || !data ? (
            <p className="text-sm text-zinc-400">Loading journal...</p>
          ) : (
            data.map((row) => (
              <div key={row.id} className="rounded-md border border-zinc-800 p-3">
                <p className="text-sm font-medium text-zinc-100">{row.asset} - {row.setup}</p>
                <p className="text-xs text-zinc-400">Outcome: {row.outcome} | RR: {row.rr}</p>
                <p className="text-sm text-zinc-300">{row.note}</p>
                <p className="text-xs text-amber-300">Mistake: {row.mistake}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Journal Trade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form className="space-y-3" onSubmit={submitJournal}>
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
                  setForm((prev) => ({ ...prev, market: event.target.value as JournalFormState["market"] }))
                }
              >
                <option value="crypto">Crypto</option>
                {/* <option value="idx">IDX</option> */}
                {/* <option value="us">US</option> */}
              </Select>
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Setup Category
              <Input
                value={form.setupCategory}
                onChange={(event) => setForm((prev) => ({ ...prev, setupCategory: event.target.value }))}
                placeholder="breakout"
                required
              />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              PnL
              <Input
                type="number"
                step="any"
                value={form.pnl}
                onChange={(event) => setForm((prev) => ({ ...prev, pnl: event.target.value }))}
                required
              />
            </label>

            <label className="grid gap-1 text-xs text-zinc-400">
              Notes
              <Input
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Entry reason, risk notes"
              />
            </label>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Journal Trade"}
            </Button>
          </form>

          <div className="space-y-1 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
            <p>Current Winrate: {winRate.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
