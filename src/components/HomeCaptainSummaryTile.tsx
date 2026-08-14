import Link from "next/link";
import type { CaptainScoreBreakdown } from "@/lib/fpl/types";
import TripleCaptainBadge from "./TripleCaptainBadge";

export default function HomeCaptainSummaryTile({
  breakdown,
}: {
  breakdown: CaptainScoreBreakdown | null;
}) {
  if (!breakdown) {
    return (
      <div className="rounded-[10px] bg-background p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
          This week&apos;s captain
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          None of your squad have a fixture this gameweek yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-background p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        This week&apos;s captain
      </p>
      <div className="mt-2 flex items-start justify-between gap-4">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {breakdown.webName}{" "}
          <span className="font-normal text-zinc-400">{breakdown.teamShortName}</span>
        </h3>
        <span className="text-2xl font-bold tabular-nums text-brand">
          {breakdown.totalScore}
        </span>
      </div>

      {breakdown.isTripleCaptainCandidate && (
        <div className="mt-2">
          <TripleCaptainBadge />
        </div>
      )}

      <p className="mt-2 text-sm leading-relaxed text-zinc-600">{breakdown.oneLinerReason}</p>

      <Link
        href="/captain"
        className="mt-3 inline-block text-sm font-bold text-brand-light hover:text-brand"
      >
        See full reasoning →
      </Link>
    </div>
  );
}
