import { http } from "@/services/api/http";

export type DisciplineBand = "low" | "medium" | "high";

export interface PsychologyPayload {
  discipline_score: number;
  discipline_band: DisciplineBand;
  overtrading_score: number;
  emotional_risk_score: number;
  concentration_risk_score: number;
  unrealistic_target_score: number;
  warnings: string[];
  as_of: string;
}

export async function fetchPsychology(): Promise<PsychologyPayload> {
  return http<PsychologyPayload>("/api/v1/psychology", undefined, {
    withUserId: true,
  });
}
