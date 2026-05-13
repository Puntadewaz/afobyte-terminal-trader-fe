import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cashflow: [
      { month: "Jan", net: 2100 },
      { month: "Feb", net: -340 },
      { month: "Mar", net: 1240 },
      { month: "Apr", net: 1940 },
    ],
    netWorth: 182420,
    monthlyPerformance: 4.92,
    fees: 381,
  });
}
