import { describe, expect, it } from "vitest";
import { generateRandomSquad } from "./randomSquad";
import { resolveNailedOn } from "./scoring";
import { MAX_PLAYERS_PER_TEAM, SQUAD_BUDGET, SQUAD_POSITION_NEEDS } from "./constants";
import type { BudgetStyle, FormBias, Player, SquadFilters, StarterReliability, TeamFocus } from "./types";
import { makePlayerPool, makeTeams } from "./testFixtures";

const teams = makeTeams();
const players = makePlayerPool(teams);
const playersById = new Map(players.map((p) => [p.id, p]));

// Mid-season, not pre-season — resolveNailedOn treats everyone as nailed
// on at finishedGameweekCount 0, which would make Starter Reliability a
// trivial no-op and defeat the point of testing it.
const FINISHED_GAMEWEEKS = 6;

const BUDGET_STYLES: BudgetStyle[] = ["balanced", "starsAndScrubs", "valueHunters"];
const STARTER_RELIABILITIES: StarterReliability[] = ["nailedOnOnly", "mixRisk"];
const FORM_BIASES: FormBias[] = ["inForm", "ignoreForm"];
const TEAM_FOCUSES: TeamFocus[] = ["balanced", "attackHeavy", "defenseHeavy"];

function allFilterCombinations(): SquadFilters[] {
  const combos: SquadFilters[] = [];
  for (const budgetStyle of BUDGET_STYLES) {
    for (const starterReliability of STARTER_RELIABILITIES) {
      for (const formBias of FORM_BIASES) {
        for (const teamFocus of TEAM_FOCUSES) {
          combos.push({ budgetStyle, starterReliability, formBias, teamFocus });
        }
      }
    }
  }
  return combos;
}

function squadFor(ids: number[]): Player[] {
  return ids.map((id) => {
    const player = playersById.get(id);
    if (!player) throw new Error(`generated squad referenced unknown player id ${id}`);
    return player;
  });
}

// The hard constraints that must hold no matter what the 4 filters are set
// to — the actual promise this whole feature makes. Every combination
// below is checked against this, not just a hand-picked few.
function expectValidSquad(ids: number[] | null) {
  expect(ids, "generateRandomSquad returned null — squad generation failed").not.toBeNull();
  const squad = squadFor(ids!);

  expect(ids).toHaveLength(15);
  expect(new Set(ids).size, "squad contains a duplicate player").toBe(15);

  const totalCost = squad.reduce((sum, p) => sum + p.nowCost, 0);
  expect(totalCost, "squad exceeds the £100m budget").toBeLessThanOrEqual(SQUAD_BUDGET);

  const positionCounts = new Map<number, number>();
  const teamCounts = new Map<number, number>();
  for (const p of squad) {
    positionCounts.set(p.elementType, (positionCounts.get(p.elementType) ?? 0) + 1);
    teamCounts.set(p.team, (teamCounts.get(p.team) ?? 0) + 1);
  }

  for (const [type, need] of Object.entries(SQUAD_POSITION_NEEDS)) {
    expect(
      positionCounts.get(Number(type)) ?? 0,
      `wrong count for position ${type}`
    ).toBe(need);
  }

  for (const [teamId, count] of teamCounts) {
    expect(count, `more than ${MAX_PLAYERS_PER_TEAM} players from team ${teamId}`).toBeLessThanOrEqual(
      MAX_PLAYERS_PER_TEAM
    );
  }
}

describe("generateRandomSquad — hard constraints", () => {
  it("produces a valid squad with the default filters (today's exact behavior)", () => {
    for (let i = 0; i < 10; i++) {
      expectValidSquad(generateRandomSquad(players, FINISHED_GAMEWEEKS));
    }
  });

  it.each(allFilterCombinations())(
    "produces a valid squad for %o",
    (filters) => {
      // A few repeats per combination since the draft is randomized —
      // one lucky pass wouldn't catch an intermittent constraint break.
      for (let i = 0; i < 3; i++) {
        expectValidSquad(generateRandomSquad(players, FINISHED_GAMEWEEKS, filters));
      }
    }
  );

  it("stays valid at finishedGameweekCount 0 (pre-season, nailed-on is a no-op)", () => {
    for (const filters of allFilterCombinations()) {
      expectValidSquad(generateRandomSquad(players, 0, filters));
    }
  });
});

describe("generateRandomSquad — filters visibly bias the output", () => {
  const BASE: SquadFilters = {
    budgetStyle: "balanced",
    starterReliability: "mixRisk",
    formBias: "ignoreForm",
    teamFocus: "balanced",
  };

  it("Nailed-on only never picks a player resolveNailedOn rejects", () => {
    const filters: SquadFilters = { ...BASE, starterReliability: "nailedOnOnly" };
    for (let i = 0; i < 5; i++) {
      const squad = squadFor(generateRandomSquad(players, FINISHED_GAMEWEEKS, filters)!);
      for (const p of squad) {
        expect(
          resolveNailedOn(p, FINISHED_GAMEWEEKS),
          `${p.webName} isn't nailed-on but was picked under Nailed-on only`
        ).toBe(true);
      }
    }
  });

  // A single 15-player draw is a noisy sample — averaging a metric over
  // many draws is what actually shows a bias exists, rather than one
  // lucky (or unlucky) random outcome either way.
  const RUNS = 20;

  function averageOver(filters: SquadFilters, metric: (squad: Player[]) => number): number {
    let total = 0;
    for (let i = 0; i < RUNS; i++) {
      total += metric(squadFor(generateRandomSquad(players, FINISHED_GAMEWEEKS, filters)!));
    }
    return total / RUNS;
  }

  const avgOf = (squad: Player[], value: (p: Player) => number) =>
    squad.reduce((sum, p) => sum + value(p), 0) / squad.length;

  it("In-form picks higher-form players on average than Ignore form", () => {
    const inForm = averageOver({ ...BASE, formBias: "inForm" }, (squad) => avgOf(squad, (p) => p.form));
    const ignoreForm = averageOver({ ...BASE, formBias: "ignoreForm" }, (squad) =>
      avgOf(squad, (p) => p.form)
    );
    expect(inForm).toBeGreaterThan(ignoreForm);
  });

  it("Value Hunters picks better points-per-million on average than Balanced", () => {
    const ppm = (p: Player) => p.totalPoints / (p.nowCost / 10);
    const valueHunters = averageOver({ ...BASE, budgetStyle: "valueHunters" }, (squad) =>
      avgOf(squad, ppm)
    );
    const balanced = averageOver({ ...BASE, budgetStyle: "balanced" }, (squad) => avgOf(squad, ppm));
    expect(valueHunters).toBeGreaterThan(balanced);
  });

  it("Stars & Scrubs produces a higher top price on average than Balanced", () => {
    const maxPrice = (squad: Player[]) => Math.max(...squad.map((p) => p.nowCost));
    const starsAndScrubs = averageOver({ ...BASE, budgetStyle: "starsAndScrubs" }, maxPrice);
    const balanced = averageOver({ ...BASE, budgetStyle: "balanced" }, maxPrice);
    expect(starsAndScrubs).toBeGreaterThan(balanced);
  });

  it("Attack-heavy spends more on MID+FWD on average than Defense-heavy, Balanced between", () => {
    const attackSpend = (squad: Player[]) =>
      squad
        .filter((p) => p.elementType === 3 || p.elementType === 4)
        .reduce((sum, p) => sum + p.nowCost, 0);
    const attackHeavy = averageOver({ ...BASE, teamFocus: "attackHeavy" }, attackSpend);
    const balanced = averageOver({ ...BASE, teamFocus: "balanced" }, attackSpend);
    const defenseHeavy = averageOver({ ...BASE, teamFocus: "defenseHeavy" }, attackSpend);
    expect(attackHeavy).toBeGreaterThan(balanced);
    expect(balanced).toBeGreaterThan(defenseHeavy);
  });
});
