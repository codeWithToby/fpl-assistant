"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BootstrapData, FixturesData, Player } from "@/lib/fpl/types";
import { useSquadSelection, MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import { computeOptimalXI } from "@/lib/fpl/optimalXI";
import { computeCaptainScore } from "@/lib/fpl/scoring";
import { getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import OptimalXI from "./OptimalXI";

interface Props {
  bootstrap: BootstrapData;
  fixtures: FixturesData;
}

export default function OptimalXIView({ bootstrap, fixtures }: Props) {
  const { squadIds } = useSquadSelection();

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

  const optimalXI = useMemo(() => {
    if (!isSquadComplete) return null;
    return computeOptimalXI(squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount);
  }, [isSquadComplete, squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  const topCaptain = useMemo(() => {
    if (!isSquadComplete) return null;
    return squadPlayers
      .map((p) => computeCaptainScore(p, bootstrap.teams, fixtures.fixtures, finishedGameweekCount))
      .filter((r) => r.hasFixtureThisGameweek)
      .sort((a, b) => b.totalScore - a.totalScore)[0] ?? null;
  }, [isSquadComplete, squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  if (!isSquadComplete) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 text-center md:px-8">
        <p className="text-sm text-zinc-500">
          Your Optimal XI needs a full squad — you&apos;ve got {squadPlayers.length}/
          {MAX_SQUAD_SIZE} so far.
        </p>
        <Link
          href="/squad"
          className="mx-auto rounded-[10px] bg-brand-light px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand"
        >
          Finish your squad
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
      {topCaptain && (
        <p className="text-center text-xs text-zinc-500">
          Captain pick: <span className="font-semibold text-foreground">{topCaptain.webName}</span>{" "}
          ·{" "}
          <Link href="/captain" className="font-semibold text-brand-light hover:text-brand">
            full reasoning →
          </Link>
        </p>
      )}
      {optimalXI && <OptimalXI result={optimalXI} />}
    </div>
  );
}
