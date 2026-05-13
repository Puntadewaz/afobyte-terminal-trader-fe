import type { DashboardSnapshot } from "@/types/market";
import { fetchPortfolio } from "@/services/api/portfolio";
import { fetchRankings } from "@/services/api/rankings";
import { toDashboardSnapshot } from "@/services/api/mappers";

export async function fetchDashboard(): Promise<DashboardSnapshot> {
  const [rankings, holdings] = await Promise.all([fetchRankings(), fetchPortfolio()]);
  return toDashboardSnapshot(rankings, holdings);
}
