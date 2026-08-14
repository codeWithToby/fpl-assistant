import type { OptimalXIResult } from "@/lib/fpl/types";
import PitchPlayerCard from "./PitchPlayerCard";

// Attacking direction goes up the pitch, so rows render FWD → MID → DEF → GK
// top to bottom — the reverse of POSITION_ORDER, which is GK-first.
const PITCH_ROW_ORDER = [4, 3, 2, 1] as const;

// Tailwind's compiler needs full literal class strings, not interpolated
// ones — so top/bottom each get their own explicit set of classes rather
// than building "top-0"/"border-t-0" from a variable.
function GoalBox({ edge }: { edge: "top" | "bottom" }) {
  if (edge === "top") {
    return (
      <>
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 border-2 border-t-0 border-white/25"
          style={{ width: "42%", height: "13%" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 border-2 border-t-0 border-white/25"
          style={{ width: "20%", height: "5.5%" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-1 -translate-x-1/2 rounded-full bg-white/40"
          style={{ width: "12%" }}
        />
      </>
    );
  }
  return (
    <>
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 border-2 border-b-0 border-white/25"
        style={{ width: "42%", height: "13%" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 border-2 border-b-0 border-white/25"
        style={{ width: "20%", height: "5.5%" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-1 -translate-x-1/2 rounded-full bg-white/40"
        style={{ width: "12%" }}
      />
    </>
  );
}

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
        {/* Pitch markings — touchline, halfway line, center circle, and a
            penalty box / six-yard box / goal mouth at each end. Purely
            atmospheric, but they're what makes this read as a pitch. */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/25 sm:h-28 sm:w-28" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
        <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/25" />
        <GoalBox edge="top" />
        <GoalBox edge="bottom" />

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
