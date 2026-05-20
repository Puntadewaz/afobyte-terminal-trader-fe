"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRankingsQuery } from "@/hooks/use-rankings";

const PROFIT_OPTIONS = [2.5, 5, 7.5, 10] as const;

export function CapitalPlanner() {
  const [capital, setCapital] = useState("100000");
  const [target, setTarget] = useState("1000000");
  const [days, setDays] = useState("7");

  const { data: cryptoRankings, isLoading: isCryptoLoading } = useRankingsQuery(3, "crypto", "swing");

  const parsedCapital = Number(capital);
  const parsedTarget = Number(target);
  const parsedDays = Number(days);

  const isInputValid =
    Number.isFinite(parsedCapital) &&
    Number.isFinite(parsedTarget) &&
    Number.isFinite(parsedDays) &&
    parsedCapital > 0 &&
    parsedTarget > parsedCapital &&
    parsedDays > 0;

  const planningRows = useMemo(() => {
    if (!isInputValid) return [];

    const factor = parsedTarget / parsedCapital;

    return PROFIT_OPTIONS.map((profitPct) => {
      const growth = 1 + profitPct / 100;
      const requiredTrades = Math.ceil(Math.log(factor) / Math.log(growth));
      const tradesPerDay = requiredTrades / parsedDays;

      return {
        profitPct,
        requiredTrades,
        tradesPerDay,
      };
    });
  }, [isInputValid, parsedCapital, parsedDays, parsedTarget]);

  const bestCase = planningRows.length > 0 ? planningRows[planningRows.length - 1] : null;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Simple Capital Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          <p>
            Target: ubah modal <strong>{Number.isFinite(parsedCapital) ? parsedCapital.toLocaleString() : capital}</strong> menjadi <strong>{Number.isFinite(parsedTarget) ? parsedTarget.toLocaleString() : target}</strong> dalam <strong>{days} hari</strong>.
          </p>

          <label className="grid gap-1 text-xs text-zinc-400">
            Modal Awal
            <Input
              type="number"
              step="any"
              value={capital}
              onChange={(event) => setCapital(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-xs text-zinc-400">
            Target Modal
            <Input
              type="number"
              step="any"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            />
          </label>

          <label className="grid gap-1 text-xs text-zinc-400">
            Durasi (hari)
            <Input
              type="number"
              step="1"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            />
          </label>

          <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Hasil Perhitungan</p>

            {!isInputValid ? (
              <p className="mt-2">Isi input dengan benar: modal &gt; 0, target &gt; modal, dan hari &gt; 0.</p>
            ) : (
              <>
                <p className="mt-2 text-zinc-200">Estimasi jumlah trading berdasarkan pilihan profit per trade:</p>
                <table className="mt-2 w-full text-xs">
                  <thead className="text-zinc-500">
                    <tr className="border-b border-zinc-800">
                      <th className="py-1 text-left">Profit / Trade</th>
                      <th className="py-1 text-left">Jumlah Trading</th>
                      <th className="py-1 text-left">Trade / Hari</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planningRows.map((row) => (
                      <tr key={row.profitPct} className="border-b border-zinc-900/60">
                        <td className="py-1">{row.profitPct.toFixed(1)}%</td>
                        <td className="py-1">{row.requiredTrades.toLocaleString()}</td>
                        <td className="py-1">{row.tradesPerDay.toFixed(5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {bestCase ? (
                  <p className="mt-2 text-zinc-400">
                    Skenario paling cepat (profit {bestCase.profitPct.toFixed(1)}% per trade): sekitar {bestCase.requiredTrades.toLocaleString()} trade.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekomendasi Aset</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-zinc-300">
          {isCryptoLoading ? (
            <p>Loading recommendations...</p>
          ) : (
            <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Top Crypto (Swing)</p>
              {(cryptoRankings ?? []).slice(0, 3).map((row) => (
                <p key={row.symbol} className="mt-1">- {row.symbol} (score {row.score.toFixed(5)})</p>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
