import type { XISlot } from "@/lib/fpl/types";
import { POSITION_LABELS } from "@/lib/fpl/constants";

export default function XISlotRow({ slot }: { slot: XISlot }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-zinc-200 bg-background px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {slot.webName}{" "}
          <span className="font-normal text-zinc-400">{slot.teamShortName}</span>
        </p>
        {slot.rotationRisk && slot.rotationNote && (
          <p className="mt-0.5 text-xs font-medium text-amber-700">
            ⚠ {slot.rotationNote}
          </p>
        )}
      </div>

      <div className="flex flex-none items-center gap-2">
        {slot.cleanSheetProbability !== null && (
          <span className="whitespace-nowrap rounded-full bg-sky/15 px-2.5 py-1 text-xs font-bold text-brand">
            {slot.cleanSheetProbability}% clean sheet
          </span>
        )}
        <span className="whitespace-nowrap rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
          {POSITION_LABELS[slot.elementType]} · {slot.value}
        </span>
      </div>
    </div>
  );
}
