import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-envelope";

interface BinanceKlineRow extends Array<number | string> {
  0: number;
  1: string;
  2: string;
  3: string;
  4: string;
}

function normalizeSymbol(raw: string): string {
  const symbol = raw.trim().toUpperCase();
  if (!symbol) return "BTCUSDT";
  if (symbol.endsWith("USDT") || symbol.endsWith("USDC") || symbol.endsWith("USD")) {
    return symbol;
  }
  return `${symbol}USDT`;
}

function getCandleUpstreams(): string[] {
  const configured = process.env.CANDLES_UPSTREAM_BASES?.trim();
  if (configured) {
    return configured
      .split(",")
      .map((item) => item.trim().replace(/\/$/, ""))
      .filter(Boolean);
  }

  return [
    "https://data-api.binance.vision",
    "https://api.binance.com",
  ];
}

export async function GET(request: NextRequest) {
  const symbol = normalizeSymbol(request.nextUrl.searchParams.get("symbol") ?? "BTCUSDT");
  const interval = request.nextUrl.searchParams.get("interval") ?? "15m";
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "300");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 20), 1000) : 300;
  const upstreams = getCandleUpstreams();

  const path = `/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${encodeURIComponent(String(limit))}`;
  const errors: string[] = [];

  for (const base of upstreams) {
    try {
      const upstream = await fetch(`${base}${path}`, {
        cache: "no-store",
        headers: {
          "user-agent": "afobyte-terminal-trader-fe/1.0",
          accept: "application/json",
        },
      });

      const rows = (await upstream.json()) as BinanceKlineRow[] | { msg?: string };

      if (!upstream.ok || !Array.isArray(rows)) {
        errors.push(`${base}: HTTP ${upstream.status}`);
        continue;
      }

      const candles = rows.map((row) => ({
        time: new Date(row[0]).toISOString(),
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
      }));

      return ok(candles, { symbol, interval, limit, source: base });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upstream error";
      errors.push(`${base}: ${message}`);
    }
  }

  return fail(502, "UPSTREAM_ERROR", "Failed to fetch realtime candles", errors);
}
