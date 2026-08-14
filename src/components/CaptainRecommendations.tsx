"use client";

import { useState } from "react";
import type { CaptainScoreBreakdown } from "@/lib/fpl/types";
import CaptainCard from "./CaptainCard";

interface Props {
  ranked: CaptainScoreBreakdown[];
  noFixture: CaptainScoreBreakdown[];
}

export default function CaptainRecommendations({ ranked, noFixture }: Props) {
  const [showRest, setShowRest] = useState(false);
  const [top, ...rest] = ranked;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        Captain recommendation
      </h2>

      {!top ? (
        <p className="rounded-[10px] border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500">
          None of your squad have a fixture this gameweek yet.
        </p>
      ) : (
        <>
          <CaptainCard breakdown={top} rank={1} featured />

          {rest.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowRest((v) => !v)}
                className="text-xs font-bold uppercase tracking-wide text-brand-light hover:text-brand"
              >
                {showRest
                  ? "Hide rest of squad"
                  : `Show rest of squad (${rest.length})`}
              </button>

              {showRest && (
                <div className="mt-3 flex flex-col gap-3">
                  {rest.map((breakdown, i) => (
                    <CaptainCard breakdown={breakdown} rank={i + 2} key={breakdown.playerId} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {noFixture.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            No fixture this gameweek
          </h3>
          {noFixture.map((breakdown) => (
            <div
              key={breakdown.playerId}
              className="flex items-center justify-between rounded-[10px] border border-zinc-200 bg-zinc-50 px-4 py-2.5"
            >
              <span className="text-sm font-medium text-zinc-500">
                {breakdown.webName}{" "}
                <span className="font-normal text-zinc-400">{breakdown.teamShortName}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
