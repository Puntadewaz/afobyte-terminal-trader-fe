"use client";

import { MarketSummaryWidget } from "@/components/widgets/tradingview/market-summary-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WatchlistPanel() {
  const widgetSymbols = [
    "BINANCE:BTCUSDT",
    "BINANCE:ETHUSDT",
    "BINANCE:SOLUSDT",
    "BINANCE:BNBUSDT",
    "BINANCE:XRPUSDT",
    "BINANCE:ADAUSDT",
    "NASDAQ:AAPL",
    "NASDAQ:MSFT",
    "NASDAQ:NVDA",
    "NASDAQ:TSLA",
    "NYSE:KO",
    "NYSE:JPM",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist (TradingView)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="rounded-lg border border-zinc-800 p-2">
          <MarketSummaryWidget title="My Watchlist" symbols={widgetSymbols} minHeight={500} />
        </div>
      </CardContent>
    </Card>
  );
}
