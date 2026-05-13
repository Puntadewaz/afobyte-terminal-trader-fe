"use client";

import { MarketSummaryWidget } from "@/components/widgets/tradingview/market-summary-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWatchlistQuery } from "@/hooks/use-watchlist";

export function WatchlistPanel() {
  const { data, isLoading, error } = useWatchlistQuery();
  const widgetSymbols = (data ?? []).slice(0, 12).map((item) => {
    const normalized = item.symbol.trim().toUpperCase();
    if (!normalized) return "BINANCE:BTCUSDT";
    if (normalized.includes(":")) return normalized;
    if (normalized.endsWith("USDT")) return `BINANCE:${normalized}`;
    return `BINANCE:${normalized}USDT`;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist Market Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 overflow-x-auto">
        {isLoading ? <p className="text-sm text-zinc-400">Loading watchlist...</p> : null}
        {error ? <p className="text-sm text-red-400">Failed to load watchlist.</p> : null}

        <div className="rounded-lg border border-zinc-800 p-2">
          <MarketSummaryWidget title="My Watchlist" symbols={widgetSymbols} minHeight={500} />
        </div>

        {!isLoading && !error && (data?.length ?? 0) === 0 ? (
          <p className="text-sm text-zinc-400">No watchlist symbols found.</p>
        ) : null}

        {!isLoading && !error && (data?.length ?? 0) > 0 ? (
          <>
            <p className="pt-2 text-xs uppercase tracking-[0.12em] text-zinc-500">Synced watchlist data</p>
          <table className="w-full text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="px-2 py-2 text-left">Symbol</th>
                <th className="px-2 py-2 text-left">Last Price</th>
                <th className="px-2 py-2 text-left">Change %</th>
                <th className="px-2 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={`${item.symbol}-${item.note ?? ""}`} className="border-b border-zinc-900/60">
                  <td className="px-2 py-2 text-zinc-200">{item.symbol}</td>
                  <td className="px-2 py-2 text-zinc-300">
                    {typeof item.last_price === "number" ? item.last_price.toLocaleString() : "-"}
                  </td>
                  <td className="px-2 py-2 text-zinc-300">
                    {typeof item.change_pct === "number" ? `${item.change_pct.toFixed(5)}%` : "-"}
                  </td>
                  <td className="px-2 py-2 text-zinc-400">{item.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
