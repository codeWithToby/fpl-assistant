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
