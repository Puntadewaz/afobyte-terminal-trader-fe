"use client";

import { useEffect, useId, useRef, useState } from "react";

const TV_SCRIPT_SRC = "https://s3.tradingview.com/tv.js";

type TradingViewWidgetFactory = (options: Record<string, unknown>) => void;

interface TradingViewWindow extends Window {
  TradingView?: {
    widget?: TradingViewWidgetFactory;
  };
  __tvWidgetScriptPromise__?: Promise<void>;
}

function ensureTradingViewScript(): Promise<void> {
  const tvWindow = window as TradingViewWindow;

  if (tvWindow.TradingView?.widget) {
    return Promise.resolve();
  }

  if (tvWindow.__tvWidgetScriptPromise__) {
    return tvWindow.__tvWidgetScriptPromise__;
  }

  tvWindow.__tvWidgetScriptPromise__ = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src=\"${TV_SCRIPT_SRC}\"]`) as
      | HTMLScriptElement
      | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load TradingView script")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = TV_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load TradingView script"));
    document.head.appendChild(script);
  });

  return tvWindow.__tvWidgetScriptPromise__;
}

function toTradingViewSymbol(symbol: string): string {
  const upper = symbol.trim().toUpperCase();

  if (upper.includes(":")) {
    return upper;
  }

  if (upper.endsWith("USDT") || upper.endsWith("USD") || upper.endsWith("USDC")) {
    return `BINANCE:${upper}`;
  }

  return `BINANCE:${upper}USDT`;
}

export function TradingViewWidget({ symbol }: { symbol: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const containerId = `tradingview-chart-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    let cancelled = false;

    async function renderWidget() {
      setError(null);

      try {
        await ensureTradingViewScript();

        if (cancelled || !hostRef.current) return;

        hostRef.current.innerHTML = `<div id="${containerId}" class="h-[420px] w-full"></div>`;

        const tvWindow = window as TradingViewWindow;
        const widget = tvWindow.TradingView?.widget;

        if (!widget) {
          throw new Error("TradingView widget factory is not available");
        }

        widget({
          autosize: true,
          symbol: toTradingViewSymbol(symbol),
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          hide_side_toolbar: false,
          allow_symbol_change: false,
          container_id: containerId,
          withdateranges: true,
          details: true,
        });
      } catch (widgetError) {
        if (cancelled) return;
        const message =
          widgetError instanceof Error ? widgetError.message : "Failed to render TradingView chart";
        setError(message);
      }
    }

    renderWidget();

    return () => {
      cancelled = true;
    };
  }, [containerId, symbol]);

  return (
    <div className="w-full">
      {error ? <p className="mb-2 text-xs text-red-400">{error}</p> : null}
      <div ref={hostRef} className="h-[420px] w-full" />
    </div>
  );
}
