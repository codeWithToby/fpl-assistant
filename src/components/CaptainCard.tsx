import type { CaptainScoreBreakdown } from "@/lib/fpl/types";
import TripleCaptainBadge from "./TripleCaptainBadge";

interface Props {
  breakdown: CaptainScoreBreakdown;
  rank: number;
  featured?: boolean;
}

export default function CaptainCard({ breakdown, rank, featured = false }: Props) {
  const isRisk = breakdown.availability.multiplier < 1;

  if (featured) {
    return (
      <div className="rounded-[10px] bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-light)_100%)] p-6 text-white shadow-[0_12px_28px_-14px_rgba(55,0,60,0.6)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-white/60">
              #{rank} pick
            </span>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {breakdown.webName}{" "}
              <span className="font-medium text-white/60">{breakdown.teamShortName}</span>
            </h3>
          </div>
          <span className="text-3xl font-bold tabular-nums text-pitch">
            {breakdown.totalScore}
          </span>
        </div>

        {breakdown.isTripleCaptainCandidate && (
          <div className="mt-3">
            <TripleCaptainBadge />
          </div>
        )}

        <ul className="mt-3 space-y-1">
          {breakdown.reasoning.map((line) => (
            <li
              key={line}
              className={`text-sm leading-relaxed ${
                isRisk && line === breakdown.availability.note
                  ? "font-semibold text-warning"
                  : "text-white/85"
              }`}
            >
              {line}
            </li>
          ))}
        </ul>
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

      <ul className="mt-3 space-y-1">
        {breakdown.reasoning.map((line) => (
          <li
            key={line}
            className={`text-sm leading-relaxed ${
              isRisk && line === breakdown.availability.note
                ? "font-medium text-risk"
                : "text-zinc-600"
            }`}
          >
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
