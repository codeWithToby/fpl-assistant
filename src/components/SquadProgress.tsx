import type { Player, Team } from "@/lib/fpl/types";
import { MAX_SQUAD_SIZE } from "@/hooks/useSquadSelection";
import BuildPitch from "./BuildPitch";

interface Props {
  squadPlayers: Player[];
  teams: Team[];
  onSlotClick: (type: number) => void;
  onRemove: (id: number) => void;
}

export default function SquadProgress({ squadPlayers, teams, onSlotClick, onRemove }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-[10px] bg-background p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand dark:text-pitch">
          Your squad
        </h2>
        <span className="text-sm font-medium text-zinc-500">
          {squadPlayers.length}/{MAX_SQUAD_SIZE}
        </span>
      </div>

      <BuildPitch
        squadPlayers={squadPlayers}
        teams={teams}
        onSlotClick={onSlotClick}
        onRemove={onRemove}
      />
    </section>
  );
}
