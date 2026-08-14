"use client";

import { useState } from "react";
import type { OptimalXIResult } from "@/lib/fpl/types";
import { POSITION_LABELS, POSITION_ORDER } from "@/lib/fpl/constants";
import PitchFormation from "./PitchFormation";
import XISlotRow from "./XISlotRow";

export default function OptimalXI({ result }: { result: OptimalXIResult }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <section className="flex flex-col gap-4 rounded-[10px] bg-background p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand dark:text-pitch">
          Optimal starting XI
        </h2>
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
          {result.formation}
        </span>
      </div>

      <PitchFormation result={result} />

      <button
        type="button"
        onClick={() => setShowDetail((v) => !v)}
        className="self-start text-xs font-bold uppercase tracking-wide text-brand-light underline-offset-2 hover:underline dark:text-pitch"
      >
        {showDetail ? "Hide full breakdown" : "See full breakdown"}
      </button>

      {showDetail && (
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          {POSITION_ORDER.map((type) => {
            const slots = result.starters.filter((s) => s.elementType === type);
            if (slots.length === 0) return null;
            return (
              <div key={type} className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                  {POSITION_LABELS[type]}
                </h3>
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                  {slots.map((slot) => (
                    <XISlotRow slot={slot} key={slot.playerId} />
                  ))}
                </div>
              </div>
            );
          })}

          {result.bench.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">Bench</h3>
              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                {result.bench.map((slot) => (
                  <XISlotRow slot={slot} key={slot.playerId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
