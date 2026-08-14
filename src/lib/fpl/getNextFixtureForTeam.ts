import type { Fixture } from "./types";

export interface NextFixtureInfo {
  fixture: Fixture;
  isHome: boolean;
  opponentTeamId: number;
  difficulty: number;
}

// Earliest unplayed, scheduled fixture for a team. Double gameweeks are
// intentionally simplified to "just the first chronological fixture" for
// v1 — a team's second fixture in the same gameweek is ignored here.
export function getNextFixtureForTeam(
  teamId: number,
  fixtures: Fixture[]
): NextFixtureInfo | null {
  const upcoming = fixtures
    .filter(
      (f) =>
        !f.finished &&
        f.event !== null &&
        (f.teamH === teamId || f.teamA === teamId)
    )
    .sort((a, b) => {
      if (a.event !== b.event) return (a.event ?? 0) - (b.event ?? 0);
      if (!a.kickoffTime) return 1;
      if (!b.kickoffTime) return -1;
      return (
        new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()
      );
    });

  const fixture = upcoming[0];
  if (!fixture) return null;

  const isHome = fixture.teamH === teamId;
  return {
    fixture,
    isHome,
    opponentTeamId: isHome ? fixture.teamA : fixture.teamH,
    difficulty: isHome ? fixture.teamHDifficulty : fixture.teamADifficulty,
  };
}
