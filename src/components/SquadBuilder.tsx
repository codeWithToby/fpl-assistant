"use client";

import { useMemo, useState } from "react";
import type { Player, Team } from "@/lib/fpl/types";
import { MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import ImportSquadForm from "./ImportSquadForm";
import PlayerSearchCombobox from "./PlayerSearchCombobox";
import PositionCountBadges from "./PositionCountBadges";
import RandomSquadButton from "./RandomSquadButton";
import SquadList from "./SquadList";
import SquadPitch from "./SquadPitch";

interface Props {
  allPlayers: Player[];
  teams: Team[];
  squadPlayers: Player[];
  currentGameweekId: number | null;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onReplaceSquad: (ids: number[]) => void;
  isFull: boolean;
}

export default function SquadBuilder({
  allPlayers,
  teams,
  squadPlayers,
  currentGameweekId,
  onAdd,
  onRemove,
  onReplaceSquad,
  isFull,
}: Props) {
  const [positionFilter, setPositionFilter] = useState<number | null>(null);
  const [showFullList, setShowFullList] = useState(false);

  const positionCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    squadPlayers.forEach((p) => {
      counts[p.elementType] = (counts[p.elementType] ?? 0) + 1;
    });
    return counts;
  }, [squadPlayers]);

  return (
    <section className="flex flex-col gap-4 rounded-[10px] bg-background p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          Your squad
        </h2>
        <span className="text-sm font-medium text-zinc-500">
          {squadPlayers.length}/{MAX_SQUAD_SIZE}
        </span>
      </div>

      <PositionCountBadges squadPlayers={squadPlayers} />

      <ImportSquadForm currentGameweekId={currentGameweekId} onImport={onReplaceSquad} />

      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        or
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <RandomSquadButton allPlayers={allPlayers} onGenerate={onReplaceSquad} />

      <PlayerSearchCombobox
        allPlayers={allPlayers}
        teams={teams}
        excludeIds={new Set(squadPlayers.map((p) => p.id))}
        onSelect={(id) => {
          onAdd(id);
          setPositionFilter(null);
        }}
        disabled={isFull}
        positionCounts={positionCounts}
        positionFilter={positionFilter}
        onClearPositionFilter={() => setPositionFilter(null)}
      />

      <SquadPitch
        squadPlayers={squadPlayers}
        teams={teams}
        onSlotClick={setPositionFilter}
        onRemove={onRemove}
      />

      {squadPlayers.length > 0 && (
        <button
          type="button"
          onClick={() => setShowFullList((v) => !v)}
          className="self-start text-xs font-bold uppercase tracking-wide text-brand-light underline-offset-2 hover:underline dark:text-pitch"
        >
          {showFullList ? "Hide full list" : "See full list"}
        </button>
      )}

      {showFullList && <SquadList squadPlayers={squadPlayers} teams={teams} onRemove={onRemove} />}
    </section>
  );
}
