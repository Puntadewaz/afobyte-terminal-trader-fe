"use client";

import { useMemo } from "react";
import { MarketSummaryWidget } from "@/components/widgets/tradingview/market-summary-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function parseCsv(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function toTvSymbols(symbols: string[], market: "crypto" | "us" | "idx"): string[] {
  return symbols.map((symbol) => {
    if (symbol.includes(":")) return symbol;

    if (market === "crypto") {
      if (symbol.endsWith("USDT") || symbol.endsWith("USDC") || symbol.endsWith("USD")) {
        return `BINANCE:${symbol}`;
      }
      if (symbol === "USDT") return "BINANCE:USDCUSDT";
      if (symbol === "USDC") return "BINANCE:USDCUSDT";
      return `BINANCE:${symbol}USDT`;
    }

    if (market === "idx") {
      return `IDX:${symbol}`;
    }

    return `NASDAQ:${symbol}`;
  });
}

export function WatchlistPanel() {
  const envCrypto = parseCsv(process.env.NEXT_PUBLIC_SYMBOLS_CRYPTO);
  const envUs = parseCsv(process.env.NEXT_PUBLIC_SYMBOLS_US);
  const envIdx = parseCsv(process.env.NEXT_PUBLIC_SYMBOLS_IDX);

  const cryptoSymbols = useMemo(
    () =>
      toTvSymbols(
        envCrypto.length > 0 ? envCrypto : ["BTC", "ETH", "SOL", "BNB"],
        "crypto",
      ),
    [envCrypto],
  );

  const usSymbols = useMemo(
    () =>
      toTvSymbols(
        envUs.length > 0 ? envUs : ["AAPL", "MSFT", "NVDA", "TSLA"],
        "us",
      ),
    [envUs],
  );

  const idxSymbols = useMemo(
    () =>
      toTvSymbols(
        envIdx.length > 0 ? envIdx : ["BBCA", "BBRI", "TLKM", "BMRI"],
        "idx",
      ),
    [envIdx],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Watchlist (TradingView)</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="rounded-lg border border-zinc-800 p-2">
          <MarketSummaryWidget
            minHeight={760}
            tabs={[
              { title: "Crypto", symbols: cryptoSymbols },
              { title: "US", symbols: usSymbols },
              { title: "IDX", symbols: idxSymbols },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}
