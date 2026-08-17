import { useMemo } from "react";
import type { Player, Team } from "@/lib/fpl/types";
import { MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import { formatPrice } from "@/lib/fpl/constants";
import ImportSquadForm from "./ImportSquadForm";
import PlayerSearchCombobox from "./PlayerSearchCombobox";
import PositionCountBadges from "./PositionCountBadges";
import RandomSquadButton from "./RandomSquadButton";
import SquadList from "./SquadList";

interface Props {
  allPlayers: Player[];
  teams: Team[];
  squadPlayers: Player[];
  currentGameweekId: number | null;
  finishedGameweekCount: number;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onReplaceSquad: (ids: number[]) => void;
  onClearSquad: () => void;
  isFull: boolean;
  positionFilter: number | null;
  onClearPositionFilter: () => void;
  remainingBudget: number;
}

export default function SquadBuilder({
  allPlayers,
  teams,
  squadPlayers,
  currentGameweekId,
  finishedGameweekCount,
  onAdd,
  onRemove,
  onReplaceSquad,
  onClearSquad,
  isFull,
  positionFilter,
  onClearPositionFilter,
  remainingBudget,
}: Props) {
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

      <div className="flex items-center gap-1.5">
        <span className="whitespace-nowrap rounded-full bg-sky/15 px-2.5 py-1 text-xs font-bold text-brand dark:text-pitch">
          {formatPrice(remainingBudget)} left
        </span>
        {squadPlayers.length > 0 && (
          <button
            type="button"
            onClick={onClearSquad}
            aria-label="Clear squad"
            className="flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 text-xs font-bold text-zinc-500 transition-colors hover:border-risk hover:text-risk dark:border-zinc-700 dark:text-zinc-400"
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M3 4.5h10M6 4.5V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M4.5 4.5 5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Clear
          </button>
        )}
      </div>

      <ImportSquadForm
        currentGameweekId={currentGameweekId}
        onImport={onReplaceSquad}
        hasSquad={squadPlayers.length > 0}
      />

      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        or
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <RandomSquadButton
        allPlayers={allPlayers}
        onGenerate={onReplaceSquad}
        hasSquad={squadPlayers.length > 0}
        finishedGameweekCount={finishedGameweekCount}
      />

      <PlayerSearchCombobox
        allPlayers={allPlayers}
        teams={teams}
        excludeIds={new Set(squadPlayers.map((p) => p.id))}
        onSelect={onAdd}
        disabled={isFull}
        positionCounts={positionCounts}
        positionFilter={positionFilter}
        onClearPositionFilter={onClearPositionFilter}
        remainingBudget={remainingBudget}
      />

      <SquadList squadPlayers={squadPlayers} teams={teams} onRemove={onRemove} />
    </section>
  );
}
