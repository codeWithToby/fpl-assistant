import { unstable_cache } from "next/cache";
import type { BootstrapData, PlayerStatus } from "./types";
import { withFallback } from "./fetchWithFallback";
import { rawBootstrapSchema, parseOrThrow } from "./schemas";
import { getCurrentGameweek } from "./getCurrentGameweek";

const BOOTSTRAP_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";

// Fine for the bulk of this payload — prices, ownership, season stats
// barely move hour to hour.
const DEFAULT_REVALIDATE_SECONDS = 3600;

// Once the deadline we're actually planning around gets this close, the
// volatile fields (a player's fitness status can flip with a single press
// conference) deserve a much shorter cache than the rest of the payload —
// this is exactly the "pre-deadline scramble" moment the product exists
// for, and the moment a stale fitness flag is most costly to get wrong.
const NEAR_DEADLINE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
const NEAR_DEADLINE_REVALIDATE_SECONDS = 300; // 5 minutes

// The raw bootstrap-static response is ~2MB — over Next's per-entry Data
// Cache limit, so letting fetch's own `next.revalidate` try to cache it
// directly silently fails on every request (logged as "items over 2MB can
// not be cached"), meaning it was never actually caching anything at all,
// at any revalidate window. `cache: "no-store"` here opts this fetch out
// of that layer entirely; caching instead happens below, via
// unstable_cache, on the already-trimmed BootstrapData this returns —
// a small fraction of the raw payload's size, comfortably under the cap.
async function fetchAndParseBootstrap(): Promise<BootstrapData> {
  const res = await fetch(BOOTSTRAP_URL, {
    headers: { "User-Agent": "fpl-assistant" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`FPL bootstrap-static request failed: ${res.status}`);
  }

  const json = await res.json();
  const raw = parseOrThrow(rawBootstrapSchema, json, "bootstrap-static");

  return {
    players: raw.elements.map((p) => ({
      id: p.id,
      webName: p.web_name,
      team: p.team,
      elementType: p.element_type,
      nowCost: p.now_cost,
      minutes: p.minutes,
      form: parseFloat(p.form) || 0,
      selectedByPercent: parseFloat(p.selected_by_percent) || 0,
      expectedGoalsPer90: p.expected_goals_per_90 ?? 0,
      expectedAssistsPer90: p.expected_assists_per_90 ?? 0,
      expectedGoalInvolvementsPer90: p.expected_goal_involvements_per_90 ?? 0,
      expectedGoalsConcededPer90: p.expected_goals_conceded_per_90 ?? 0,
      status: p.status as PlayerStatus,
      chanceOfPlayingNextRound: p.chance_of_playing_next_round,
      totalPoints: p.total_points,
    })),
    teams: raw.teams.map((t) => ({
      id: t.id,
      name: t.name,
      shortName: t.short_name,
    })),
    events: raw.events.map((e) => ({
      id: e.id,
      name: e.name,
      isCurrent: e.is_current,
      isNext: e.is_next,
      finished: e.finished,
      deadlineTime: e.deadline_time,
    })),
    elementTypes: raw.element_types.map((et) => ({
      id: et.id,
      singularName: et.singular_name,
      squadSelect: et.squad_select,
    })),
  };
}

// Two separately-keyed caches over the same underlying fetch, one per
// revalidate tier — same idea as before, just caching our own slim object
// instead of asking fetch to cache FPL's raw response.
const getBootstrap = unstable_cache(fetchAndParseBootstrap, ["bootstrap-static"], {
  revalidate: DEFAULT_REVALIDATE_SECONDS,
});
const getBootstrapNearDeadline = unstable_cache(
  fetchAndParseBootstrap,
  ["bootstrap-static-near-deadline"],
  { revalidate: NEAR_DEADLINE_REVALIDATE_SECONDS }
);

export function isNearDeadline(bootstrap: BootstrapData): boolean {
  const gameweek = getCurrentGameweek(bootstrap.events);
  if (!gameweek) return false;
  const msUntilDeadline = new Date(gameweek.deadlineTime).getTime() - Date.now();
  return msUntilDeadline > 0 && msUntilDeadline <= NEAR_DEADLINE_WINDOW_MS;
}

// Serves last-known-good bootstrap data if the live fetch fails (FPL
// down, blocked, or a schema-breaking change on their end) rather than
// crashing the page. See fetchWithFallback.ts for the "why".
export const fetchBootstrap = withFallback(async () => {
  // The deadline schedule itself barely needs better-than-hourly precision
  // to know whether we're inside the pre-deadline window — deadlines are
  // fixed well in advance and don't move — so this first read stays on
  // the standard hour-long cache regardless, and doubles as the actual
  // data used outside that window (not wasted work).
  const baseline = await getBootstrap();
  if (!isNearDeadline(baseline)) return baseline;

  // Inside the window, the hour-old copy just read is too coarse for
  // fitness/status specifically — pull a fresh (short-cached) copy instead
  // of reusing it. Only pays this extra request during the narrow window
  // it actually matters, not on every visit all week.
  return getBootstrapNearDeadline();
});
