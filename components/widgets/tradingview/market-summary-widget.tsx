"use client";

import { TradingViewScriptWidget } from "@/components/widgets/tradingview/tradingview-script-widget";

interface MarketSummaryWidgetProps {
  title?: string;
  symbols?: string[];
  minHeight?: number;
}

function toRows(symbols?: string[]) {
  if (!symbols || symbols.length === 0) {
    return [
      { s: "BINANCE:BTCUSDT", d: "Bitcoin" },
      { s: "BINANCE:ETHUSDT", d: "Ethereum" },
      { s: "BINANCE:SOLUSDT", d: "Solana" },
      { s: "BINANCE:BNBUSDT", d: "BNB" },
    ];
  }

  return symbols.map((symbol) => ({
    s: symbol,
    d: symbol,
  }));
}

export function MarketSummaryWidget({
  title = "Watchlist",
  symbols,
  minHeight = 520,
}: MarketSummaryWidgetProps) {
  return (
    <TradingViewScriptWidget
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
      config={{
        colorTheme: "dark",
        dateRange: "12M",
        showChart: true,
        locale: "en",
        largeChartUrl: "",
        isTransparent: false,
        showSymbolLogo: true,
        showFloatingTooltip: true,
        plotLineColorGrowing: "rgba(34, 197, 94, 1)",
        plotLineColorFalling: "rgba(239, 68, 68, 1)",
        gridLineColor: "rgba(42, 46, 57, 0)",
        scaleFontColor: "rgba(148, 163, 184, 1)",
        belowLineFillColorGrowing: "rgba(34, 197, 94, 0.12)",
        belowLineFillColorFalling: "rgba(239, 68, 68, 0.12)",
        belowLineFillColorGrowingBottom: "rgba(34, 197, 94, 0.03)",
        belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0.03)",
        symbolActiveColor: "rgba(6, 182, 212, 0.22)",
        tabs: [
          {
            title,
            symbols: toRows(symbols),
            originalTitle: title,
          },
        ],
        support_host: "https://www.tradingview.com",
      }}
      minHeight={minHeight}
    />
  );
}
