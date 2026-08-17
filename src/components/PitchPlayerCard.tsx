import type { XISlot } from "@/lib/fpl/types";
import { formatPrice, getTeamColor } from "@/lib/fpl/constants";

export default function PitchPlayerCard({ slot }: { slot: XISlot }) {
  const color = getTeamColor(slot.teamShortName);

  return (
    <div className="flex w-20 flex-col items-center gap-1 text-center sm:w-24">
      <div className="relative w-full">
        <span
          className="absolute -left-1.5 -top-1.5 z-10 whitespace-nowrap rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.4)]"
        >
          {formatPrice(slot.nowCost)}
        </span>
        <div
          className="w-full rounded-[8px] px-1.5 py-1.5 pt-3 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5)]"
          style={{ background: color.bg, color: color.text }}
        >
          <p className="text-[11px] font-bold leading-tight sm:text-xs">{slot.webName}</p>
          <p className="truncate text-[9px] font-medium opacity-80 sm:text-[10px]">
            {slot.opponentShortName
              ? `${slot.opponentShortName} (${slot.isHome ? "H" : "A"})`
              : slot.teamShortName}
          </p>
        </div>
      </div>
      {slot.cleanSheetProbability !== null && (
        <span className="whitespace-nowrap rounded-full bg-pitch px-1.5 py-0.5 text-[9px] font-bold text-brand">
          {slot.cleanSheetProbability}% CS
        </span>
      )}
      {slot.rotationRisk && (
        <span className="whitespace-nowrap rounded-full bg-warning px-1.5 py-0.5 text-[9px] font-bold text-brand">
          ⚠ risk
        </span>
      )}
    </div>
  );
}
