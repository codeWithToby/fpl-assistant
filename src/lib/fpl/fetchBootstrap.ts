import type { BootstrapData, PlayerStatus } from "./types";

const BOOTSTRAP_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";

// Raw shapes are intentionally loose (Record<string, unknown> would be safer
// but noisier here) — we only reach into the specific fields we trim below.
interface RawPlayer {
  id: number;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  minutes: number;
  form: string;
  selected_by_percent: string;
  expected_goals_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  status: string;
  chance_of_playing_next_round: number | null;
}

interface RawTeam {
  id: number;
  name: string;
  short_name: string;
}

interface RawEvent {
  id: number;
  name: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}

interface RawElementType {
  id: number;
  singular_name: string;
  squad_select: number;
}

interface RawBootstrap {
  elements: RawPlayer[];
  teams: RawTeam[];
  events: RawEvent[];
  element_types: RawElementType[];
}

export async function fetchBootstrap(): Promise<BootstrapData> {
  const res = await fetch(BOOTSTRAP_URL, {
    headers: { "User-Agent": "fpl-assistant" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`FPL bootstrap-static request failed: ${res.status}`);
  }

  const raw: RawBootstrap = await res.json();

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
    })),
    elementTypes: raw.element_types.map((et) => ({
      id: et.id,
      singularName: et.singular_name,
      squadSelect: et.squad_select,
    })),
  };
}
