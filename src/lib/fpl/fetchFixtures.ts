import type { FixturesData } from "./types";

const FIXTURES_URL = "https://fantasy.premierleague.com/api/fixtures/";

interface RawFixture {
  id: number;
  event: number | null;
  kickoff_time: string | null;
  started: boolean;
  finished: boolean;
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
}

export async function fetchFixtures(): Promise<FixturesData> {
  const res = await fetch(FIXTURES_URL, {
    headers: { "User-Agent": "fpl-assistant" },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`FPL fixtures request failed: ${res.status}`);
  }

  const raw: RawFixture[] = await res.json();

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
