import type { FixturesData } from "./types";
import { withFallback } from "./fetchWithFallback";
import { rawFixturesSchema, parseOrThrow } from "./schemas";

const FIXTURES_URL = "https://fantasy.premierleague.com/api/fixtures/";

async function fetchFixturesRaw(): Promise<FixturesData> {
  const res = await fetch(FIXTURES_URL, {
    headers: { "User-Agent": "fpl-assistant" },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`FPL fixtures request failed: ${res.status}`);
  }

  const json = await res.json();
  const raw = parseOrThrow(rawFixturesSchema, json, "fixtures");

  return {
    fixtures: raw.map((f) => ({
      id: f.id,
      event: f.event,
      kickoffTime: f.kickoff_time,
      started: f.started,
      finished: f.finished,
      teamH: f.team_h,
      teamA: f.team_a,
      teamHDifficulty: f.team_h_difficulty,
      teamADifficulty: f.team_a_difficulty,
    })),
  };
}

// Serves last-known-good fixtures if the live fetch fails. See
// fetchWithFallback.ts for the "why".
export const fetchFixtures = withFallback(fetchFixturesRaw);
