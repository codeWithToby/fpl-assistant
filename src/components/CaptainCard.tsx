import type { CaptainScoreBreakdown } from "@/lib/fpl/types";
import TripleCaptainBadge from "./TripleCaptainBadge";

interface Props {
  breakdown: CaptainScoreBreakdown;
  rank: number;
  featured?: boolean;
}

export default function CaptainCard({ breakdown, rank, featured = false }: Props) {
  const isRisk = breakdown.availability.multiplier < 1;

  return (
    <div
      className={
        featured
          ? "border-2 border-brand bg-white p-6"
          : `border p-4 ${isRisk ? "border-risk/30 bg-white" : "border-zinc-200 bg-white"}`
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            #{rank}
          </span>
          <h3
            className={
              featured
                ? "mt-1 text-2xl font-bold tracking-tight text-foreground"
                : "mt-0.5 text-base font-semibold text-foreground"
            }
          >
            {breakdown.webName}{" "}
            <span className="font-normal text-zinc-400">{breakdown.teamShortName}</span>
          </h3>
        </div>
        <span
          className={
            featured
              ? "text-3xl font-bold tabular-nums text-brand"
              : "text-lg font-bold tabular-nums text-zinc-700"
          }
        >
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
