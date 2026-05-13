import { NextRequest } from "next/server";
import { fail, requireUserId } from "@/lib/api-envelope";
import { proxyUpstream, requireUpstreamBase } from "@/lib/upstream-next";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const unauthorized = requireUserId(userId);
  if (unauthorized) return unauthorized;

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const response = await proxyUpstream(upstream.base, "/api/v1/portfolio", {
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

  const upstream = requireUpstreamBase();
  if ("error" in upstream) return upstream.error;

  const body = await request.text();
  const response = await proxyUpstream(upstream.base, "/api/v1/portfolio", {
    method: "POST",
    headers: {
      "x-user-id": userId as string,
    },
    body,
  });

  const raw = await response.text();
  if (!response.ok) {
    try {
      const parsed = JSON.parse(raw) as {
        error?: { details?: unknown[] };
      };
      const details = (parsed.error?.details ?? []).map((item) => String(item));
      const detailText = details.join(" ");

      if (detailText.includes("portfolio_holdings_user_id_fkey")) {
        return fail(
          400,
          "USER_NOT_REGISTERED",
          "x-user-id is not registered in backend users table. Update NEXT_PUBLIC_API_USER_ID to a valid user id.",
          details,
        );
      }
    } catch {
      // Keep upstream payload passthrough when response isn't JSON.
    }
  }

  return new Response(raw, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
