import type { OptimalXIResult } from "@/lib/fpl/types";
import PitchPlayerCard from "./PitchPlayerCard";

// Attacking direction goes up the pitch, so rows render FWD → MID → DEF → GK
// top to bottom — the reverse of POSITION_ORDER, which is GK-first.
const PITCH_ROW_ORDER = [4, 3, 2, 1] as const;

export default function PitchFormation({ result }: { result: OptimalXIResult }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden rounded-[10px] p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] sm:p-5"
        style={{
          background:
            "repeating-linear-gradient(180deg, var(--grass) 0px, var(--grass) 44px, var(--grass-dark) 44px, var(--grass-dark) 88px)",
        }}
      >
        {/* Pitch markings — halfway line + center circle, purely atmospheric */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />

        <div className="relative flex flex-col gap-4 py-2 sm:gap-6 sm:py-4">
          {PITCH_ROW_ORDER.map((type) => {
            const slots = result.starters.filter((s) => s.elementType === type);
            if (slots.length === 0) return null;
            return (
              <div key={type} className="flex flex-wrap items-start justify-evenly gap-2">
                {slots.map((slot) => (
                  <PitchPlayerCard slot={slot} key={slot.playerId} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {result.bench.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">Bench</h3>
          <div className="flex flex-wrap gap-3 rounded-[10px] border border-zinc-200 bg-background p-3">
            {result.bench.map((slot) => (
              <PitchPlayerCard slot={slot} key={slot.playerId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
