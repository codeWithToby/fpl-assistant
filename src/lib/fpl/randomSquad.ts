import type { Player } from "./types";
import {
  MAX_PLAYERS_PER_TEAM,
  RANDOM_SQUAD_MAX_ATTEMPTS,
  SQUAD_BUDGET,
  SQUAD_POSITION_NEEDS,
} from "./constants";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function groupByPosition(players: Player[]): Record<number, Player[]> {
  const pools: Record<number, Player[]> = { 1: [], 2: [], 3: [], 4: [] };
  players.forEach((p) => pools[p.elementType]?.push(p));
  return pools;
}

// One randomized attempt: fills 15 slots in a shuffled (interleaved) order
// so budget pressure doesn't get dumped entirely on whichever position
// happens to be filled last. At each pick, only considers players "safely
// affordable" — i.e. picking them still leaves enough budget to fill every
// remaining slot at that slot-type's cheapest available price. Falls back
// to the cheapest eligible option if the affordability filter is too
// strict to satisfy (rare, but keeps the attempt from dead-ending).
function attemptRandomDraft(players: Player[]): number[] | null {
  const pools = groupByPosition(shuffle(players));

  let slots: number[] = [];
  for (const [type, count] of Object.entries(SQUAD_POSITION_NEEDS)) {
    for (let i = 0; i < count; i++) slots.push(Number(type));
  }
  slots = shuffle(slots);

  const pickedIds = new Set<number>();
  const teamCounts = new Map<number, number>();
  let remainingBudget = SQUAD_BUDGET;
  const picked: number[] = [];

  const cheapestRemaining = (type: number) => {
    const eligible = pools[type].filter((p) => !pickedIds.has(p.id));
    return eligible.length > 0 ? Math.min(...eligible.map((p) => p.nowCost)) : null;
  };

  for (let i = 0; i < slots.length; i++) {
    const type = slots[i];
    const remainingAfter = slots.slice(i + 1);

    const eligible = pools[type].filter(
      (p) =>
        !pickedIds.has(p.id) &&
        (teamCounts.get(p.team) ?? 0) < MAX_PLAYERS_PER_TEAM
    );
    if (eligible.length === 0) return null;

    let minCostForRest = 0;
    for (const t of remainingAfter) {
      const cheapest = cheapestRemaining(t);
      if (cheapest === null) return null; // pool exhausted for a future slot
      minCostForRest += cheapest;
    }

    const ceiling = remainingBudget - minCostForRest;
    const affordable = eligible.filter((p) => p.nowCost <= ceiling);
    const candidates =
      affordable.length > 0
        ? affordable
        : eligible.filter(
            (p) => p.nowCost === Math.min(...eligible.map((x) => x.nowCost))
          );

    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    pickedIds.add(choice.id);
    picked.push(choice.id);
    remainingBudget -= choice.nowCost;
    teamCounts.set(choice.team, (teamCounts.get(choice.team) ?? 0) + 1);
  }

  return remainingBudget >= 0 ? picked : null;
}

// Deterministic guaranteed-feasible fallback: cheapest legal player per
// slot, position by position. Not random, but always succeeds if a valid
// squad exists at all within budget — used only if every randomized
// attempt above fails (shouldn't happen with real FPL pricing, but this
// keeps the feature from ever visibly failing).
function cheapestFeasibleSquad(players: Player[]): number[] | null {
  const pools = groupByPosition(players);
  const teamCounts = new Map<number, number>();
  const picked: number[] = [];
  let totalCost = 0;

  for (const [typeStr, count] of Object.entries(SQUAD_POSITION_NEEDS)) {
    const type = Number(typeStr);
    const sorted = [...pools[type]].sort((a, b) => a.nowCost - b.nowCost);
    let filled = 0;
    for (const p of sorted) {
      if (filled >= count) break;
      if ((teamCounts.get(p.team) ?? 0) >= MAX_PLAYERS_PER_TEAM) continue;
      picked.push(p.id);
      totalCost += p.nowCost;
      teamCounts.set(p.team, (teamCounts.get(p.team) ?? 0) + 1);
      filled++;
    }
    if (filled < count) return null; // genuinely infeasible (not enough eligible players)
  }

  return totalCost <= SQUAD_BUDGET ? picked : null;
}

export function generateRandomSquad(players: Player[]): number[] | null {
  for (let attempt = 0; attempt < RANDOM_SQUAD_MAX_ATTEMPTS; attempt++) {
    const result = attemptRandomDraft(players);
    if (result) return result;
  }
  return cheapestFeasibleSquad(players);
}
