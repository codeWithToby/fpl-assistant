import type { Fixture, Player, Team } from "./types";

// Deterministic synthetic data for tests — no network dependency (the real
// FPL API has proven unreliable to fetch from in sandboxed dev environments
// during this project's own development), and reproducible run to run.
// Generous pool sizes per position (well beyond the real ~600-player pool's
// per-position minimums) so budget/starter-reliability/price filters always
// have enough room to narrow without starving a slot.

const GK = 1;
const DEF = 2;
const MID = 3;
const FWD = 4;

export function makeTeams(count = 20): Team[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Test Town ${i + 1}`,
    shortName: `T${i + 1}`,
  }));
}

// One fixture per team for the given gameweek, teams paired sequentially
// (1v2, 3v4, ...) — enough for getNextFixtureForTeam to resolve for every
// team the player pool uses.
export function makeFixtures(teams: Team[], event = 1): Fixture[] {
  const fixtures: Fixture[] = [];
  for (let i = 0; i < teams.length; i += 2) {
    const home = teams[i];
    const away = teams[i + 1];
    if (!home || !away) continue;
    fixtures.push({
      id: fixtures.length + 1,
      event,
      kickoffTime: `2026-08-15T14:00:00Z`,
      started: false,
      finished: false,
      teamH: home.id,
      teamA: away.id,
      teamHDifficulty: 3,
      teamADifficulty: 3,
    });
  }
  return fixtures;
}

// A price/form/points floor per position that keeps a full 15-man squad
// comfortably affordable within the real £100m budget even before any
// filter narrows the pool — see randomSquad.test.ts's own budget-floor
// assertions for the exact numbers this relies on.
//
// Sized close to the real FPL pool (roughly 600 players across 20 clubs),
// not just "enough to fill 2/5/5/3" — a noticeably smaller synthetic pool
// was collision-prone enough (narrowed-pool exhaustion via the max-3-per-
// club cap) to trigger the graceful-degradation fallback far more often
// than real data ever would, which looked like test flakiness until
// traced back to the fixture, not the algorithm.
const POOL_SIZE_PER_POSITION: Record<number, number> = { [GK]: 60, [DEF]: 180, [MID]: 200, [FWD]: 100 };
const PRICE_BASE_TENTHS: Record<number, number> = { [GK]: 40, [DEF]: 40, [MID]: 45, [FWD]: 45 };
const PRICE_SPREAD_TENTHS: Record<number, number> = { [GK]: 40, [DEF]: 60, [MID]: 90, [FWD]: 110 };

export function makePlayerPool(teams: Team[]): Player[] {
  const players: Player[] = [];
  let id = 1;

  for (const type of [GK, DEF, MID, FWD]) {
    for (let i = 0; i < POOL_SIZE_PER_POSITION[type]; i++) {
      // Indexed by the position-local loop counter, not the globally
      // incrementing id — an id-based index would couple team assignment
      // across position blocks (GK's id range affecting DEF's team spread,
      // etc.), clustering some teams' players by position in a way real
      // FPL data never does, and artificially triggering the max-3-per-club
      // cap far more often than a realistic pool would.
      const team = teams[i % teams.length];
      // Pseudo-varied but deterministic — a large odd multiplier spreads
      // values across the range without any randomness.
      const nowCost = PRICE_BASE_TENTHS[type] + ((i * 7919) % PRICE_SPREAD_TENTHS[type]);
      const form = ((i * 37) % 90) / 10; // 0.0 - 8.9, same scale as FPL's own
      const minutes = 200 + ((i * 53) % 1900);
      // Loosely correlates with price+form so points-per-million (Value
      // Hunters) has a real, non-arbitrary signal to sort on, same as it
      // does with real FPL data.
      const totalPoints = Math.max(0, Math.round((nowCost / 10) * (form + 1) * 2));

      players.push({
        id: id++,
        webName: `${["GK", "DEF", "MID", "FWD"][type - 1]}Player${id}`,
        team: team.id,
        elementType: type,
        nowCost,
        minutes,
        form,
        selectedByPercent: 10,
        expectedGoalsPer90: type >= MID ? form / 20 : 0,
        expectedAssistsPer90: type >= MID ? form / 30 : 0,
        expectedGoalInvolvementsPer90: type >= MID ? form / 15 : form / 40,
        expectedGoalsConcededPer90: 1.2,
        status: "a",
        chanceOfPlayingNextRound: null,
        totalPoints,
      });
    }
  }

  return players;
}
