import { describe, expect, it } from "vitest";
import { computeOptimalXI } from "./optimalXI";
import { generateRandomSquad } from "./randomSquad";
import { FORMATION_LIMITS } from "./constants";
import { makeFixtures, makePlayerPool, makeTeams } from "./testFixtures";

const teams = makeTeams();
const players = makePlayerPool(teams);
const playersById = new Map(players.map((p) => [p.id, p]));
const fixtures = makeFixtures(teams);

function randomSquadPlayers() {
  const ids = generateRandomSquad(players, 6)!;
  return ids.map((id) => playersById.get(id)!);
}

describe("computeOptimalXI", () => {
  it("splits 15 players into 11 starters + 4 bench, with every player accounted for exactly once", () => {
    for (let i = 0; i < 10; i++) {
      const squad = randomSquadPlayers();
      const result = computeOptimalXI(squad, teams, fixtures, 6);

      expect(result.starters).toHaveLength(11);
      expect(result.bench).toHaveLength(4);

      const allIds = [...result.starters, ...result.bench].map((s) => s.playerId);
      expect(new Set(allIds).size).toBe(15);
      expect(new Set(allIds)).toEqual(new Set(squad.map((p) => p.id)));
    }
  });

  it("always starts exactly 1 goalkeeper, and respects formation limits for the rest", () => {
    for (let i = 0; i < 10; i++) {
      const squad = randomSquadPlayers();
      const result = computeOptimalXI(squad, teams, fixtures, 6);

      const startersByType = new Map<number, number>();
      for (const s of result.starters) {
        startersByType.set(s.elementType, (startersByType.get(s.elementType) ?? 0) + 1);
      }

      expect(startersByType.get(1)).toBe(1); // GK
      const def = startersByType.get(2) ?? 0;
      const mid = startersByType.get(3) ?? 0;
      const fwd = startersByType.get(4) ?? 0;

      expect(def).toBeGreaterThanOrEqual(FORMATION_LIMITS.def.min);
      expect(def).toBeLessThanOrEqual(FORMATION_LIMITS.def.max);
      expect(mid).toBeGreaterThanOrEqual(FORMATION_LIMITS.mid.min);
      expect(mid).toBeLessThanOrEqual(FORMATION_LIMITS.mid.max);
      expect(fwd).toBeGreaterThanOrEqual(FORMATION_LIMITS.fwd.min);
      expect(fwd).toBeLessThanOrEqual(FORMATION_LIMITS.fwd.max);
      expect(def + mid + fwd).toBe(10);

      expect(result.formation).toBe(`${def}-${mid}-${fwd}`);
    }
  });

  it("bench is ordered 1-4 with no gaps", () => {
    const squad = randomSquadPlayers();
    const result = computeOptimalXI(squad, teams, fixtures, 6);
    const orders = result.bench.map((s) => s.benchOrder).sort((a, b) => (a ?? 0) - (b ?? 0));
    expect(orders).toEqual([1, 2, 3, 4]);
  });

  it("picks the higher-value starting XI over a strictly worse alternative formation", () => {
    // A squad where the highest-value 10 outfielders happen to need a
    // specific formation — if computeOptimalXI picked a lower-scoring
    // formation instead, this squad's chosen total would be sub-optimal.
    const squad = randomSquadPlayers();
    const result = computeOptimalXI(squad, teams, fixtures, 6);
    const chosenTotal = result.starters.reduce((sum, s) => sum + s.value, 0);

    // Recompute every legal formation's total independently and confirm
    // nothing beats what computeOptimalXI actually chose.
    const byType = (type: number) =>
      result.starters
        .concat(result.bench)
        .filter((s) => s.elementType === type)
        .sort((a, b) => b.value - a.value);
    const gks = byType(1);
    const defs = byType(2);
    const mids = byType(3);
    const fwds = byType(4);
    const sum = (arr: typeof defs, n: number) => arr.slice(0, n).reduce((t, s) => t + s.value, 0);

    let bestPossible = -Infinity;
    for (let def = FORMATION_LIMITS.def.min; def <= FORMATION_LIMITS.def.max; def++) {
      for (let fwd = FORMATION_LIMITS.fwd.min; fwd <= FORMATION_LIMITS.fwd.max; fwd++) {
        const mid = 10 - def - fwd;
        if (mid < FORMATION_LIMITS.mid.min || mid > FORMATION_LIMITS.mid.max) continue;
        if (def > defs.length || mid > mids.length || fwd > fwds.length) continue;
        bestPossible = Math.max(bestPossible, sum(defs, def) + sum(mids, mid) + sum(fwds, fwd));
      }
    }

    // Exactly 1 GK always starts (no combinatorial choice there), so it's
    // excluded from the formation search above — add it back in for an
    // apples-to-apples comparison against chosenTotal, which (correctly)
    // includes all 11 starters.
    expect(gks.length).toBeGreaterThan(0);
    expect(chosenTotal).toBe(bestPossible + gks[0].value);
  });
});
