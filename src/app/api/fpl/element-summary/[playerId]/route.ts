import { NextResponse } from "next/server";
import { fetchElementSummary } from "@/lib/fpl/fetchElementSummary";
import { computeRecentForm } from "@/lib/fpl/recentForm";

// Returns just the derived recent-form stats, not the raw history payload
// — keeps this a small response and keeps the raw-shape parsing server-side.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  const { playerId: playerIdParam } = await params;
  const playerId = Number(playerIdParam);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return NextResponse.json({ error: "Invalid player ID." }, { status: 400 });
  }

  try {
    const summary = await fetchElementSummary(playerId);
    const recent = computeRecentForm(summary.history);
    return NextResponse.json(recent);
  } catch {
    return NextResponse.json({ error: "FPL is unavailable right now." }, { status: 502 });
  }
}
