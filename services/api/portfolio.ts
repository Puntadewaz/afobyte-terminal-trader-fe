import { http } from "@/services/api/http";
import type { PortfolioHolding } from "@/types/market";
import { mapPortfolio } from "@/services/api/mappers";

interface PortfolioApiRow {
  symbol: string;
  market: string;
  quantity: string;
  avg_cost: string;
  last_price: string;
}

export async function fetchPortfolio(): Promise<PortfolioHolding[]> {
  const rows = await http<PortfolioApiRow[]>("/api/v1/portfolio", undefined, { withUserId: true });
  return mapPortfolio(rows);
}
