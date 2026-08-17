import type {
  CaptainScoreBreakdown,
  Fixture,
  OptimalXIResult,
  Player,
  Team,
  XISlot,
} from "./types";
import { computeCaptainScore } from "./scoring";
import { computeCleanSheetProbability } from "./cleanSheetProbability";
import { DEFENSIVE_VALUE_WEIGHTS, FORMATION_LIMITS } from "./constants";

const GK = 1;
const DEF = 2;
const MID = 3;
const FWD = 4;

function rotationNoteFor(
  nailedOn: boolean,
  availabilityNote: string | null,
  finishedGameweekCount: number
): string | null {
  if (availabilityNote) return availabilityNote;
  if (nailedOn) return null;
  return finishedGameweekCount === 0
    ? "Nailed-on status unconfirmed — season hasn't started"
    : "Limited recent minutes — rotation risk";
}

// Deliberately mirrors scoring.ts's buildOneLiner — same voice, same
// building blocks (starter status, fixture, xGI, fitness doubt) — minus
// the captaincy-only framing ("not fit for captaincy", Triple Captain)
// that doesn't mean anything for a starting-XI/bench slot.
function buildSlotReason(
  captain: CaptainScoreBreakdown,
  finishedGameweekCount: number
): string {
  if (!captain.hasFixtureThisGameweek) {
    return "No fixture this gameweek.";
  }

  const fx = captain.components.fixture;
  const fixtureClause = fx
    ? `${fx.isHome ? "home" : "away"} vs ${fx.opponentShortName} (FDR ${fx.fdr}/5)`
    : "an unclear fixture";

  const starterClause = captain.nailedOn
    ? finishedGameweekCount === 0
      ? "Expected to start once the season kicks off"
      : "Nailed-on starter"
    : "Carrying some rotation risk";

  const doubtClause = captain.availability.note
    ? `, though ${captain.availability.note.toLowerCase()}`
    : "";

  return `${starterClause}, ${fixtureClause}, ${captain.components.xgi.per90.toFixed(2)} xGI/90${doubtClause}.`;
}

// The "how good a starting-XI pick is this player right now" number — same
// captain score for MID/FWD, but blended with clean sheet probability for
// GK/DEF, since attacking output barely applies to them. Squad-agnostic:
// doesn't care whether the player is in anyone's 15, which is what lets
// teamOfTheWeek.ts reuse it to rank the entire player pool, not just a
// user's own squad.
export function computePlayerValue(
  player: Player,
  teams: Team[],
  fixtures: Fixture[],
  finishedGameweekCount: number
): { value: number; cleanSheetProbability: number | null; captain: CaptainScoreBreakdown } {
  const captain = computeCaptainScore(player, teams, fixtures, finishedGameweekCount);

  let value: number;
  let cleanSheetProbability: number | null = null;

  if (player.elementType === GK || player.elementType === DEF) {
    const cleanSheet = computeCleanSheetProbability(player, teams, fixtures);
    cleanSheetProbability = cleanSheet.probability;
    const rawValue =
      DEFENSIVE_VALUE_WEIGHTS.cleanSheet * cleanSheet.probability +
      DEFENSIVE_VALUE_WEIGHTS.xgi * captain.components.xgi.score;
    value = Math.round(rawValue * captain.availability.multiplier);
  } else {
    value = captain.totalScore;
  }

  return { value, cleanSheetProbability, captain };
}

function buildSlot(
  player: Player,
  teams: Team[],
  fixtures: Fixture[],
  finishedGameweekCount: number
): XISlot {
  const { value, cleanSheetProbability, captain } = computePlayerValue(
    player,
    teams,
    fixtures,
    finishedGameweekCount
  );

  return {
    playerId: player.id,
    webName: player.webName,
    teamShortName: teams.find((t) => t.id === player.team)?.shortName ?? "?",
    elementType: player.elementType,
    nowCost: player.nowCost,
    value,
    isStarter: false,
    benchOrder: null,
    opponentShortName: captain.components.fixture?.opponentShortName ?? null,
    isHome: captain.components.fixture?.isHome ?? null,
    // Either signal is enough to flag: not nailed-on by minutes, or an
    // outright fitness/availability concern (which nailedOn alone won't
    // catch pre-season, when it defaults to true for everyone).
    rotationRisk: !captain.nailedOn || captain.availability.multiplier < 1,
    rotationNote: rotationNoteFor(
      captain.nailedOn,
      captain.availability.note,
      finishedGameweekCount
    ),
    cleanSheetProbability,
    oneLinerReason: buildSlotReason(captain, finishedGameweekCount),
  };
}

function byValueDesc(a: XISlot, b: XISlot) {
  return b.value - a.value;
}

export function computeOptimalXI(
  squadPlayers: Player[],
  teams: Team[],
  fixtures: Fixture[],
  finishedGameweekCount: number
): OptimalXIResult {
  const slots = squadPlayers.map((p) =>
    buildSlot(p, teams, fixtures, finishedGameweekCount)
  );

  const gks = slots.filter((s) => s.elementType === GK).sort(byValueDesc);
  const defs = slots.filter((s) => s.elementType === DEF).sort(byValueDesc);
  const mids = slots.filter((s) => s.elementType === MID).sort(byValueDesc);
  const fwds = slots.filter((s) => s.elementType === FWD).sort(byValueDesc);

  const sum = (arr: XISlot[], n: number) =>
    arr.slice(0, n).reduce((total, s) => total + s.value, 0);

  // Enumerate valid formations (DEF 3-5, MID 2-5, FWD 1-3, summing to 10
  // outfield starters) and pick whichever maximizes total starter value.
  let best: { def: number; mid: number; fwd: number; total: number } | null = null;

  for (let def = FORMATION_LIMITS.def.min; def <= FORMATION_LIMITS.def.max; def++) {
    for (let fwd = FORMATION_LIMITS.fwd.min; fwd <= FORMATION_LIMITS.fwd.max; fwd++) {
      const mid = 10 - def - fwd;
      if (mid < FORMATION_LIMITS.mid.min || mid > FORMATION_LIMITS.mid.max) continue;
      if (def > defs.length || mid > mids.length || fwd > fwds.length) continue;

      const total = sum(defs, def) + sum(mids, mid) + sum(fwds, fwd);
      if (!best || total > best.total) {
        best = { def, mid, fwd, total };
      }
    }
  }

  // Best-effort fallback for an incomplete/unusual squad that can't satisfy
  // strict formation minimums (e.g. still mid-build) — never throw, just
  // fill as many of the 10 outfield slots as the squad actually allows.
  const defCount = best?.def ?? Math.min(defs.length, FORMATION_LIMITS.def.max);
  const midCount = best?.mid ?? Math.min(mids.length, FORMATION_LIMITS.mid.max);
  const fwdCount = best?.fwd ?? Math.min(fwds.length, FORMATION_LIMITS.fwd.max);

  const startingGk = gks.slice(0, FORMATION_LIMITS.gk);
  const startingDef = defs.slice(0, defCount);
  const startingMid = mids.slice(0, midCount);
  const startingFwd = fwds.slice(0, fwdCount);

  const starterIds = new Set(
    [...startingGk, ...startingDef, ...startingMid, ...startingFwd].map(
      (s) => s.playerId
    )
  );

  const starters = [...startingGk, ...startingDef, ...startingMid, ...startingFwd].map(
    (s) => ({ ...s, isStarter: true })
  );

  const benchGk = gks.filter((s) => !starterIds.has(s.playerId));
  const benchOutfield = [...defs, ...mids, ...fwds]
    .filter((s) => !starterIds.has(s.playerId))
    .sort(byValueDesc);

  const bench = [...benchOutfield, ...benchGk].map((s, i) => ({
    ...s,
    isStarter: false,
    benchOrder: i + 1,
  }));

  return {
    formation: `${defCount}-${midCount}-${fwdCount}`,
    starters,
    bench,
  };
}
