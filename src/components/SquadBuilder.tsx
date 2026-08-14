import type { Player, Team } from "@/lib/fpl/types";
import { MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import PlayerSearchCombobox from "./PlayerSearchCombobox";
import PositionCountBadges from "./PositionCountBadges";
import SquadList from "./SquadList";

interface Props {
  allPlayers: Player[];
  teams: Team[];
  squadPlayers: Player[];
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  isFull: boolean;
}

export default function SquadBuilder({
  allPlayers,
  teams,
  squadPlayers,
  onAdd,
  onRemove,
  isFull,
}: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Your squad
        </h2>
        <span className="text-sm font-medium text-zinc-500">
          {squadPlayers.length}/{MAX_SQUAD_SIZE}
        </span>
      </div>

      <PositionCountBadges squadPlayers={squadPlayers} />

      <PlayerSearchCombobox
        allPlayers={allPlayers}
        teams={teams}
        excludeIds={new Set(squadPlayers.map((p) => p.id))}
        onSelect={onAdd}
        disabled={isFull}
      />

      <SquadList squadPlayers={squadPlayers} teams={teams} onRemove={onRemove} />
    </section>
  );
}
