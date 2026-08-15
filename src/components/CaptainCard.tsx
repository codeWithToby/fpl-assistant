"use client";

import { useState, type ReactNode } from "react";
import type { CaptainScoreBreakdown } from "@/lib/fpl/types";
import TripleCaptainBadge from "./TripleCaptainBadge";
import Tooltip from "./Tooltip";

interface Props {
  breakdown: CaptainScoreBreakdown;
  rank: number;
  featured?: boolean;
}

const FDR_XGI_PATTERN = /(FDR \d\/5)|([\d.]+ xGI\/90)/g;

// Wraps the FDR/xGI shorthand that scoring.ts bakes into oneLinerReason and
// reasoning[] with a tap/hover definition, right where a reader hits it —
// the only other place either term is explained is the separate How It
// Works page, which means leaving the app mid-decision to look it up.
function annotateJargon(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const match of text.matchAll(FDR_XGI_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));
    const isFdr = match[1] !== undefined;
    parts.push(
      <Tooltip
        key={key++}
        label={
          isFdr
            ? "Fixture Difficulty Rating — how tough the next opponent is, on the FPL's own 1 (easiest) to 5 (hardest) scale."
            : "Expected Goal Involvement per 90 minutes — how often they're involved in a goal, scoring or assisting, based on the quality of chances they're getting."
        }
      >
        {match[0]}
      </Tooltip>
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function CaptainCard({ breakdown, rank, featured = false }: Props) {
  const [showDetail, setShowDetail] = useState(false);
  const isRisk = breakdown.availability.multiplier < 1;

  if (featured) {
    return (
      <div className="rounded-[10px] bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-light)_100%)] p-6 text-white shadow-[0_12px_28px_-14px_rgba(55,0,60,0.6)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-white/60">
              Captain pick
            </span>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {breakdown.webName}{" "}
              <span className="font-medium text-white/60">{breakdown.teamShortName}</span>
            </h3>
          </div>
          <div className="flex flex-none flex-col items-center rounded-[10px] bg-pitch px-3 py-1.5">
            <span className="text-2xl font-bold leading-none tabular-nums text-brand">
              {breakdown.totalScore}
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-brand/70">
              Score
            </span>
          </div>
        </div>

        {breakdown.isTripleCaptainCandidate && (
          <div className="mt-3">
            <TripleCaptainBadge />
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-white/90">
          {annotateJargon(breakdown.oneLinerReason)}
        </p>

        <button
          type="button"
          onClick={() => setShowDetail((v) => !v)}
          className="mt-3 text-xs font-bold uppercase tracking-wide text-pitch underline-offset-2 hover:underline"
        >
          {showDetail ? "Hide full breakdown" : "See full breakdown"}
        </button>

        {showDetail && (
          <ul className="mt-3 space-y-1 border-t border-white/15 pt-3">
            {breakdown.reasoning.map((line) => (
              <li
                key={line}
                className={`text-sm leading-relaxed ${
                  isRisk && line === breakdown.availability.note
                    ? "font-semibold text-warning"
                    : "text-white/80"
                }`}
              >
                {annotateJargon(line)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-[10px] border bg-background p-4 ${
        isRisk ? "border-risk/30" : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-400">
            #{rank}
          </span>
          <h3 className="mt-0.5 text-base font-semibold text-foreground">
            {breakdown.webName}{" "}
            <span className="font-normal text-zinc-400">{breakdown.teamShortName}</span>
          </h3>
        </div>
        <span className="text-lg font-bold tabular-nums text-brand">
          {breakdown.totalScore}
        </span>
      </div>

      {breakdown.isTripleCaptainCandidate && (
        <div className="mt-3">
          <TripleCaptainBadge />
        </div>
      )}

      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        {annotateJargon(breakdown.oneLinerReason)}
      </p>
    </div>
  );
}
