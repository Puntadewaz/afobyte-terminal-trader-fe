"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/services/api/dashboard";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    refetchInterval: 45_000,
  });
}
