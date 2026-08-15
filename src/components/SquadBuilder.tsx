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
        <div className="flex items-center gap-3">
          {squadPlayers.length > 0 && (
            <button
              type="button"
              onClick={onClearSquad}
              className="text-xs font-semibold text-zinc-400 transition-colors hover:text-risk"
            >
              Clear
            </button>
          )}
          <span className="text-sm font-medium text-zinc-500">
            {squadPlayers.length}/{MAX_SQUAD_SIZE}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <PositionCountBadges squadPlayers={squadPlayers} />
        <span className="whitespace-nowrap text-xs font-bold text-zinc-500">
          {formatPrice(remainingBudget)} left
        </span>
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
