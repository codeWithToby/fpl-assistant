import type { XISlot } from "@/lib/fpl/types";

export default function PitchPlayerCard({ slot }: { slot: XISlot }) {
  return (
    <div className="flex w-16 flex-col items-center gap-1 text-center sm:w-20">
      <div className="w-full rounded-[8px] bg-white px-1.5 py-1 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.5)]">
        <p className="truncate text-[11px] font-bold text-brand sm:text-xs">{slot.webName}</p>
        <p className="truncate text-[9px] font-medium text-zinc-500 sm:text-[10px]">
          {slot.teamShortName}
        </p>
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
