import { NextRequest } from "next/server";
import { ok } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

const fallbackPayload = {
  discipline_score: 72,
  discipline_band: "medium",
  overtrading_score: 24,
  emotional_risk_score: 10,
  concentration_risk_score: 35,
  unrealistic_target_score: 8,
  warnings: [
    "Portfolio concentration risk detected.",
  ],
  as_of: "2026-05-12T12:00:00+00:00",
};

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const upstream = requireUpstreamBase();

  if ("error" in upstream) {
    return ok(fallbackPayload, { source: "fallback-no-upstream" });
  }

  try {
    const response = await proxyUpstream(upstream.base, "/api/v1/psychology", {
      headers: {
        ...(userId ? { "x-user-id": userId } : {}),
      },
    });

    if (!response.ok) {
      return ok(fallbackPayload, { source: "fallback-upstream-unavailable" });
    }

    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return ok(fallbackPayload, { source: "fallback-upstream-error" });
  }
}
