"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPsychology } from "@/services/api/psychology";

export function usePsychologyQuery() {
  return useQuery({
    queryKey: ["psychology"],
    queryFn: fetchPsychology,
    refetchInterval: 60_000,
  });
}
