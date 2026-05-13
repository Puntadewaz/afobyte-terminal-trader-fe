import { NextRequest, NextResponse } from "next/server";
import { getAnalysisByMarket } from "@/constants/mock-data";
import type { MarketKind } from "@/types/market";

export async function GET(request: NextRequest) {
  const market = (request.nextUrl.searchParams.get("market") ?? "crypto") as MarketKind;
  return NextResponse.json(getAnalysisByMarket(market));
}
