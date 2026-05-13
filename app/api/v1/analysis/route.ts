import { NextRequest } from "next/server";
import { fail } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

const modes = new Set(["long_term", "swing", "intraday"]);

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim();
  const mode = (request.nextUrl.searchParams.get("mode") ?? "swing").trim();

  if (!symbol) {
    return fail(400, "MISSING_SYMBOL", "symbol query parameter is required");
  }

  if (!modes.has(mode)) {
    return fail(400, "INVALID_MODE", "mode must be long_term, swing, or intraday");
  }

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const response = await proxyUpstream(
    upstream.base,
    `/api/v1/analysis?symbol=${encodeURIComponent(symbol)}&mode=${encodeURIComponent(mode)}`,
  );

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
