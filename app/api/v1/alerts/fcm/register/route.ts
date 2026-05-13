import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-envelope";
import { callPython } from "@/lib/python-internal";

interface RegisterFcmResponse {
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

  if (!body.token || typeof body.token !== "string") {
    return fail(400, "VALIDATION_ERROR", "token is required");
  }

  try {
    const data = await callPython<RegisterFcmResponse>("/alerts/fcm/register", body);
    return ok(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("CONFIG_ERROR")) {
      return fail(500, "CONFIG_ERROR", "Internal secret or python endpoint is not configured");
    }

    return fail(502, "UPSTREAM_ERROR", "Python FCM register request failed", [message]);
  }
}
