"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRankingsQuery } from "@/hooks/use-rankings";

const START_CAPITAL = 100_000;
const TARGET_CAPITAL = 1_000_000;
const TARGET_DAYS = 7;

export function CapitalPlanner() {
  const [profitPerTradePct, setProfitPerTradePct] = useState("2.5");
  const { data: cryptoRankings, isLoading: isCryptoLoading } = useRankingsQuery(3, "crypto", "swing");
  const { data: usRankings, isLoading: isUsLoading } = useRankingsQuery(3, "us_stock", "swing");

  const parsedProfit = Number(profitPerTradePct);
  const safeProfit = Number.isFinite(parsedProfit) && parsedProfit > 0 ? parsedProfit / 100 : 0;

  const planning = useMemo(() => {
    if (!safeProfit) {
      return {
        requiredTrades: 0,
        tradesPerDay: 0,
      };
    }

    const factor = TARGET_CAPITAL / START_CAPITAL;
    const requiredTrades = Math.ceil(Math.log(factor) / Math.log(1 + safeProfit));
    const tradesPerDay = requiredTrades / TARGET_DAYS;

    return {
      requiredTrades,
      tradesPerDay,
    };
  }, [safeProfit]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Simple Capital Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          <p>Target: ubah modal <strong>{START_CAPITAL.toLocaleString()}</strong> menjadi <strong>{TARGET_CAPITAL.toLocaleString()}</strong> dalam <strong>{TARGET_DAYS} hari</strong>.</p>
          <label className="grid gap-1 text-xs text-zinc-400">
            Asumsi profit rata-rata per trade (%)
            <Input
              type="number"
              step="0.1"
              value={profitPerTradePct}
              onChange={(event) => setProfitPerTradePct(event.target.value)}
            />
          </label>
          <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Hasil Perhitungan</p>
            <p className="mt-2">Estimasi jumlah trading yang dibutuhkan: <strong>{planning.requiredTrades.toLocaleString()}</strong> kali</p>
            <p>Rata-rata kebutuhan per hari: <strong>{planning.tradesPerDay.toFixed(5)}</strong> trade/hari</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekomendasi Aset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {isCryptoLoading || isUsLoading ? (
            <p>Loading recommendations...</p>
          ) : (
            <>
              <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Top Crypto (Swing)</p>
                {(cryptoRankings ?? []).slice(0, 3).map((row) => (
                  <p key={row.symbol} className="mt-1">- {row.symbol} (score {row.score.toFixed(5)})</p>
                ))}
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Top US Stock (Swing)</p>
                {(usRankings ?? []).slice(0, 3).map((row) => (
                  <p key={row.symbol} className="mt-1">- {row.symbol} (score {row.score.toFixed(5)})</p>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
