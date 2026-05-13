import { NextResponse } from "next/server";

const journal = [
  {
    id: "j1",
    asset: "BTC",
    setup: "Swing pullback",
    outcome: "win",
    rr: 2.4,
    note: "Waited for confirmation above EMA20 and volume recovery.",
    mistake: "Reduced too early due to fear.",
  },
  {
    id: "j2",
    asset: "BBCA",
    setup: "Range breakout",
    outcome: "loss",
    rr: -1,
    note: "Breakout failed due to weak follow-through.",
    mistake: "Ignored low broader market participation.",
  },
];

export async function GET() {
  return NextResponse.json(journal);
}
