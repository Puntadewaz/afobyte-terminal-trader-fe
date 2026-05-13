import { NextRequest } from "next/server";
import { fail, requireUserId } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const unauthorized = requireUserId(userId);
  if (unauthorized) return unauthorized;

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const response = await proxyUpstream(upstream.base, "/api/v1/journal", {
    headers: {
      "x-user-id": userId as string,
    },
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const unauthorized = requireUserId(userId);
  if (unauthorized) return unauthorized;

  let body: string;
  try {
    body = await request.text();
  } catch {
    return fail(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const response = await proxyUpstream(upstream.base, "/api/v1/journal", {
    method: "POST",
    headers: {
      "x-user-id": userId as string,
    },
    body,
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
