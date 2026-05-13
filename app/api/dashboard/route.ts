import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/constants/mock-data";

export async function GET() {
  return NextResponse.json(getDashboardSnapshot());
}
