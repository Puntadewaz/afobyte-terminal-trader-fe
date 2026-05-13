"use client";

import { TradingViewScriptWidget } from "@/components/widgets/tradingview/tradingview-script-widget";

type ChartTheme = "dark" | "light";

interface AdvancedChartWidgetProps {
  symbol: string;
  interval: string;
  theme?: ChartTheme;
  minHeight?: number;
}

export function AdvancedChartWidget({
  symbol,
  interval,
  theme = "dark",
  minHeight = 560,
}: AdvancedChartWidgetProps) {
  return (
    <TradingViewScriptWidget
      scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
      config={{
        autosize: true,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme,
        style: "1",
        locale: "en",
        hide_top_toolbar: false,
        hide_legend: false,
        allow_symbol_change: false,
        save_image: false,
        calendar: false,
        support_host: "https://www.tradingview.com",
      }}
      minHeight={minHeight}
    />
  );
}
