import type { GameweekEvent } from "./types";

// The "current" gameweek for planning purposes is the next one to kick off
// (deadline hasn't passed yet). Falls back to the in-progress gameweek if
// for some reason there's no "next" one (e.g. final gameweek of the season).
export function getCurrentGameweek(
  events: GameweekEvent[]
): GameweekEvent | null {
  return events.find((e) => e.isNext) ?? events.find((e) => e.isCurrent) ?? null;
}

export function getFinishedGameweekCount(events: GameweekEvent[]): number {
  return events.filter((e) => e.finished).length;
}
