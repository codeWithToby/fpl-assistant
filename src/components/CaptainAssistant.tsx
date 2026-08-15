"use client";

import { useMemo, useState } from "react";
import type { BootstrapData, FixturesData, Player } from "@/lib/fpl/types";
import { useSquadSelection, MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import { useRecentForm } from "@/hooks/useRecentForm";
import { computeCaptainScore } from "@/lib/fpl/scoring";
import { computeOptimalXI } from "@/lib/fpl/optimalXI";
import { getCurrentGameweek, getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import SquadBuilder from "./SquadBuilder";
import SquadProgress from "./SquadProgress";
import CaptainRecommendations from "./CaptainRecommendations";
import OptimalXI from "./OptimalXI";

interface Props {
  bootstrap: BootstrapData;
  fixtures: FixturesData;
  isStale?: boolean;
}

export default function CaptainAssistant({ bootstrap, fixtures, isStale = false }: Props) {
  const { squadIds, addPlayer, removePlayer, replaceSquad, isFull } = useSquadSelection(
    bootstrap.players
  );

  const [positionFilter, setPositionFilter] = useState<number | null>(null);

  // A pitch-slot click on the empty build pitch sets this filter so the
  // sidebar search jumps straight to that position; any bulk squad change
  // (add, random, import, clear) should drop a now-stale filter.
  const handleAdd = (id: number) => {
    addPlayer(id);
    setPositionFilter(null);
  };

  const handleReplaceSquad = (ids: number[]) => {
    replaceSquad(ids);
    setPositionFilter(null);
  };

  const handleClearSquad = () => {
    if (window.confirm("Clear your entire squad? This can't be undone.")) {
      handleReplaceSquad([]);
    }
  };

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

  // Same players, with season-to-date xGI/xGC/minutes-ratio swapped for
  // last-6-gameweek figures where the sample's reliable enough — see
  // useRecentForm.ts. Only used for scoring below; squadPlayers itself
  // still drives the sidebar/build-pitch display, which doesn't care.
  const enrichedSquadPlayers = useRecentForm(squadPlayers);

  const finishedGameweekCount = useMemo(
    () => getFinishedGameweekCount(bootstrap.events),
    [bootstrap.events]
  );

  const currentGameweekId = useMemo(
    () => getCurrentGameweek(bootstrap.events)?.id ?? null,
    [bootstrap.events]
  );

  const recommendations = useMemo(() => {
    return enrichedSquadPlayers
      .map((p) =>
        computeCaptainScore(p, bootstrap.teams, fixtures.fixtures, finishedGameweekCount)
      )
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [enrichedSquadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  const ranked = recommendations.filter((r) => r.hasFixtureThisGameweek);
  const noFixture = recommendations.filter((r) => !r.hasFixtureThisGameweek);

  const isSquadComplete = squadPlayers.length === MAX_SQUAD_SIZE;

  const optimalXI = useMemo(() => {
    if (!isSquadComplete) return null;
    return computeOptimalXI(
      enrichedSquadPlayers,
      bootstrap.teams,
      fixtures.fixtures,
      finishedGameweekCount
    );
  }, [isSquadComplete, enrichedSquadPlayers, bootstrap.teams, fixtures.fixtures, finishedGameweekCount]);

  return (
    <div className="flex flex-col">
      {/* Masthead — FPL's own purple-to-green gradient, used once here as
          the identifying brand moment rather than scattered everywhere. */}
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">
            Your FPL Assistant
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

      {isStale && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center lg:px-8">
          <p className="text-xs font-medium text-amber-800">
            Showing cached data — live FPL data is temporarily unavailable.
          </p>
        </div>
      )}

      {/* Single column on mobile; sidebar (squad) + main content (insights)
          on wide screens, like a normal web app rather than a stretched
          phone layout. The squad panel stays sticky on desktop so it's
          visible while scrolling through recommendations. */}
      <div className="mx-auto -mt-6 w-full max-w-7xl px-4 pb-12 md:-mt-8 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8 lg:px-8">
        <div className="lg:sticky lg:top-20">
          <SquadBuilder
            allPlayers={bootstrap.players}
            teams={bootstrap.teams}
            squadPlayers={squadPlayers}
            currentGameweekId={currentGameweekId}
            onAdd={handleAdd}
            onRemove={removePlayer}
            onReplaceSquad={handleReplaceSquad}
            onClearSquad={handleClearSquad}
            isFull={isFull}
            positionFilter={positionFilter}
            onClearPositionFilter={() => setPositionFilter(null)}
          />
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:mt-0">
          {squadPlayers.length > 0 && (
            <CaptainRecommendations ranked={ranked} noFixture={noFixture} />
          )}

          {!isSquadComplete && (
            <SquadProgress
              squadPlayers={squadPlayers}
              teams={bootstrap.teams}
              onSlotClick={setPositionFilter}
              onRemove={removePlayer}
            />
          )}

          {optimalXI && <OptimalXI result={optimalXI} />}
        </div>
      </div>
    </div>
  );
}
