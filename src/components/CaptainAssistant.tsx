"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BootstrapData, FixturesData, Player } from "@/lib/fpl/types";
import { useSquadSelection, MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import { useRecentForm } from "@/hooks/useRecentForm";
import { computeCaptainScore } from "@/lib/fpl/scoring";
import { computeOptimalXI } from "@/lib/fpl/optimalXI";
import { generateRandomSquad } from "@/lib/fpl/randomSquad";
import { getCurrentGameweek, getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import { track } from "@/lib/analytics/track";
import ConfirmDialog from "./ConfirmDialog";
import SquadBuilder from "./SquadBuilder";
import SquadProgress from "./SquadProgress";
import CaptainRecommendations from "./CaptainRecommendations";
import OptimalXI from "./OptimalXI";
import DeadlineBadge from "./DeadlineBadge";

interface Props {
  bootstrap: BootstrapData;
  fixtures: FixturesData;
  isStale?: boolean;
}

export default function CaptainAssistant({ bootstrap, fixtures, isStale = false }: Props) {
  const { squadIds, addPlayer, removePlayer, replaceSquad, isFull, remainingBudget, hydrated } =
    useSquadSelection(bootstrap.players);

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

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearSquad = () => {
    setShowClearConfirm(true);
  };

  // "Jump straight to a random squad" links from the landing page and How
  // It Works arrive here as /squad?random=1 — without this, that promise
  // was broken for any returning user: the page just hydrated whatever was
  // already in localStorage and the link did nothing. This overrides that
  // squad on arrival (no confirm — clicking a link that says "random squad"
  // is the confirmation) and strips the param so a later refresh doesn't
  // keep re-randomizing.
  const randomRequestHandledRef = useRef(false);

  useEffect(() => {
    if (!hydrated || randomRequestHandledRef.current) return;
    randomRequestHandledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    if (params.get("random") !== "1") return;

    const squad = generateRandomSquad(bootstrap.players);
    if (squad) {
      handleReplaceSquad(squad);
    }

    params.delete("random");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [hydrated, bootstrap.players]);

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

  const currentGameweek = useMemo(
    () => getCurrentGameweek(bootstrap.events),
    [bootstrap.events]
  );
  const currentGameweekId = currentGameweek?.id ?? null;

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

  // Fires once per genuine in-session completion — not on page load when a
  // returning user's localStorage squad is already full, which would look
  // identical to isSquadComplete otherwise. The first post-hydration render
  // just records the starting point instead of firing.
  const baselineSetRef = useRef(false);
  const wasCompleteRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!baselineSetRef.current) {
      baselineSetRef.current = true;
      wasCompleteRef.current = isSquadComplete;
      return;
    }
    if (isSquadComplete && !wasCompleteRef.current) {
      track("squad_completed", { squad_size: squadPlayers.length });
    }
    wasCompleteRef.current = isSquadComplete;
  }, [hydrated, isSquadComplete, squadPlayers.length]);

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
      {showClearConfirm && (
        <ConfirmDialog
          message="Clear your entire squad? This can't be undone."
          onConfirm={() => {
            handleReplaceSquad([]);
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {/* Masthead — FPL's own purple-to-green gradient, used once here as
          the identifying brand moment rather than scattered everywhere. */}
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">
            Your FPL Assistant
          </span>

          {currentGameweek && (
            <div className="mt-3">
              <DeadlineBadge
                gameweekName={currentGameweek.name}
                deadlineTime={currentGameweek.deadlineTime}
              />
            </div>
          )}

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
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
            remainingBudget={remainingBudget}
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
