"use client";

import { useMemo } from "react";
import type { BootstrapData, FixturesData, Player } from "@/lib/fpl/types";
import { useSquadSelection } from "@/hooks/useSquadSelection";
import { computeCaptainScore } from "@/lib/fpl/scoring";
import { getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import SquadBuilder from "./SquadBuilder";
import CaptainRecommendations from "./CaptainRecommendations";

interface Props {
  bootstrap: BootstrapData;
  fixtures: FixturesData;
}

export default function CaptainAssistant({ bootstrap, fixtures }: Props) {
  const { squadIds, addPlayer, removePlayer, isFull } = useSquadSelection();

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

  return (
    <div className="flex flex-col">
      {/* Masthead — FPL's own purple-to-green gradient, used once here as
          the identifying brand moment rather than scattered everywhere. */}
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">
            FPL Captain Assistant
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Who should you captain?
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            Build your squad below and we&apos;ll make the call — xGI, fixture
            difficulty, and form combined into one ranked pick with the
            reasoning behind it.
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-6 flex w-full max-w-2xl flex-col gap-8 px-4 pb-12 md:-mt-8">
        <SquadBuilder
          allPlayers={bootstrap.players}
          teams={bootstrap.teams}
          squadPlayers={squadPlayers}
          onAdd={addPlayer}
          onRemove={removePlayer}
          isFull={isFull}
        />

        {squadPlayers.length > 0 && (
          <CaptainRecommendations ranked={ranked} noFixture={noFixture} />
        )}
      </div>
    </div>
  );
}
