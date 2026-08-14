"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BootstrapData, FixturesData, Player } from "@/lib/fpl/types";
import { useSquadSelection, MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import { computeCaptainScore } from "@/lib/fpl/scoring";
import { getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import CaptainRecommendations from "./CaptainRecommendations";

interface Props {
  bootstrap: BootstrapData;
  fixtures: FixturesData;
}

export default function CaptainCallView({ bootstrap, fixtures }: Props) {
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

  const recommendations = useMemo(() => {
    return squadPlayers
      .map((p) =>
        computeCaptainScore(p, bootstrap.teams, fixtures.fixtures, finishedGameweekCount)
      )
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [squadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  const ranked = recommendations.filter((r) => r.hasFixtureThisGameweek);
  const noFixture = recommendations.filter((r) => !r.hasFixtureThisGameweek);
  const isSquadComplete = squadPlayers.length === MAX_SQUAD_SIZE;

  if (squadPlayers.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-8 text-center md:px-8">
        <p className="text-sm text-zinc-500">
          Add your squad first — the captain call needs to know who you&apos;ve got.
        </p>
        <Link
          href="/squad"
          className="mx-auto rounded-[10px] bg-brand-light px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand"
        >
          Build your squad
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
      <CaptainRecommendations ranked={ranked} noFixture={noFixture} />

      {isSquadComplete ? (
        <Link
          href="/xi"
          className="text-center text-sm font-bold text-brand-light hover:text-brand"
        >
          See your full starting XI →
        </Link>
      ) : (
        <p className="text-center text-xs text-zinc-400">
          Add all {MAX_SQUAD_SIZE - squadPlayers.length} more player
          {MAX_SQUAD_SIZE - squadPlayers.length === 1 ? "" : "s"} for a fuller picture, and to
          unlock your Optimal XI —{" "}
          <Link href="/squad" className="font-semibold text-brand-light hover:text-brand">
            back to Squad Setup
          </Link>
        </p>
      )}
    </div>
  );
}
