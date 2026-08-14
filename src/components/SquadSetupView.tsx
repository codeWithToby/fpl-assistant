"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BootstrapData, Player } from "@/lib/fpl/types";
import { useSquadSelection } from "@/hooks/useSquadSelection";
import { getCurrentGameweek } from "@/lib/fpl/getCurrentGameweek";
import SquadBuilder from "./SquadBuilder";

interface Props {
  bootstrap: BootstrapData;
}

export default function SquadSetupView({ bootstrap }: Props) {
  const { squadIds, addPlayer, removePlayer, replaceSquad, isFull } = useSquadSelection();

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

  const currentGameweekId = useMemo(
    () => getCurrentGameweek(bootstrap.events)?.id ?? null,
    [bootstrap.events]
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 md:px-8">
      <SquadBuilder
        allPlayers={bootstrap.players}
        teams={bootstrap.teams}
        squadPlayers={squadPlayers}
        currentGameweekId={currentGameweekId}
        onAdd={addPlayer}
        onRemove={removePlayer}
        onReplaceSquad={replaceSquad}
        isFull={isFull}
      />

      {isFull && (
        <div className="rounded-[10px] border border-pitch-dark/30 bg-pitch-soft p-4">
          <p className="text-sm font-semibold text-foreground">
            Squad complete — here&apos;s what&apos;s next
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/captain"
              className="text-sm font-bold text-brand-light hover:text-brand"
            >
              See your captain pick →
            </Link>
            <Link href="/xi" className="text-sm font-bold text-brand-light hover:text-brand">
              View optimal XI →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
