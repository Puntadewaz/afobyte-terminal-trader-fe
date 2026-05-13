import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-envelope";

interface TradingViewSymbolSearchItem {
  symbol?: string;
  full_name?: string;
  exchange?: string;
  type?: string;
}

const EXCHANGE_PRIORITY = ["NASDAQ", "NYSE", "AMEX"] as const;

function normalizeTicker(symbol: string): string {
  return symbol.trim().toUpperCase().replace(/[^A-Z0-9.\-]/g, "");
}

function scoreCandidate(item: TradingViewSymbolSearchItem, wanted: string): number {
  const type = (item.type ?? "").toLowerCase();
  const exchange = (item.exchange ?? "").toUpperCase();
  const symbol = (item.symbol ?? "").toUpperCase();

  let score = 0;
  if (symbol === wanted) score += 100;
  if (type === "stock") score += 25;
  if (exchange === "NASDAQ") score += 8;
  if (exchange === "NYSE") score += 6;
  if (exchange === "AMEX") score += 4;
  return score;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("symbol") ?? "";
  const symbol = normalizeTicker(raw);

  if (!symbol) {
    return fail(400, "INVALID_SYMBOL", "symbol query param is required");
  }

  if (symbol.includes(":")) {
    return ok({ symbol, source: "provided" });
  }

  try {
    const candidates: TradingViewSymbolSearchItem[] = [];

    for (const exchange of EXCHANGE_PRIORITY) {
      const query = `https://symbol-search.tradingview.com/symbol_search/?text=${encodeURIComponent(symbol)}&hl=1&exchange=${encodeURIComponent(exchange)}&lang=en&type=stock&domain=production`;
      const response = await fetch(query, { cache: "no-store" });
      if (!response.ok) continue;

      const rows = (await response.json()) as TradingViewSymbolSearchItem[];
      if (!Array.isArray(rows)) continue;

      candidates.push(
        ...rows.filter((item) => {
          const rowSymbol = (item.symbol ?? "").toUpperCase();
          return rowSymbol === symbol;
        }),
      );
    }

    if (candidates.length === 0) {
      return ok({ symbol: `NASDAQ:${symbol}`, source: "fallback" });
    }

    const sorted = [...candidates].sort((a, b) => scoreCandidate(b, symbol) - scoreCandidate(a, symbol));
    const selected = sorted[0];
    const exchange = (selected.exchange ?? "NASDAQ").toUpperCase();
    return ok({ symbol: `${exchange}:${symbol}`, source: "resolved" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail(502, "UPSTREAM_ERROR", "Failed to resolve TradingView symbol", [message]);
  }
}
