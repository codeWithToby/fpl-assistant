import type { Player } from "@/lib/fpl/types";
import { POSITION_LABELS, POSITION_ORDER } from "@/lib/fpl/constants";

export default function PositionCountBadges({
  squadPlayers,
}: {
  squadPlayers: Player[];
}) {
  return (
    <div className="flex gap-2">
      {POSITION_ORDER.map((type) => {
        const count = squadPlayers.filter((p) => p.elementType === type).length;
        return (
          <span
            key={type}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600"
          >
            {POSITION_LABELS[type]} {count}
          </span>
        );
      })}
    </div>
  );
}
