import type { OptimalXIResult } from "@/lib/fpl/types";
import { POSITION_LABELS, POSITION_ORDER } from "@/lib/fpl/constants";
import XISlotRow from "./XISlotRow";

export default function OptimalXI({ result }: { result: OptimalXIResult }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          Optimal starting XI
        </h2>
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
          {result.formation}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {POSITION_ORDER.map((type) => {
          const slots = result.starters.filter((s) => s.elementType === type);
          if (slots.length === 0) return null;
          return (
            <div key={type} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                {POSITION_LABELS[type]}
              </h3>
              <div className="flex flex-col gap-2">
                {slots.map((slot) => (
                  <XISlotRow slot={slot} key={slot.playerId} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {result.bench.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">Bench</h3>
          <div className="flex flex-col gap-2">
            {result.bench.map((slot) => (
              <XISlotRow slot={slot} key={slot.playerId} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
