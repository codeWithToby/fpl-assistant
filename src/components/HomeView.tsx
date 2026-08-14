"use client";

import { useMemo } from "react";
import type { BootstrapData, FixturesData, Player } from "@/lib/fpl/types";
import { useSquadSelection, MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import { computeCaptainScore } from "@/lib/fpl/scoring";
import { computeOptimalXI } from "@/lib/fpl/optimalXI";
import { getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import HomeGetStarted from "./HomeGetStarted";
import HomeSquadInProgress from "./HomeSquadInProgress";
import HomeCaptainSummaryTile from "./HomeCaptainSummaryTile";
import HomeXISummaryTile from "./HomeXISummaryTile";

interface Props {
  bootstrap: BootstrapData;
  fixtures: FixturesData;
}

export default function HomeView({ bootstrap, fixtures }: Props) {
  const { squadIds, replaceSquad } = useSquadSelection();

  const playersById = useMemo(() => {
    const map = new Map<number, Player>();
    bootstrap.players.forEach((p) => map.set(p.id, p));
    return map;
  }, [bootstrap.players]);

  const squadPlayers = useMemo(
    () =>
      squadIds
        .map((id) => playersById.get(id))
        .filter((p): p is Player => p !== undefined),
    [squadIds, playersById]
  );

  const finishedGameweekCount = useMemo(
    () => getFinishedGameweekCount(bootstrap.events),
    [bootstrap.events]
  );

  const isSquadComplete = squadPlayers.length === MAX_SQUAD_SIZE;

  const topCaptain = useMemo(() => {
    if (!isSquadComplete) return null;
    return (
      squadPlayers
        .map((p) =>
          computeCaptainScore(p, bootstrap.teams, fixtures.fixtures, finishedGameweekCount)
        )
        .filter((r) => r.hasFixtureThisGameweek)
        .sort((a, b) => b.totalScore - a.totalScore)[0] ?? null
    );
  }, [isSquadComplete, squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  const optimalXI = useMemo(() => {
    if (!isSquadComplete) return null;
    return computeOptimalXI(squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount);
  }, [isSquadComplete, squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  if (squadPlayers.length === 0) {
    return (
      <div className="px-4 py-8 md:px-8">
        <HomeGetStarted allPlayers={bootstrap.players} onGenerate={replaceSquad} />
      </div>
    );
  }

  if (!isSquadComplete) {
    return (
      <div className="px-4 py-8 md:px-8">
        <HomeSquadInProgress count={squadPlayers.length} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 md:px-8">
      <HomeCaptainSummaryTile breakdown={topCaptain} />
      {optimalXI && <HomeXISummaryTile result={optimalXI} />}
    </div>
  );
}
