import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-envelope";
import { callPython } from "@/lib/python-internal";

interface CapitalSimResult {
  required_growth_pct: number;
  required_monthly_growth_pct: number;
  estimated_required_trades: number;
  estimated_fee_impact: number;
  diversification_suggestion: string;
  feasibility_warning: string[];
  realistic_expectation: string;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  try {
    const data = await callPython<CapitalSimResult>("/capital/simulate", body);
    return ok(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("CONFIG_ERROR")) {
      return fail(500, "CONFIG_ERROR", "Internal secret or python endpoint is not configured");
    }

    return fail(502, "UPSTREAM_ERROR", "Python capital simulation request failed", [message]);
  }
}
