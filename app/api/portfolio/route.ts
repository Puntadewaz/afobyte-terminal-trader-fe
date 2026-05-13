import { NextResponse } from "next/server";
import { holdings } from "@/constants/mock-data";

export async function GET() {
  return NextResponse.json(holdings);
}
