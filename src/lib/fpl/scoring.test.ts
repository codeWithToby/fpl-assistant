import { describe, expect, it } from "vitest";
import { computeCaptainScore, resolveNailedOn } from "./scoring";
import type { Fixture, Player, Team } from "./types";

const teams: Team[] = [
  { id: 1, name: "Home Town", shortName: "HOM" },
  { id: 2, name: "Away Town", shortName: "AWY" },
];

function basePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    webName: "Test Player",
    team: 1,
    elementType: 4,
    nowCost: 80,
    minutes: 540, // 6 full gameweeks
    form: 6.0,
    selectedByPercent: 10,
    expectedGoalsPer90: 0.5,
    expectedAssistsPer90: 0.2,
    expectedGoalInvolvementsPer90: 0.7,
    expectedGoalsConcededPer90: 1,
    status: "a",
    chanceOfPlayingNextRound: null,
    totalPoints: 80,
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

describe("computeCaptainScore — availability", () => {
  it("zeroes the score for an unavailable status regardless of underlying quality", () => {
    const player = basePlayer({ status: "i" }); // injured
    const result = computeCaptainScore(player, teams, fixtureWithDifficulty(1), 6);
    expect(result.totalScore).toBe(0);
    expect(result.availability.multiplier).toBe(0);
  });

  it("halves the score for a 50-74% chance of playing", () => {
    const fit = computeCaptainScore(basePlayer(), teams, fixtureWithDifficulty(3), 6);
    const doubt = computeCaptainScore(
      basePlayer({ chanceOfPlayingNextRound: 60 }),
      teams,
      fixtureWithDifficulty(3),
      6
    );
    expect(doubt.availability.multiplier).toBe(0.5);
    expect(doubt.totalScore).toBe(Math.round(fit.totalScore * 0.5));
  });

  it("keeps full score at 100% and null (unknown/no doubt) chance of playing", () => {
    const full = computeCaptainScore(basePlayer({ chanceOfPlayingNextRound: 100 }), teams, fixtureWithDifficulty(3), 6);
    const unknown = computeCaptainScore(basePlayer({ chanceOfPlayingNextRound: null }), teams, fixtureWithDifficulty(3), 6);
    expect(full.availability.multiplier).toBe(1);
    expect(unknown.availability.multiplier).toBe(1);
  });
});

describe("computeCaptainScore — fixtures", () => {
  it("flags hasFixtureThisGameweek false and scores the fixture component 0 with no fixture", () => {
    const result = computeCaptainScore(basePlayer(), teams, [], 6);
    expect(result.hasFixtureThisGameweek).toBe(false);
    expect(result.components.fixture).toBeNull();
  });

  it("scores an easier fixture higher than a harder one, all else equal", () => {
    const easy = computeCaptainScore(basePlayer(), teams, fixtureWithDifficulty(1), 6);
    const hard = computeCaptainScore(basePlayer(), teams, fixtureWithDifficulty(5), 6);
    expect(easy.components.fixture!.score).toBeGreaterThan(hard.components.fixture!.score);
    expect(easy.totalScore).toBeGreaterThan(hard.totalScore);
  });
});

describe("computeCaptainScore — Triple Captain candidacy", () => {
  it("flags a player who clears every threshold at once", () => {
    const player = basePlayer({
      expectedGoalInvolvementsPer90: 0.9,
      form: 6.0,
      minutes: 540,
      chanceOfPlayingNextRound: 100,
    });
    const result = computeCaptainScore(player, teams, fixtureWithDifficulty(1), 6);
    expect(result.isTripleCaptainCandidate).toBe(true);
  });

  it("does not flag Triple Captain when only the fixture is tough, everything else equal", () => {
    const player = basePlayer({
      expectedGoalInvolvementsPer90: 0.9,
      form: 6.0,
      minutes: 540,
      chanceOfPlayingNextRound: 100,
    });
    const result = computeCaptainScore(player, teams, fixtureWithDifficulty(4), 6);
    expect(result.isTripleCaptainCandidate).toBe(false);
  });

  it("does not flag Triple Captain for a fitness doubt even if every other signal clears", () => {
    const player = basePlayer({
      expectedGoalInvolvementsPer90: 0.9,
      form: 6.0,
      minutes: 540,
      chanceOfPlayingNextRound: 60,
    });
    const result = computeCaptainScore(player, teams, fixtureWithDifficulty(1), 6);
    expect(result.isTripleCaptainCandidate).toBe(false);
  });
});

describe("resolveNailedOn", () => {
  it("treats everyone as nailed on before the season has started", () => {
    expect(resolveNailedOn(basePlayer({ minutes: 0 }), 0)).toBe(true);
  });

  it("uses the minutes ratio once the season is underway", () => {
    // 6 gameweeks * 90 = 540 minutes possible; 0.6 ratio = 324 minute bar.
    expect(resolveNailedOn(basePlayer({ minutes: 400 }), 6)).toBe(true);
    expect(resolveNailedOn(basePlayer({ minutes: 200 }), 6)).toBe(false);
  });

  it("prefers recentMinutesRatio over season minutes when it's set", () => {
    // Season minutes alone would pass (400/540), but a low recent ratio
    // (just lost their starting place) should override that.
    const player = basePlayer({ minutes: 400, recentMinutesRatio: 0.1 });
    expect(resolveNailedOn(player, 6)).toBe(false);
  });
});
