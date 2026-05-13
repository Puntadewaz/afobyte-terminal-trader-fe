import { NextRequest } from "next/server";
import { fail } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

const allowedTypes = new Set(["long_term", "swing", "intraday"]);

export async function GET(request: NextRequest) {
  const type = (request.nextUrl.searchParams.get("type") ?? "swing").trim();
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");

  if (!allowedTypes.has(type)) {
    return fail(400, "INVALID_TYPE", "type must be long_term, swing, or intraday");
  }

  if (!Number.isFinite(limit) || limit < 1 || limit > 50) {
    return fail(400, "INVALID_LIMIT", "limit must be a number between 1 and 50");
  }

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const response = await proxyUpstream(
    upstream.base,
    `/api/v1/rankings?type=${encodeURIComponent(type)}&limit=${encodeURIComponent(String(limit))}`,
  );

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
