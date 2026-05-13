import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  try {
    const response = await proxyUpstream(upstream.base, "/api/v1/watchlist", {
      headers: {
        ...(userId ? { "x-user-id": userId } : {}),
      },
    });

    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      return fail(502, "UPSTREAM_ERROR", "Watchlist upstream request failed", [payload]);
    }

    return ok(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown watchlist error";
    return fail(502, "UPSTREAM_ERROR", "Watchlist upstream request failed", [message]);
  }
}
