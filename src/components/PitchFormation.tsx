import type { OptimalXIResult } from "@/lib/fpl/types";
import PitchPlayerCard from "./PitchPlayerCard";
import PitchMarkings from "./PitchMarkings";

// Attacking direction goes up the pitch, so rows render FWD → MID → DEF → GK
// top to bottom — the reverse of POSITION_ORDER, which is GK-first.
const PITCH_ROW_ORDER = [4, 3, 2, 1] as const;

export default function PitchFormation({ result }: { result: OptimalXIResult }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative min-h-[520px] overflow-hidden rounded-[10px] border-2 border-white/25 p-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] sm:min-h-[640px] sm:p-5"
        style={{
          background:
            "repeating-linear-gradient(180deg, var(--grass) 0px, var(--grass) 44px, var(--grass-dark) 44px, var(--grass-dark) 88px)",
        }}
      >
        <PitchMarkings />

        <div className="relative flex h-full min-h-[480px] flex-col justify-between py-4 sm:min-h-[600px] sm:py-8">
          {PITCH_ROW_ORDER.map((type) => {
            const slots = result.starters.filter((s) => s.elementType === type);
            if (slots.length === 0) return null;
            return (
              <div key={type} className="flex flex-wrap items-start justify-evenly gap-2 px-1">
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
