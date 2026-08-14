import { rawPicksResponseSchema, parseOrThrow } from "./schemas";

export type EntryPicksErrorCode = "team_not_found" | "no_picks_for_event" | "upstream_error";

export interface EntryPicksSuccess {
  playerIds: number[];
}

export interface EntryPicksFailure {
  error: EntryPicksErrorCode;
}

// Two-step lookup so we can tell "that Team ID doesn't exist" apart from
// "it exists but hasn't set a squad for this gameweek" — FPL's API
// returns an identical generic 404 for both from the picks endpoint alone.
export async function fetchEntryPicks(
  teamId: number,
  event: number
): Promise<EntryPicksSuccess | EntryPicksFailure> {
  // Cached rather than no-store: this is a user-triggered action, not a
  // page load, but with no documented FPL rate limit we still don't want
  // rapid re-clicks (or two users importing the same team) each hitting
  // FPL directly. Entry existence rarely changes, so it gets a long TTL;
  // picks can change up until deadline, so a short one.
  const entryRes = await fetch(`https://fantasy.premierleague.com/api/entry/${teamId}/`, {
    headers: { "User-Agent": "fpl-assistant" },
    next: { revalidate: 3600 },
  });
  if (entryRes.status === 404) return { error: "team_not_found" };
  if (!entryRes.ok) return { error: "upstream_error" };

  const picksRes = await fetch(
    `https://fantasy.premierleague.com/api/entry/${teamId}/event/${event}/picks/`,
    { headers: { "User-Agent": "fpl-assistant" }, next: { revalidate: 120 } }
  );
  if (picksRes.status === 404) return { error: "no_picks_for_event" };
  if (!picksRes.ok) return { error: "upstream_error" };

  try {
    const json = await picksRes.json();
    const data = parseOrThrow(rawPicksResponseSchema, json, "entry picks");
    return { playerIds: data.picks.map((p) => p.element) };
  } catch {
    return { error: "upstream_error" };
  }
}
