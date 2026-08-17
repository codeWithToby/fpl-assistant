import type { Player, SquadFilters } from "./types";
import { resolveNailedOn } from "./scoring";
import {
  DEFAULT_SQUAD_FILTERS,
  FORM_OR_VALUE_KEEP_FRACTION,
  MAX_PLAYERS_PER_TEAM,
  RANDOM_SQUAD_MAX_ATTEMPTS,
  SQUAD_BUDGET,
  SQUAD_POSITION_NEEDS,
  STARS_AND_SCRUBS_KEEP_FRACTION,
  TEAM_FOCUS_ATTACK_BUDGET_SHARE,
} from "./constants";

const ATTACK_TYPES = [3, 4]; // MID, FWD — where Team Focus / Stars & Scrubs route spend
const DEFENSE_TYPES = [1, 2]; // GK, DEF

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

const pointsPerMillion = (p: Player) => (p.nowCost > 0 ? p.totalPoints / (p.nowCost / 10) : 0);

// Sorts a pool by a metric and keeps only the top or bottom slice — a soft
// nudge toward the better end of that metric (or, for Stars & Scrubs'
// scrub slots, deliberately the worse end), not a hard cutoff. Always
// keeps at least one player so a position's pool never narrows to zero.
function narrowPool(
  pool: Player[],
  metric: (p: Player) => number,
  direction: "top" | "bottom",
  keepFraction: number
): Player[] {
  if (pool.length === 0) return pool;
  const sorted = [...pool].sort((a, b) =>
    direction === "top" ? metric(b) - metric(a) : metric(a) - metric(b)
  );
  const keepCount = Math.max(1, Math.round(sorted.length * keepFraction));
  return sorted.slice(0, keepCount);
}

// Ordered least-to-most-recently-applied: Starter Reliability first (the
// filter most worth preserving), then Budget Style/Value Hunters, then
// Form Bias last (the lightest nudge of the four). candidatesWithFallback
// below peels from the END of this list first when a position's narrowed
// pool can't fill its remaining slots, so relaxation always happens in
// this same order without a separate priority table to keep in sync.
function buildNarrowingSteps(
  isStarSlot: boolean,
  filters: SquadFilters,
  finishedGameweekCount: number
): Array<(pool: Player[]) => Player[]> {
  const steps: Array<(pool: Player[]) => Player[]> = [];

  if (filters.starterReliability === "nailedOnOnly") {
    steps.push((pool) => pool.filter((p) => resolveNailedOn(p, finishedGameweekCount)));
  }

  if (filters.budgetStyle === "starsAndScrubs") {
    steps.push((pool) =>
      narrowPool(
        pool,
        (p) => p.nowCost,
        isStarSlot ? "top" : "bottom",
        STARS_AND_SCRUBS_KEEP_FRACTION
      )
    );
  } else if (filters.budgetStyle === "valueHunters") {
    steps.push((pool) => narrowPool(pool, pointsPerMillion, "top", FORM_OR_VALUE_KEEP_FRACTION));
  }

  if (filters.formBias === "inForm") {
    steps.push((pool) => narrowPool(pool, (p) => p.form, "top", FORM_OR_VALUE_KEEP_FRACTION));
  }

  return steps;
}

// Applies narrowingSteps in order, but if the fully-narrowed result has no
// usable candidates (already-picked / over the per-club cap aside), peels
// steps off the end — most-recently-applied first — and retries, down to
// the raw pool if needed. The one degradation rule every filter
// combination shares; no per-filter special casing.
function candidatesWithFallback(
  pool: Player[],
  narrowingSteps: Array<(pool: Player[]) => Player[]>,
  isUsable: (p: Player) => boolean
): Player[] {
  for (let drop = 0; drop <= narrowingSteps.length; drop++) {
    let narrowed = pool;
    for (const step of narrowingSteps.slice(0, narrowingSteps.length - drop)) {
      narrowed = step(narrowed);
    }
    const usable = narrowed.filter(isUsable);
    if (usable.length > 0) return usable;
  }
  return [];
}

interface DraftOptions {
  slotTypes: number[];
  budget: number;
  initialTeamCounts: Map<number, number>;
  filters: SquadFilters;
  finishedGameweekCount: number;
  // Position types that get exactly one "star" slot under Stars & Scrubs
  // (always MID/FWD — see teamOfTheWeek-style plan doc for why this isn't
  // coupled to Team Focus). Empty unless that budget style is active.
  starSlotTypes: Set<number>;
}

interface DraftResult {
  pickedIds: number[];
  teamCounts: Map<number, number>;
}

// One randomized attempt over a given set of slot types and budget — the
// same affordability-safe random draft the original single-pool version
// used, just parameterized so Team Focus can call it twice (once per
// slot-type group, sharing running per-club counts across both calls) and
// every filter narrows each slot's candidate pool before the affordability
// check runs, rather than changing that check itself.
function attemptDraft(players: Player[], opts: DraftOptions): DraftResult | null {
  const pools = groupByPosition(shuffle(players));

  let slots: number[] = [];
  for (const type of opts.slotTypes) {
    const count = SQUAD_POSITION_NEEDS[type];
    for (let i = 0; i < count; i++) slots.push(type);
  }
  slots = shuffle(slots);

  const pickedIds = new Set<number>();
  const teamCounts = new Map(opts.initialTeamCounts);
  const starAssigned = new Set<number>();
  let remainingBudget = opts.budget;
  const picked: number[] = [];

  // Cheapest still-available player for a type — optionally restricted to
  // the star price band, for estimating a future slot that Stars & Scrubs
  // will force to be expensive. Using the pool-wide cheapest for a pending
  // star slot would understate its real minimum cost (it can never
  // actually draw from the cheap end), letting the budget-safety check
  // above overspend early and blow the total by the time that slot is
  // actually drafted.
  const cheapestRemaining = (type: number, asStarSlot: boolean) => {
    const available = pools[type].filter((p) => !pickedIds.has(p.id));
    const pool = asStarSlot
      ? narrowPool(available, (p) => p.nowCost, "top", STARS_AND_SCRUBS_KEEP_FRACTION)
      : available;
    return pool.length > 0 ? Math.min(...pool.map((p) => p.nowCost)) : null;
  };

  for (let i = 0; i < slots.length; i++) {
    const type = slots[i];
    const remainingAfter = slots.slice(i + 1);

    // First slot of a favored type (in this draft's shuffled order)
    // becomes the star; every other slot of every type is a scrub. Which
    // specific player ends up as the star is still random, via the same
    // shuffle-then-pick pipeline every slot goes through.
    const isStarSlot = opts.starSlotTypes.has(type) && !starAssigned.has(type);
    if (isStarSlot) starAssigned.add(type);

    const narrowingSteps = buildNarrowingSteps(isStarSlot, opts.filters, opts.finishedGameweekCount);
    const isUsable = (p: Player) =>
      !pickedIds.has(p.id) && (teamCounts.get(p.team) ?? 0) < MAX_PLAYERS_PER_TEAM;
    const eligible = candidatesWithFallback(pools[type], narrowingSteps, isUsable);
    if (eligible.length === 0) return null;

    // Simulated forward, not the real starAssigned — figures out which of
    // the *remaining* slots (if any) will be the star for its type, purely
    // to estimate a safe floor. The real assignment still happens only
    // when each slot is actually drafted, further down the loop.
    let minCostForRest = 0;
    const simulatedStarAssigned = new Set(starAssigned);
    for (const t of remainingAfter) {
      const willBeStar = opts.starSlotTypes.has(t) && !simulatedStarAssigned.has(t);
      if (willBeStar) simulatedStarAssigned.add(t);
      const cheapest = cheapestRemaining(t, willBeStar);
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

  return remainingBudget >= 0 ? { pickedIds: picked, teamCounts } : null;
}

// Cheapest possible total cost of filling every slot across the given
// position types, from the actual live pool — the real feasibility floor
// a sub-budget must clear, not a guessed constant. Types with a star slot
// (Stars & Scrubs) can't fill *every* slot cheaply — one of them is
// pinned to the top price band — so that one slot's floor comes from the
// star-narrowed pool instead of the type's overall cheapest.
function minCostForTypes(
  players: Player[],
  types: number[],
  starSlotTypes: Set<number>
): number {
  const pools = groupByPosition(players);
  let total = 0;
  for (const type of types) {
    const available = pools[type];
    const need = SQUAD_POSITION_NEEDS[type];
    const sorted = [...available].sort((a, b) => a.nowCost - b.nowCost);

    if (starSlotTypes.has(type) && need > 0) {
      const starPool = narrowPool(available, (p) => p.nowCost, "top", STARS_AND_SCRUBS_KEEP_FRACTION);
      const cheapestStar = Math.min(...starPool.map((p) => p.nowCost));
      total += cheapestStar + sorted.slice(0, need - 1).reduce((sum, p) => sum + p.nowCost, 0);
    } else {
      total += sorted.slice(0, need).reduce((sum, p) => sum + p.nowCost, 0);
    }
  }
  return total;
}

function starSlotTypesFor(filters: SquadFilters): Set<number> {
  return filters.budgetStyle === "starsAndScrubs" ? new Set(ATTACK_TYPES) : new Set();
}

// Team Focus is the one filter that operates on money rather than which
// candidates are eligible, so it's kept structurally separate: Balanced
// runs a single unsplit draft (identical to today's behavior — no new
// code path), while Attack/Defense-heavy split SQUAD_BUDGET into two
// sub-budgets and call attemptDraft once per slot-type group, threading
// the defense draft's teamCounts into the attack draft so "max 3 per
// club" holds across both even though the two groups never draw from the
// same position pool.
function attemptGeneration(
  players: Player[],
  filters: SquadFilters,
  finishedGameweekCount: number
): number[] | null {
  if (filters.teamFocus === "balanced") {
    const result = attemptDraft(players, {
      slotTypes: [1, 2, 3, 4],
      budget: SQUAD_BUDGET,
      initialTeamCounts: new Map(),
      filters,
      finishedGameweekCount,
      starSlotTypes: starSlotTypesFor(filters),
    });
    return result?.pickedIds ?? null;
  }

  // A flat percentage split of SQUAD_BUDGET can go infeasible: 30% of
  // £100m is only £30m, but 8 attack slots (5 MID + 3 FWD) can easily cost
  // more than that just at floor prices, which would silently fail every
  // draft attempt and fall through to the filters-ignoring cheapest-squad
  // fallback below — defeating Team Focus entirely without ever surfacing
  // an error. Instead, reserve each group's real minimum cost from the
  // current pool first, then split only the leftover "discretionary"
  // budget by the focus ratio, so neither sub-budget can dip below what
  // filling its slots actually requires.
  const starSlotTypes = starSlotTypesFor(filters);
  const attackFloor = minCostForTypes(players, ATTACK_TYPES, starSlotTypes);
  const defenseFloor = minCostForTypes(players, DEFENSE_TYPES, starSlotTypes);
  const discretionary = Math.max(0, SQUAD_BUDGET - attackFloor - defenseFloor);
  const attackShare = TEAM_FOCUS_ATTACK_BUDGET_SHARE[filters.teamFocus];
  const attackBudget = attackFloor + Math.round(discretionary * attackShare);
  const defenseBudget = SQUAD_BUDGET - attackBudget;

  const defenseResult = attemptDraft(players, {
    slotTypes: DEFENSE_TYPES,
    budget: defenseBudget,
    initialTeamCounts: new Map(),
    filters,
    finishedGameweekCount,
    starSlotTypes: new Set(), // stars are always MID/FWD, never GK/DEF
  });
  if (!defenseResult) return null;

  const attackResult = attemptDraft(players, {
    slotTypes: ATTACK_TYPES,
    budget: attackBudget,
    initialTeamCounts: defenseResult.teamCounts,
    filters,
    finishedGameweekCount,
    starSlotTypes: starSlotTypesFor(filters),
  });
  if (!attackResult) return null;

  return [...defenseResult.pickedIds, ...attackResult.pickedIds];
}

// Deterministic guaranteed-feasible fallback: cheapest legal player per
// slot, position by position. Not random and ignores every filter — used
// only if every attempt above fails (shouldn't happen with real FPL
// pricing), so the feature never visibly fails regardless of how the
// filters were set.
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

export function generateRandomSquad(
  players: Player[],
  finishedGameweekCount: number,
  filters: SquadFilters = DEFAULT_SQUAD_FILTERS
): number[] | null {
  for (let attempt = 0; attempt < RANDOM_SQUAD_MAX_ATTEMPTS; attempt++) {
    const result = attemptGeneration(players, filters, finishedGameweekCount);
    if (result) return result;
  }
  return cheapestFeasibleSquad(players);
}
