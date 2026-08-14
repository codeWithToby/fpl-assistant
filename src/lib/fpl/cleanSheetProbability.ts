import type { CleanSheetEstimate, Fixture, Player, Team } from "./types";
import { getNextFixtureForTeam } from "./getNextFixtureForTeam";
import {
  CLEAN_SHEET_FDR_MULTIPLIERS,
  CLEAN_SHEET_LEAGUE_AVERAGE_XGC,
  CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE,
} from "./constants";

// Poisson estimate: P(0 goals conceded) = e^-λ, where λ is the expected
// goals conceded for this specific fixture. λ starts from the player's own
// expectedGoalsConcededPer90 (a proxy for their team's defensive rate while
// they're on the pitch) and is scaled by how hard the next fixture is.
export function computeCleanSheetProbability(
  player: Player,
  teams: Team[],
  fixtures: Fixture[]
): CleanSheetEstimate {
  const nextFixture = getNextFixtureForTeam(player.team, fixtures);

  if (!nextFixture) {
    return {
      playerId: player.id,
      probability: 0,
      hasFixtureThisGameweek: false,
      fixture: null,
      usedFallbackRate: false,
    };
  }

  const usedFallbackRate = player.minutes < CLEAN_SHEET_MIN_MINUTES_FOR_OWN_RATE;
  const baseXgc = usedFallbackRate
    ? CLEAN_SHEET_LEAGUE_AVERAGE_XGC
    : player.expectedGoalsConcededPer90;

  const multiplier = CLEAN_SHEET_FDR_MULTIPLIERS[nextFixture.difficulty] ?? 1;
  const adjustedXgc = Math.max(baseXgc * multiplier, 0);
  const probability = Math.round(Math.exp(-adjustedXgc) * 100);

  const opponentTeam = teams.find((t) => t.id === nextFixture.opponentTeamId);

  return {
    playerId: player.id,
    probability,
    hasFixtureThisGameweek: true,
    fixture: {
      opponentShortName: opponentTeam?.shortName ?? "?",
      isHome: nextFixture.isHome,
      fdr: nextFixture.difficulty,
    },
    usedFallbackRate,
  };
}
