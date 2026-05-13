"use client";

import { TradingViewScriptWidget } from "@/components/widgets/tradingview/tradingview-script-widget";

interface TechnicalAnalysisWidgetProps {
  symbol: string;
  interval?: string;
  minHeight?: number;
}

export function TechnicalAnalysisWidget({
  symbol,
  interval = "15m",
  minHeight = 460,
}: TechnicalAnalysisWidgetProps) {
  return (
    <TradingViewScriptWidget
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
      config={{
        interval,
        width: "100%",
        isTransparent: false,
        height: minHeight,
        symbol,
        showIntervalTabs: true,
        displayMode: "single",
        locale: "en",
        colorTheme: "dark",
      }}
      minHeight={minHeight}
    />
  );
}
