// Trimmed shapes of the fields we actually use from the FPL API.
// Field names/values confirmed directly against the live API.

export type PlayerStatus = "a" | "d" | "i" | "s" | "u" | "n";

export interface Player {
  id: number;
  webName: string;
  team: number; // Team.id
  elementType: number; // 1=GK 2=DEF 3=MID 4=FWD
  nowCost: number; // tenths of £m, e.g. 155 -> £15.5m
  minutes: number;
  form: number;
  selectedByPercent: number;
  expectedGoalsPer90: number;
  expectedAssistsPer90: number;
  expectedGoalInvolvementsPer90: number;
  expectedGoalsConcededPer90: number;
  status: PlayerStatus;
  chanceOfPlayingNextRound: number | null;
  totalPoints: number;
  // Set once recent-form data has been fetched for this player (see
  // recentForm.ts) — undefined until then, meaning "no recent data yet,
  // use season-to-date". Not one of the raw bootstrap-static fields.
  recentMinutesRatio?: number | null;
}

// --- Random squad filters ---

export type BudgetStyle = "balanced" | "starsAndScrubs" | "valueHunters";
export type StarterReliability = "nailedOnOnly" | "mixRisk";
export type FormBias = "inForm" | "ignoreForm";
export type TeamFocus = "balanced" | "attackHeavy" | "defenseHeavy";

export interface SquadFilters {
  budgetStyle: BudgetStyle;
  starterReliability: StarterReliability;
  formBias: FormBias;
  teamFocus: TeamFocus;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
}

export interface GameweekEvent {
  id: number;
  name: string;
  isCurrent: boolean;
  isNext: boolean;
  finished: boolean;
  deadlineTime: string; // ISO 8601, UTC
}

export interface ElementType {
  id: number;
  singularName: string;
  squadSelect: number;
}

export interface Fixture {
  id: number;
  event: number | null; // null for unscheduled fixtures
  kickoffTime: string | null;
  started: boolean;
  finished: boolean;
  teamH: number; // Team.id
  teamA: number; // Team.id
  teamHDifficulty: number; // 1 (easiest) - 5 (hardest)
  teamADifficulty: number;
}

export interface BootstrapData {
  players: Player[];
  teams: Team[];
  events: GameweekEvent[];
  elementTypes: ElementType[];
}

export interface FixturesData {
  fixtures: Fixture[];
}

// --- Captain recommendation output ---

export interface CaptainScoreBreakdown {
  playerId: number;
  webName: string;
  teamShortName: string;
  totalScore: number; // 0-100, rounded
  components: {
    xgi: { per90: number; score: number; weight: number };
    fixture: {
      opponentShortName: string;
      isHome: boolean;
      fdr: number;
      score: number;
      weight: number;
    } | null;
    form: { value: number; score: number; weight: number };
  };
  availability: {
    status: PlayerStatus;
    chanceOfPlaying: number | null;
    multiplier: number;
    note: string | null;
  };
  nailedOn: boolean;
  isTripleCaptainCandidate: boolean;
  hasFixtureThisGameweek: boolean;
  reasoning: string[];
  /** One plain-language sentence — the primary UI shows this, not the list. */
  oneLinerReason: string;
}

// --- Clean sheet probability ---

export interface CleanSheetEstimate {
  playerId: number;
  probability: number; // 0-100, rounded
  hasFixtureThisGameweek: boolean;
  fixture: {
    opponentShortName: string;
    isHome: boolean;
    fdr: number;
  } | null;
  usedFallbackRate: boolean; // true if own xGC/90 sample was too small
}

// --- Optimal XI ---

export interface XISlot {
  playerId: number;
  webName: string;
  teamShortName: string;
  elementType: number;
  nowCost: number; // tenths of £m, e.g. 155 -> £15.5m — same unit as Player.nowCost
  value: number; // 0-100, comparable across positions
  isStarter: boolean;
  benchOrder: number | null; // 1-4 if bench, null if starter
  rotationRisk: boolean;
  rotationNote: string | null;
  cleanSheetProbability: number | null; // GK/DEF only
  opponentShortName: string | null; // null if no fixture this gameweek
  isHome: boolean | null; // null alongside opponentShortName
  /** One plain-language sentence on why this slot's value is what it is —
   *  same voice as CaptainScoreBreakdown.oneLinerReason, minus the
   *  captaincy-specific framing that doesn't apply to a starting XI slot. */
  oneLinerReason: string;
}

export interface OptimalXIResult {
  formation: string; // e.g. "4-4-2" (DEF-MID-FWD)
  starters: XISlot[]; // 11, GK included
  bench: XISlot[]; // 4, ordered by benchOrder
}

// --- Recent form (last-N-gameweek recency adjustment) ---

export interface RecentFormStats {
  recentMinutes: number;
  recentGameweeksConsidered: number;
  xgiPer90: number | null; // null if the recent-minutes sample is too small to trust
  xgcPer90: number | null;
  minutesRatio: number | null; // recentMinutes ÷ (gameweeks considered × 90); null with zero gameweeks of history
}
