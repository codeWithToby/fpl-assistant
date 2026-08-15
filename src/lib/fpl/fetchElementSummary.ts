import { rawElementSummarySchema, parseOrThrow, type RawElementSummary } from "./schemas";

export async function fetchElementSummary(playerId: number): Promise<RawElementSummary> {
  const res = await fetch(`https://fantasy.premierleague.com/api/element-summary/${playerId}/`, {
    headers: { "User-Agent": "fpl-assistant" },
    next: { revalidate: 3600 }, // a player's history changes at most once a gameweek
  });

  if (!res.ok) {
    throw new Error(`FPL element-summary request failed: ${res.status}`);
  }

  const json = await res.json();
  return parseOrThrow(rawElementSummarySchema, json, "element-summary");
}
