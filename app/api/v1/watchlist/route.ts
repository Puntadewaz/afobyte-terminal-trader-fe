import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-envelope";

const DEFAULT_WATCHLIST_URL = "http://127.0.0.1:8000/api/v1/watchlist";

function getWatchlistUrl() {
  return process.env.WATCHLIST_API_URL?.trim() || DEFAULT_WATCHLIST_URL;
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");

  try {
    const response = await fetch(getWatchlistUrl(), {
      cache: "no-store",
      headers: {
        "content-type": "application/json",
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
