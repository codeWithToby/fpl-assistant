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

export const POSITION_ORDER = [1, 2, 3, 4] as const;

export function formatPrice(nowCost: number): string {
  return `£${(nowCost / 10).toFixed(1)}m`;
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
