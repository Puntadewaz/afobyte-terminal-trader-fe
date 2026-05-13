import { NextResponse } from "next/server";
import { rankings } from "@/constants/mock-data";

export async function GET() {
  return NextResponse.json(rankings);
}
