"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface TradingViewScriptWidgetProps {
  scriptSrc: string;
  config: Record<string, unknown>;
  className?: string;
  minHeight?: number;
  loadTimeoutMs?: number;
}

export function TradingViewScriptWidget({
  scriptSrc,
  config,
  className,
  minHeight = 420,
  loadTimeoutMs = 7000,
}: TradingViewScriptWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const serializedConfig = useMemo(() => JSON.stringify(config), [config]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoaded(false);
    container.innerHTML = "";

    const widgetHost = document.createElement("div");
    widgetHost.className = "tradingview-widget-container__widget";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = scriptSrc;
    script.textContent = serializedConfig;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setIsLoaded(true);

    const timeoutId = window.setTimeout(() => {
      setIsLoaded(true);
    }, loadTimeoutMs);

    container.appendChild(widgetHost);
    container.appendChild(script);

    return () => {
      window.clearTimeout(timeoutId);
      container.innerHTML = "";
    };
  }, [loadTimeoutMs, scriptSrc, serializedConfig]);

  return (
    <div className={["tradingview-widget-container relative w-full", className ?? ""].join(" ")}>
      {!isLoaded ? (
        <div className="absolute inset-0 z-10 animate-pulse rounded-md border border-zinc-800 bg-zinc-900/60" />
      ) : null}
      <div ref={containerRef} className="w-full" style={{ minHeight }} />
    </div>
  );
}
