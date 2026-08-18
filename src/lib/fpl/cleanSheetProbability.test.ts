import { describe, expect, it } from "vitest";
import { computeCleanSheetProbability } from "./cleanSheetProbability";
import { CLEAN_SHEET_LEAGUE_AVERAGE_XGC, CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE } from "./constants";
import type { Fixture, Player, Team } from "./types";

const teams: Team[] = [
  { id: 1, name: "Home Town", shortName: "HOM" },
  { id: 2, name: "Away Town", shortName: "AWY" },
];

function basePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    webName: "Test Defender",
    team: 1,
    elementType: 2,
    nowCost: 55,
    minutes: 540,
    form: 4.0,
    selectedByPercent: 15,
    expectedGoalsPer90: 0.02,
    expectedAssistsPer90: 0.05,
    expectedGoalInvolvementsPer90: 0.07,
    expectedGoalsConcededPer90: 1.0,
    status: "a",
    chanceOfPlayingNextRound: null,
    totalPoints: 60,
    ...overrides,
  };
}

function fixtureWithDifficulty(difficulty: number): Fixture[] {
  return [
    {
      id: 1,
      event: 1,
      kickoffTime: "2026-08-15T14:00:00Z",
      started: false,
      finished: false,
      teamH: 1,
      teamA: 2,
      teamHDifficulty: difficulty,
      teamADifficulty: 6 - difficulty,
    },
  ];
}

describe("computeCleanSheetProbability", () => {
  it("returns 0 and no fixture when the team has none scheduled", () => {
    const result = computeCleanSheetProbability(basePlayer(), teams, []);
    expect(result.hasFixtureThisGameweek).toBe(false);
    expect(result.probability).toBe(0);
    expect(result.fixture).toBeNull();
  });

  it("gives a harder fixture a lower clean sheet probability than an easier one, all else equal", () => {
    const easy = computeCleanSheetProbability(basePlayer(), teams, fixtureWithDifficulty(1));
    const hard = computeCleanSheetProbability(basePlayer(), teams, fixtureWithDifficulty(5));
    expect(easy.probability).toBeGreaterThan(hard.probability);
  });

  it("uses the player's own expectedGoalsConcededPer90 once they clear the minutes bar", () => {
    const reliable = computeCleanSheetProbability(
      basePlayer({ minutes: CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE }),
      teams,
      fixtureWithDifficulty(3)
    );
    expect(reliable.usedFallbackRate).toBe(false);
  });

  it("falls back to the league-average rate for a small minutes sample instead of trusting it", () => {
    const freshSigning = computeCleanSheetProbability(
      basePlayer({ minutes: CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE - 1, expectedGoalsConcededPer90: 0.01 }),
      teams,
      fixtureWithDifficulty(3)
    );
    expect(freshSigning.usedFallbackRate).toBe(true);

    // Confirms the league-average rate, not the player's own (misleadingly
    // low, from too small a sample) rate, actually drove the number —
    // comparing against a player who legitimately has that same low own
    // rate but a large enough sample to be trusted.
    const provenLowConceder = computeCleanSheetProbability(
      basePlayer({ minutes: CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE, expectedGoalsConcededPer90: 0.01 }),
      teams,
      fixtureWithDifficulty(3)
    );
    expect(freshSigning.probability).toBeLessThan(provenLowConceder.probability);
    expect(CLEAN_SHEET_LEAGUE_AVERAGE_XGC).toBeGreaterThan(0.01);
  });
});
