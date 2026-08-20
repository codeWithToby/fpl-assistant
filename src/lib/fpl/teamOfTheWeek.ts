import type { CaptainScoreBreakdown, Fixture, OptimalXIResult, Player, Team } from "./types";
import { computePlayerValue, computeOptimalXI } from "./optimalXI";
import { computeCaptainScore, resolveNailedOn } from "./scoring";
import {
  MAX_PLAYERS_PER_TEAM,
  SQUAD_BUDGET,
  SQUAD_POSITION_NEEDS,
  UNAVAILABLE_STATUSES,
} from "./constants";

export interface TeamOfTheWeekResult {
  optimalXI: OptimalXIResult;
  // Same computeCaptainScore pass used for a user's own squad, just run
  // over this squad-agnostic 15 instead — ranked so the page can split
  // into ranked/noFixture the same way CaptainAssistant does.
  captainRecommendations: CaptainScoreBreakdown[];
}

const IMPROVE_PASSES = 3;

function groupByPosition(players: Player[]): Record<number, Player[]> {
  const pools: Record<number, Player[]> = { 1: [], 2: [], 3: [], 4: [] };
  players.forEach((p) => pools[p.elementType]?.push(p));
  return pools;
}

// No listed fitness doubt at all — stricter than the availability
// multiplier's tiers, which still allow a 75%-chance doubt through at full
// score. "Confidently available" means chance_of_playing_next_round is
// null, not just above some threshold.
function isConfidentlyAvailable(player: Player): boolean {
  return !UNAVAILABLE_STATUSES.has(player.status) && player.chanceOfPlayingNextRound === null;
}

// Picks the best 15 players the real squad rules allow (budget, 2/5/5/3 by
// position, max 3 per club) from the entire player pool — not from any
// user's own squad — then hands them to computeOptimalXI, the exact same
// function that already turns a user's 15 into a starting XI + bench.
//
// Selection is a value-per-position fill: work through each of the 15
// slots in order, each time taking the highest-value player still
// affordable once every remaining slot's cheapest option is reserved for
// (same affordability-safety trick generateRandomSquad already uses for
// its random draft — this just always takes the best option instead of a
// random one). A short "does one swap improve things" polish pass runs
// afterward; it's a nice-to-have, not required for a valid squad.
export function selectTeamOfTheWeek(
  allPlayers: Player[],
  teams: Team[],
  fixtures: Fixture[],
  finishedGameweekCount: number
): TeamOfTheWeekResult | null {
  const valueById = new Map<number, number>();
  for (const p of allPlayers) {
    valueById.set(p.id, computePlayerValue(p, teams, fixtures, finishedGameweekCount).value);
  }

  // Team of the Week is a one-shot, confident recommendation — unlike a
  // user's own squad, which they already own and can weigh risk on
  // themselves, there's no one here to show a "might not play" caveat to.
  // So it only draws from genuinely guaranteed starters: no listed fitness
  // doubt at all, and a real recent-minutes starter, not just healthy-if-
  // picked. strictPools is tried first per position; fullPools is the
  // fallback only if a position's strict pool can't fill its slots (rare,
  // but graceful rather than failing the whole feature over it) — same
  // philosophy randomSquad.ts uses for its Customize filters.
  const sortByValue = (list: Player[]) =>
    [...list].sort((a, b) => (valueById.get(b.id) ?? 0) - (valueById.get(a.id) ?? 0));

  const fullPools = groupByPosition(allPlayers);
  const strictPools = groupByPosition(
    allPlayers.filter(
      (p) => isConfidentlyAvailable(p) && resolveNailedOn(p, finishedGameweekCount)
    )
  );
  for (const type of Object.keys(fullPools)) {
    const key = Number(type);
    fullPools[key] = sortByValue(fullPools[key]);
    strictPools[key] = sortByValue(strictPools[key]);
  }

  const slots: number[] = [];
  for (const [type, count] of Object.entries(SQUAD_POSITION_NEEDS)) {
    for (let i = 0; i < count; i++) slots.push(Number(type));
  }

  const pickedIds = new Set<number>();
  const teamCounts = new Map<number, number>();
  let remainingBudget = SQUAD_BUDGET;
  const picked: Player[] = [];

  // The true floor always comes from the full pool, since that's what a
  // future slot can fall back to if its own strict pool runs dry — using
  // the (cheaper, more populous) strict pool here could overestimate the
  // floor and reject an affordable pick now for a shortage that would
  // never actually happen.
  const cheapestRemaining = (type: number) => {
    const eligible = fullPools[type].filter((p) => !pickedIds.has(p.id));
    return eligible.length > 0 ? Math.min(...eligible.map((p) => p.nowCost)) : null;
  };

  for (let i = 0; i < slots.length; i++) {
    const type = slots[i];
    const remainingAfter = slots.slice(i + 1);

    const isUsable = (p: Player) =>
      !pickedIds.has(p.id) && (teamCounts.get(p.team) ?? 0) < MAX_PLAYERS_PER_TEAM;
    const strictEligible = strictPools[type].filter(isUsable);
    const eligible = strictEligible.length > 0 ? strictEligible : fullPools[type].filter(isUsable);
    if (eligible.length === 0) return null;

    let minCostForRest = 0;
    for (const t of remainingAfter) {
      const cheapest = cheapestRemaining(t);
      if (cheapest === null) return null;
      minCostForRest += cheapest;
    }

    const ceiling = remainingBudget - minCostForRest;
    const affordable = eligible.filter((p) => p.nowCost <= ceiling);
    // eligible (and therefore affordable) is already sorted best-value-first,
    // so the first affordable option is the best we can do for this slot.
    const choice = (affordable.length > 0 ? affordable : eligible)[0];

    pickedIds.add(choice.id);
    picked.push(choice);
    remainingBudget -= choice.nowCost;
    teamCounts.set(choice.team, (teamCounts.get(choice.team) ?? 0) + 1);
  }

  for (let pass = 0; pass < IMPROVE_PASSES; pass++) {
    let improved = false;

    for (let i = 0; i < picked.length; i++) {
      const current = picked[i];
      const budgetWithoutCurrent = remainingBudget + current.nowCost;
      const teamCountWithoutCurrent = (teamCounts.get(current.team) ?? 0) - 1;

      // Only searches strictPools, not fullPools — this pass is an
      // optional "does a swap help" polish, not a constraint enforcer, so
      // it should never reintroduce a doubtful/rotation-risk player purely
      // for a value gain. A slot already drawing from fullPools (its own
      // strict pool was exhausted at draft time) is left as-is here.
      const betterOption = strictPools[current.elementType].find((candidate) => {
        if (pickedIds.has(candidate.id)) return false;
        if (candidate.nowCost > budgetWithoutCurrent) return false;
        const candidateTeamCount =
          candidate.team === current.team
            ? teamCountWithoutCurrent + 1
            : (teamCounts.get(candidate.team) ?? 0) + 1;
        if (candidateTeamCount > MAX_PLAYERS_PER_TEAM) return false;
        return (valueById.get(candidate.id) ?? 0) > (valueById.get(current.id) ?? 0);
      });

      if (betterOption) {
        pickedIds.delete(current.id);
        pickedIds.add(betterOption.id);
        picked[i] = betterOption;
        remainingBudget = budgetWithoutCurrent - betterOption.nowCost;
        teamCounts.set(current.team, teamCountWithoutCurrent);
        teamCounts.set(betterOption.team, (teamCounts.get(betterOption.team) ?? 0) + 1);
        improved = true;
      }
    }

    if (!improved) break;
  }

  const captainRecommendations = picked
    .map((p) => computeCaptainScore(p, teams, fixtures, finishedGameweekCount))
    .sort((a, b) => b.totalScore - a.totalScore);

  return {
    optimalXI: computeOptimalXI(picked, teams, fixtures, finishedGameweekCount),
    captainRecommendations,
  };
}
