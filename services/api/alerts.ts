import { http } from "@/services/api/http";
import type { AlertItem } from "@/types/market";

interface AlertsTestResponse {
  ok: boolean;
  detail?: string;
}

export async function fetchAlerts(): Promise<AlertItem[]> {
  const payload = await http<AlertsTestResponse>(
    "/api/v1/alerts/test",
    {
      method: "POST",
      body: JSON.stringify({ chat_id: "0", message: "health-check" }),
    },
  );

  return [
    {
      id: "alerts-test",
      type: "signal",
      severity: payload.ok ? "low" : "high",
      title: "Alerts API connectivity",
      detail: payload.detail ?? (payload.ok ? "connected" : "unavailable"),
      createdAt: new Date().toISOString(),
      market: "crypto",
    },
  ];
}
