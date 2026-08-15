import type { Player, RecentFormStats } from "./types";
import type { RawElementHistoryEntry } from "./schemas";
import { RECENT_FORM_MIN_MINUTES, RECENT_FORM_WINDOW_GAMEWEEKS } from "./constants";

// Computes recency stats from a player's element-summary history — the
// last RECENT_FORM_WINDOW_GAMEWEEKS gameweeks only, not the season to
// date. xgi/xgc come back null when the recent-minutes sample is too
// small to trust (e.g. a couple of substitute cameos), so callers fall
// back to season-to-date data instead of overreacting to a tiny sample.
// minutesRatio has no such gate — a player who's played 0 recent minutes
// after starting all season is exactly the signal this exists to catch.
export function computeRecentForm(history: RawElementHistoryEntry[]): RecentFormStats {
  const recent = history.slice(-RECENT_FORM_WINDOW_GAMEWEEKS);

  const recentMinutes = recent.reduce((sum, gw) => sum + gw.minutes, 0);
  const recentXgi = recent.reduce(
    (sum, gw) => sum + (parseFloat(gw.expected_goal_involvements) || 0),
    0
  );
  const recentXgc = recent.reduce(
    (sum, gw) => sum + (parseFloat(gw.expected_goals_conceded) || 0),
    0
  );

  const hasReliableSample = recentMinutes >= RECENT_FORM_MIN_MINUTES;

  return {
    recentMinutes,
    recentGameweeksConsidered: recent.length,
    xgiPer90: hasReliableSample ? (recentXgi / recentMinutes) * 90 : null,
    xgcPer90: hasReliableSample ? (recentXgc / recentMinutes) * 90 : null,
    minutesRatio: recent.length > 0 ? recentMinutes / (recent.length * 90) : null,
  };
}

// Merges recency stats onto a season player — overriding the per-90
// fields computeCaptainScore/computeCleanSheetProbability already read
// (so neither needs to change) and adding recentMinutesRatio for the
// nailed-on check. Falls back to the season figure per field whenever
// the recent sample's too thin to trust.
export function applyRecentForm(player: Player, recent: RecentFormStats): Player {
  return {
    ...player,
    expectedGoalInvolvementsPer90: recent.xgiPer90 ?? player.expectedGoalInvolvementsPer90,
    expectedGoalsConcededPer90: recent.xgcPer90 ?? player.expectedGoalsConcededPer90,
    recentMinutesRatio: recent.minutesRatio,
  };
}
