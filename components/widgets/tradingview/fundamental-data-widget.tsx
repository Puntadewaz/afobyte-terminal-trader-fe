"use client";

import { TradingViewScriptWidget } from "@/components/widgets/tradingview/tradingview-script-widget";

interface FundamentalDataWidgetProps {
  symbol: string;
  minHeight?: number;
}

export function FundamentalDataWidget({
  symbol,
  minHeight = 460,
}: FundamentalDataWidgetProps) {
  return (
    <TradingViewScriptWidget
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
      config={{
        symbol,
        width: "100%",
        locale: "en",
        colorTheme: "dark",
        isTransparent: false,
      }}
      minHeight={minHeight}
    />
  );
}
