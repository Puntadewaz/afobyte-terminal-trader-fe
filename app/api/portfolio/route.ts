import { NextRequest } from "next/server";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

export async function GET(request: NextRequest) {
  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const userId = request.headers.get("x-user-id") ?? process.env.NEXT_PUBLIC_API_USER_ID?.trim();
  const response = await proxyUpstream(upstream.base, "/api/v1/portfolio", {
    headers: userId ? { "x-user-id": userId } : undefined,
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
