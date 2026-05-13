"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPortfolio } from "@/services/api/portfolio";

export function usePortfolioQuery() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: fetchPortfolio,
    refetchInterval: 30_000,
  });
}
