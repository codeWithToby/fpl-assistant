import { describe, expect, it } from "vitest";
import { selectTeamOfTheWeek } from "./teamOfTheWeek";
import { makeFixtures, makePlayerPool, makeTeams } from "./testFixtures";

const teams = makeTeams();
const fixtures = makeFixtures(teams);
const FINISHED_GAMEWEEKS = 6;

function allPickedIds(result: NonNullable<ReturnType<typeof selectTeamOfTheWeek>>): number[] {
  return [...result.optimalXI.starters, ...result.optimalXI.bench].map((s) => s.playerId);
}

// Team of the Week is presented as a one-shot, confident recommendation —
// unlike a user's own squad (which they already own and can weigh risk on
// themselves), a doubtful or rotation-risk pick here has no one to show
// the caveat to. These tests lock in that it actually excludes such
// players, not just discounts them — making a target player look like the
// obvious value pick (elite stats, still gets left out) is what actually
// proves the hard filter is working, not just a discount that could still
// lose to a big enough quality gap.
describe("selectTeamOfTheWeek — guaranteed starters only", () => {
  it("excludes a player with a listed fitness doubt, even an obviously elite one", () => {
    const players = makePlayerPool(teams);
    const target = players.find((p) => p.elementType === 3)!; // MID
    target.status = "d";
    target.chanceOfPlayingNextRound = 75; // the exact real-world case that started this
    target.totalPoints = 999;
    target.form = 9.9;

    const result = selectTeamOfTheWeek(players, teams, fixtures, FINISHED_GAMEWEEKS);
    expect(result).not.toBeNull();
    expect(allPickedIds(result!)).not.toContain(target.id);
  });

  it("excludes a player who isn't nailed-on by recent minutes, even an obviously elite one", () => {
    const players = makePlayerPool(teams);
    const target = players.find((p) => p.elementType === 4)!; // FWD
    target.minutes = 10; // barely played this season
    target.totalPoints = 999;
    target.form = 9.9;

    const result = selectTeamOfTheWeek(players, teams, fixtures, FINISHED_GAMEWEEKS);
    expect(result).not.toBeNull();
    expect(allPickedIds(result!)).not.toContain(target.id);
  });

  it("still fills every slot when a position's guaranteed pool shrinks to the bare minimum", () => {
    const players = makePlayerPool(teams);
    const gks = players.filter((p) => p.elementType === 1);
    gks.slice(2).forEach((p) => {
      p.status = "d";
      p.chanceOfPlayingNextRound = 50;
    });

    const result = selectTeamOfTheWeek(players, teams, fixtures, FINISHED_GAMEWEEKS);
    expect(result).not.toBeNull();
    expect(allPickedIds(result!)).toHaveLength(15);
  });

  it("falls back to the full pool for a position with zero guaranteed starters, rather than failing", () => {
    const players = makePlayerPool(teams);
    const gks = players.filter((p) => p.elementType === 1);
    gks.forEach((p) => {
      p.status = "d";
      p.chanceOfPlayingNextRound = 50;
    });

    const result = selectTeamOfTheWeek(players, teams, fixtures, FINISHED_GAMEWEEKS);
    expect(result, "should gracefully fall back, not return null").not.toBeNull();
    expect(allPickedIds(result!)).toHaveLength(15);
  });
});
