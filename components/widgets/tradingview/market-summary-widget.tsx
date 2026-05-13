"use client";

import { TradingViewScriptWidget } from "@/components/widgets/tradingview/tradingview-script-widget";

interface MarketSummaryWidgetProps {
  title?: string;
  symbols?: string[];
  tabs?: Array<{ title: string; symbols: string[] }>;
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
  tabs,
  minHeight = 760,
}: MarketSummaryWidgetProps) {
  const resolvedTabs =
    tabs && tabs.length > 0
      ? tabs.map((tab) => ({
          title: tab.title,
          symbols: toRows(tab.symbols),
          originalTitle: tab.title,
        }))
      : [
          {
            title,
            symbols: toRows(symbols),
            originalTitle: title,
          },
        ];

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
        showFloatingTooltip: false,
        backgroundColor: "#0f0f0f",
        plotLineColorGrowing: "rgba(41, 98, 255, 1)",
        plotLineColorFalling: "rgba(41, 98, 255, 1)",
        gridLineColor: "rgba(240, 243, 250, 0)",
        scaleFontColor: "#DBDBDB",
        belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
        belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
        belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
        belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
        symbolActiveColor: "rgba(41, 98, 255, 0.12)",
        width: "100%",
        height: minHeight,
        tabs: resolvedTabs,
        support_host: "https://www.tradingview.com",
      }}
      minHeight={minHeight}
    />
  );
}
