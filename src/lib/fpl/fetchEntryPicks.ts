export type EntryPicksErrorCode = "team_not_found" | "no_picks_for_event" | "upstream_error";

export interface EntryPicksSuccess {
  playerIds: number[];
}

export interface EntryPicksFailure {
  error: EntryPicksErrorCode;
}

interface RawPicksResponse {
  picks: { element: number }[];
}

// Two-step lookup so we can tell "that Team ID doesn't exist" apart from
// "it exists but hasn't set a squad for this gameweek" — FPL's API
// returns an identical generic 404 for both from the picks endpoint alone.
export async function fetchEntryPicks(
  teamId: number,
  event: number
): Promise<EntryPicksSuccess | EntryPicksFailure> {
  const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/`, {
    headers: { "User-Agent": "fpl-assistant" },
    cache: "no-store",
  });
  if (entryRes.status === 404) return { error: "team_not_found" };
  if (!entryRes.ok) return { error: "upstream_error" };

  const picksRes = await fetch(
    `https://fantasy.premierleague.com/api/entry/${teamId}/event/${event}/picks/`,
    { headers: { "User-Agent": "fpl-assistant" }, cache: "no-store" }
  );
  if (picksRes.status === 404) return { error: "no_picks_for_event" };
  if (!picksRes.ok) return { error: "upstream_error" };

  const data: RawPicksResponse = await picksRes.json();
  return { playerIds: data.picks.map((p) => p.element) };
}
