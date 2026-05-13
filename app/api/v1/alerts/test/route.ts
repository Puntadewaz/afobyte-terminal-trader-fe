import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-envelope";
import { callPython } from "@/lib/python-internal";

interface AlertsTestResult {
  ok?: boolean;
  detail?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "VALIDATION_ERROR", "Request body must be valid JSON");
  }

  try {
    const data = await callPython<AlertsTestResult>("/alerts/test", body);
    return ok(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("CONFIG_ERROR")) {
      return fail(500, "CONFIG_ERROR", "Internal secret or python endpoint is not configured");
    }

    return fail(502, "UPSTREAM_ERROR", "Python alerts test request failed", [message]);
  }
}
