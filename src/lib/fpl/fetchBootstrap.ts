import type { BootstrapData, PlayerStatus } from "./types";
import { withFallback } from "./fetchWithFallback";
import { rawBootstrapSchema, parseOrThrow } from "./schemas";

const BOOTSTRAP_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";

async function fetchBootstrapRaw(): Promise<BootstrapData> {
  const res = await fetch(BOOTSTRAP_URL, {
    headers: { "User-Agent": "fpl-assistant" },
    next: { revalidate: 3600 },
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

// Serves last-known-good bootstrap data if the live fetch fails (FPL
// down, blocked, or a schema-breaking change on their end) rather than
// crashing the page. See fetchWithFallback.ts for the "why".
export const fetchBootstrap = withFallback(fetchBootstrapRaw);
