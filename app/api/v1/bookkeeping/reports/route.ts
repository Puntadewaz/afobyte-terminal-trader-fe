import { NextRequest } from "next/server";
import { fail, requireUserId } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const unauthorized = requireUserId(userId);
  if (unauthorized) return unauthorized;

  const period = request.nextUrl.searchParams.get("period") ?? "monthly";

  if (period !== "monthly") {
    return fail(400, "INVALID_PERIOD", "period must be monthly");
  }

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const response = await proxyUpstream(
    upstream.base,
    `/api/v1/bookkeeping/reports?period=${encodeURIComponent(period)}`,
    {
      headers: {
        "x-user-id": userId as string,
      },
    },
  );

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
