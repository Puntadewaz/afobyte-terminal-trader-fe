import { NextRequest, NextResponse } from "next/server";
import { generateCandles } from "@/constants/mock-data";

export async function GET(request: NextRequest) {
  const market = request.nextUrl.searchParams.get("market") ?? "crypto";
  const seedPrice = market === "crypto" ? 65_000 : market === "idx" ? 9_000 : 190;
  return NextResponse.json(generateCandles(90, seedPrice));
}
