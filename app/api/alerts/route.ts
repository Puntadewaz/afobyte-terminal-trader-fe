import { NextResponse } from "next/server";
import { alerts } from "@/constants/mock-data";

export async function GET() {
  return NextResponse.json(alerts);
}
