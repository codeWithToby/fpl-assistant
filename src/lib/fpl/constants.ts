import type { SquadFilters } from "./types";

// Captain score = weighted sum of three 0-100 components, gated by
// availability. Weighted sum (not multiplicative) so one weak signal
// can't tank an otherwise strong pick.
export const SCORE_WEIGHTS = {
  xgi: 0.45,
  fixture: 0.3,
  form: 0.25,
} as const;

// Normalization caps: values at/above these map to a component score of 100.
export const XGI_PER_90_CAP = 1.2; // elite-tier combined goal involvement
export const FORM_CAP = 8.0; // FPL's own 0-ish-to-10-ish form scale

// Availability multiplier by chance_of_playing_next_round.
export const AVAILABILITY_MULTIPLIERS = {
  full: 1.0,
  medium: 0.5, // 50-74%
  low: 0.25, // 25-49%
  none: 0, // <25%, or injured/suspended/unavailable/not-in-squad
} as const;

// Statuses treated as "not fit for captaincy" outright, regardless of
// chance_of_playing_next_round.
export const UNAVAILABLE_STATUSES = new Set(["i", "s", "u", "n"]);

// A player is considered "nailed on" (a guaranteed starter) once their
// average minutes-per-finished-gameweek clears this ratio.
export const NAILED_ON_MINUTES_RATIO = 0.6;

// Triple Captain candidacy requires ALL of these to hold, not just a high
// composite score — each threshold targets a specific "this is genuinely
// a green light" signal.
export const TRIPLE_CAPTAIN_THRESHOLDS = {
  minScore: 80,
  minXgiPer90: 0.7,
  maxFdr: 2,
  minForm: 5.0,
} as const;

export const POSITION_LABELS: Record<number, string> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
};

// Full-word section-header labels — distinct from POSITION_LABELS' short
// badge codes, for grouped lists like SquadList where the position reads
// as a heading rather than an inline tag.
export const POSITION_GROUP_LABELS: Record<number, string> = {
  1: "Goalkeepers",
  2: "Defenders",
  3: "Midfielders",
  4: "Forwards",
};

export const POSITION_ORDER = [1, 2, 3, 4] as const;

export function formatPrice(nowCost: number): string {
  return `£${(nowCost / 10).toFixed(1)}m`;
}

// Club primary color + a contrasting text color, keyed by the FPL short
// code — used to tint pitch player cards instead of a licensed kit image
// (no rights to reproduce real shirt artwork). Covers the current top
// flight plus recently promoted/relegated sides; anything not listed
// falls back to DEFAULT_TEAM_COLOR rather than breaking.
export const TEAM_COLORS: Record<string, { bg: string; text: string }> = {
  ARS: { bg: "#EF0107", text: "#FFFFFF" },
  AVL: { bg: "#670E36", text: "#FFFFFF" },
  BOU: { bg: "#DA291C", text: "#FFFFFF" },
  BRE: { bg: "#E30613", text: "#FFFFFF" },
  BHA: { bg: "#0057B8", text: "#FFFFFF" },
  BUR: { bg: "#6C1D45", text: "#FFFFFF" },
  CHE: { bg: "#034694", text: "#FFFFFF" },
  CRY: { bg: "#1B458F", text: "#FFFFFF" },
  EVE: { bg: "#003399", text: "#FFFFFF" },
  FUL: { bg: "#000000", text: "#FFFFFF" },
  LEE: { bg: "#1D428A", text: "#FFFFFF" },
  LEI: { bg: "#003090", text: "#FFFFFF" },
  LIV: { bg: "#C8102E", text: "#FFFFFF" },
  MCI: { bg: "#6CABDD", text: "#1C2C5B" },
  MUN: { bg: "#DA291C", text: "#FFFFFF" },
  NEW: { bg: "#241F20", text: "#FFFFFF" },
  NFO: { bg: "#DD0000", text: "#FFFFFF" },
  SUN: { bg: "#EB172B", text: "#FFFFFF" },
  TOT: { bg: "#132257", text: "#FFFFFF" },
  WHU: { bg: "#7A263A", text: "#FFFFFF" },
  WOL: { bg: "#FDB913", text: "#231F20" },
  SOU: { bg: "#D71920", text: "#FFFFFF" },
  IPS: { bg: "#0044A9", text: "#FFFFFF" },
  SHU: { bg: "#EE2737", text: "#FFFFFF" },
  WBA: { bg: "#122F67", text: "#FFFFFF" },
  NOR: { bg: "#00A650", text: "#FFFFFF" },
  WAT: { bg: "#FBEE23", text: "#ED2127" },
  HUD: { bg: "#0E63AD", text: "#FFFFFF" },
  CAR: { bg: "#0070B5", text: "#FFFFFF" },
  MID: { bg: "#DA1A2E", text: "#FFFFFF" },
  COV: { bg: "#78D0F7", text: "#1D2B53" },
  LUT: { bg: "#F78F1E", text: "#06215B" },
};

export const DEFAULT_TEAM_COLOR = { bg: "var(--brand)", text: "#FFFFFF" };

export function getTeamColor(shortName: string): { bg: string; text: string } {
  return TEAM_COLORS[shortName] ?? DEFAULT_TEAM_COLOR;
}

// --- Clean sheet probability ---

// A team's expected goals conceded for a fixture is modelled as the
// player's own expectedGoalsConcededPer90 (their team's defensive rate
// while they're on the pitch), adjusted by how hard the next fixture is.
// FDR 3 (average) is a 1.0x no-op; easier fixtures scale it down, harder
// fixtures scale it up.
export const CLEAN_SHEET_FDR_MULTIPLIERS: Record<number, number> = {
  1: 0.65,
  2: 0.8,
  3: 1.0,
  4: 1.25,
  5: 1.55,
};

// If a player has barely played, their own xGC/90 is unreliable (small
// sample, or a fresh transfer with no minutes yet) — fall back to a
// neutral league-average expected-goals-conceded rate instead.
export const CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE = 180; // ~2 full games
export const CLEAN_SHEET_LEAGUE_AVERAGE_XGC = 1.3;

// --- Optimal XI / formation ---

export const STARTING_XI_SIZE = 11;
export const FORMATION_LIMITS = {
  gk: 1,
  def: { min: 3, max: 5 },
  mid: { min: 2, max: 5 },
  fwd: { min: 1, max: 3 },
} as const;

// Weighting for the GK/DEF "starting XI value" score — distinct from the
// captain score, since attacking output (xGI) barely applies to defensive
// players but clean sheet probability does.
export const DEFENSIVE_VALUE_WEIGHTS = {
  cleanSheet: 0.6,
  xgi: 0.4,
} as const;

// --- Random squad generator ---

export const SQUAD_BUDGET = 1000; // tenths of £m, i.e. £100.0m
export const MAX_PLAYERS_PER_TEAM = 3;
export const SQUAD_POSITION_NEEDS: Record<number, number> = {
  1: 2, // GK
  2: 5, // DEF
  3: 5, // MID
  4: 3, // FWD
};
export const RANDOM_SQUAD_MAX_ATTEMPTS = 25;

// --- Random squad filters (Customize panel) ---

export const DEFAULT_SQUAD_FILTERS: SquadFilters = {
  budgetStyle: "balanced",
  starterReliability: "mixRisk",
  formBias: "ignoreForm",
  teamFocus: "balanced",
};

// Fraction of a position's pool kept after narrowing toward the better end
// of a metric (form, or points-per-million) — a soft nudge, not a strict
// cutoff, so there's always a reasonably-sized random pool left to pick
// from rather than an almost-deterministic top pick.
export const FORM_OR_VALUE_KEEP_FRACTION = 0.4;

// Tighter fraction for Stars & Scrubs' price-based narrowing, since it's
// deliberately picking from the extreme end (priciest for the 2 star
// slots, cheapest for every other slot) rather than just nudging.
export const STARS_AND_SCRUBS_KEEP_FRACTION = 0.15;

// Share of SQUAD_BUDGET routed to the attack sub-draft (MID+FWD's 8 slots)
// under Team Focus. Balanced doesn't use this at all — it runs a single
// unsplit draft over all 15 slots, identical to today's behavior, rather
// than a 50/50-ish split that would subtly differ from it.
export const TEAM_FOCUS_ATTACK_BUDGET_SHARE = {
  attackHeavy: 0.7,
  defenseHeavy: 0.3,
} as const;

// --- Recent form (recency adjustment) ---

// Season-to-date xGI/xGC and minutes-ratio dilute a player's last few
// games with everything from the start of the season — a player who was
// sharp in August but cold for a month still scores well, and a player
// who's lost their place after playing every minute early on still reads
// as "nailed on." Scoring instead prefers the last N gameweeks when
// there's enough of a sample to trust, falling back to season-to-date
// otherwise (see recentForm.ts).
export const RECENT_FORM_WINDOW_GAMEWEEKS = 6;
export const RECENT_FORM_MIN_MINUTES = 180; // ~2 full games, same bar as the clean sheet own-rate gate
