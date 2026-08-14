import { NextRequest, NextResponse } from "next/server";
import { fetchEntryPicks, type EntryPicksErrorCode } from "@/lib/fpl/fetchEntryPicks";

const ERROR_RESPONSES: Record<EntryPicksErrorCode, { status: number; message: string }> = {
  team_not_found: { status: 404, message: "Couldn't find that Team ID." },
  no_picks_for_event: { status: 404, message: "No squad set for this gameweek yet." },
  upstream_error: { status: 502, message: "FPL is unavailable right now — try again shortly." },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId: teamIdParam } = await params;
  const teamId = Number(teamIdParam);
  const eventParam = request.nextUrl.searchParams.get("event");
  const event = eventParam ? Number(eventParam) : NaN;

  if (!Number.isInteger(teamId) || teamId <= 0) {
    return NextResponse.json({ error: "Invalid Team ID." }, { status: 400 });
  }
  if (!Number.isInteger(event) || event <= 0) {
    return NextResponse.json({ error: "Missing or invalid gameweek." }, { status: 400 });
  }

  try {
    const result = await fetchEntryPicks(teamId, event);
    if ("error" in result) {
      const { status, message } = ERROR_RESPONSES[result.error];
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "FPL is unavailable right now — try again shortly." },
      { status: 502 }
    );
  }
}
