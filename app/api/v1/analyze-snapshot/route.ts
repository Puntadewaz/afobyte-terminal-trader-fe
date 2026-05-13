import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-envelope";

const DEFAULT_ANALYZE_SNAPSHOT_URL = "http://127.0.0.1:8000/api/v1/analyze-snapshot";

function getAnalyzeSnapshotUrl() {
  return process.env.ANALYZE_SNAPSHOT_URL?.trim() || DEFAULT_ANALYZE_SNAPSHOT_URL;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  if (!body.image_base64 || typeof body.image_base64 !== "string") {
    return fail(400, "VALIDATION_ERROR", "image_base64 is required");
  }

  try {
    const response = await fetch(getAnalyzeSnapshotUrl(), {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      return fail(502, "UPSTREAM_ERROR", "Analyze snapshot request failed", [payload]);
    }

    return ok(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upstream error";
    return fail(502, "UPSTREAM_ERROR", "Analyze snapshot request failed", [message]);
  }
}
