import type { CaptainScoreBreakdown, Fixture, Player, Team } from "./types";
import { getNextFixtureForTeam } from "./getNextFixtureForTeam";
import {
  AVAILABILITY_MULTIPLIERS,
  FORM_CAP,
  NAILED_ON_MINUTES_RATIO,
  SCORE_WEIGHTS,
  TRIPLE_CAPTAIN_THRESHOLDS,
  UNAVAILABLE_STATUSES,
  XGI_PER_90_CAP,
} from "./constants";

function resolveAvailability(player: Player): {
  multiplier: number;
  note: string | null;
} {
  if (UNAVAILABLE_STATUSES.has(player.status)) {
    return { multiplier: AVAILABILITY_MULTIPLIERS.none, note: "Not fit for captaincy" };
  }

  const chance = player.chanceOfPlayingNextRound;
  if (chance === null || chance >= 75) {
    return { multiplier: AVAILABILITY_MULTIPLIERS.full, note: null };
  }
  if (chance >= 50) {
    return {
      multiplier: AVAILABILITY_MULTIPLIERS.medium,
      note: `Fitness doubt — ${chance}% chance of playing`,
    };
  }
  if (chance >= 25) {
    return {
      multiplier: AVAILABILITY_MULTIPLIERS.low,
      note: `Significant fitness doubt — ${chance}% chance of playing`,
    };
  }
  return { multiplier: AVAILABILITY_MULTIPLIERS.none, note: "Not fit for captaincy" };
}

function resolveNailedOn(
  player: Player,
  finishedGameweekCount: number
): boolean {
  if (finishedGameweekCount === 0) return true; // preseason, no sample yet

  // Prefer how much they've actually played over their last few games —
  // a season-long average stays high for a while after a player loses
  // their place, and stays low for a while after they win it back.
  if (player.recentMinutesRatio !== undefined && player.recentMinutesRatio !== null) {
    return player.recentMinutesRatio >= NAILED_ON_MINUTES_RATIO;
  }

  const ratio = player.minutes / (finishedGameweekCount * 90);
  return ratio >= NAILED_ON_MINUTES_RATIO;
}

type BreakdownDraft = Omit<CaptainScoreBreakdown, "reasoning" | "oneLinerReason">;

// Describes THIS player's situation — it doesn't know (and shouldn't need
// to know) whether it's being shown as the #1 featured pick or as one of
// several ranked alternatives further down. "Is the captain pick" framing
// belongs to the card that's actually featured (see CaptainCard.tsx's
// "Captain pick" label on the #1 card), not baked into a sentence reused
// for every squad member — otherwise #2 through #15 all claim to be the
// pick too, which just isn't true.
function buildOneLiner(breakdown: BreakdownDraft, finishedGameweekCount: number): string {
  if (!breakdown.hasFixtureThisGameweek) {
    return "No fixture this gameweek.";
  }

  if (breakdown.availability.multiplier === 0) {
    // Only append the note when it's more specific than the generic
    // fallback phrase — otherwise it just repeats itself.
    const note = breakdown.availability.note;
    const reason = note && note !== "Not fit for captaincy" ? ` (${note.toLowerCase()})` : "";
    return `Not fit for captaincy right now${reason}.`;
  }

  const fx = breakdown.components.fixture;
  const fixtureClause = fx
    ? `${fx.isHome ? "home" : "away"} vs ${fx.opponentShortName} (FDR ${fx.fdr}/5)`
    : "an unclear fixture";

  const starterClause = breakdown.nailedOn
    ? finishedGameweekCount === 0
      ? "Expected to start once the season kicks off"
      : "Nailed-on starter"
    : "Carrying some rotation risk";

  const doubtClause = breakdown.availability.note
    ? `, though ${breakdown.availability.note.toLowerCase()}`
    : "";

  const tcClause = breakdown.isTripleCaptainCandidate
    ? " Every signal lines up — a genuine Triple Captain candidate."
    : "";

  return `${starterClause}, ${fixtureClause}, ${breakdown.components.xgi.per90.toFixed(2)} xGI/90${doubtClause}.${tcClause}`;
}

function buildReasoning(breakdown: BreakdownDraft, finishedGameweekCount: number): string[] {
  const lines: string[] = [];

  if (!breakdown.hasFixtureThisGameweek) {
    lines.push("No fixture this gameweek");
    return lines;
  }

  if (breakdown.nailedOn) {
    lines.push(
      finishedGameweekCount === 0
        ? "Season hasn't started — starting status unconfirmed"
        : "Nailed-on starter"
    );
  } else {
    lines.push("Rotation risk — not a guaranteed starter");
  }

  const fx = breakdown.components.fixture;
  if (fx) {
    const ease = fx.fdr <= 2 ? "favourable" : fx.fdr >= 4 ? "tough" : "middling";
    lines.push(
      `${fx.isHome ? "Home" : "Away"} vs ${fx.opponentShortName} — ${ease} fixture (FDR ${fx.fdr}/5)`
    );
  }

  lines.push(`${breakdown.components.xgi.per90.toFixed(2)} xGI/90`);

  lines.push(
    finishedGameweekCount === 0
      ? "Recent form not yet available this season"
      : `Form rating ${breakdown.components.form.value.toFixed(1)}`
  );

  if (breakdown.availability.note) {
    lines.push(breakdown.availability.note);
  }

  if (breakdown.isTripleCaptainCandidate) {
    lines.push("Triple Captain candidate — every signal lines up");
  }

  return lines;
}

export function computeCaptainScore(
  player: Player,
  teams: Team[],
  fixtures: Fixture[],
  finishedGameweekCount: number
): CaptainScoreBreakdown {
  const xgi90 = player.expectedGoalInvolvementsPer90;
  const xgiScore = Math.min(xgi90 / XGI_PER_90_CAP, 1) * 100;

  const nextFixture = getNextFixtureForTeam(player.team, fixtures);
  const hasFixtureThisGameweek = nextFixture !== null;

  const fixtureScore = nextFixture
    ? ((5 - nextFixture.difficulty) / 4) * 100
    : 0;

  const formScore = Math.min(player.form / FORM_CAP, 1) * 100;

  const rawTotal =
    SCORE_WEIGHTS.xgi * xgiScore +
    SCORE_WEIGHTS.fixture * fixtureScore +
    SCORE_WEIGHTS.form * formScore;

  const availability = resolveAvailability(player);
  const totalScore = Math.round(rawTotal * availability.multiplier);
  const nailedOn = resolveNailedOn(player, finishedGameweekCount);

  const opponentTeam = nextFixture
    ? teams.find((t) => t.id === nextFixture.opponentTeamId)
    : null;

  const breakdown: BreakdownDraft = {
    playerId: player.id,
    webName: player.webName,
    teamShortName: teams.find((t) => t.id === player.team)?.shortName ?? "?",
    totalScore,
    components: {
      xgi: { per90: xgi90, score: Math.round(xgiScore), weight: SCORE_WEIGHTS.xgi },
      fixture: nextFixture
        ? {
            opponentShortName: opponentTeam?.shortName ?? "?",
            isHome: nextFixture.isHome,
            fdr: nextFixture.difficulty,
            score: Math.round(fixtureScore),
            weight: SCORE_WEIGHTS.fixture,
          }
        : null,
      form: {
        value: player.form,
        score: Math.round(formScore),
        weight: SCORE_WEIGHTS.form,
      },
    },
    availability: {
      status: player.status,
      chanceOfPlaying: player.chanceOfPlayingNextRound,
      multiplier: availability.multiplier,
      note: availability.note,
    },
    nailedOn,
    hasFixtureThisGameweek,
    isTripleCaptainCandidate:
      hasFixtureThisGameweek &&
      totalScore >= TRIPLE_CAPTAIN_THRESHOLDS.minScore &&
      xgi90 >= TRIPLE_CAPTAIN_THRESHOLDS.minXgiPer90 &&
      (nextFixture?.difficulty ?? 5) <= TRIPLE_CAPTAIN_THRESHOLDS.maxFdr &&
      player.form >= TRIPLE_CAPTAIN_THRESHOLDS.minForm &&
      availability.multiplier === 1.0 &&
      nailedOn,
  };

  return {
    ...breakdown,
    reasoning: buildReasoning(breakdown, finishedGameweekCount),
    oneLinerReason: buildOneLiner(breakdown, finishedGameweekCount),
  };
}
