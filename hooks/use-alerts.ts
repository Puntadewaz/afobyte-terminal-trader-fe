"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/services/api/alerts";

export function useAlertsQuery() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 20_000,
  });
}
