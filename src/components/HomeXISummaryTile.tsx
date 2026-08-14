import Link from "next/link";
import type { OptimalXIResult } from "@/lib/fpl/types";

const GK = 1;
const DEF = 2;
const CLEAN_SHEET_DISPLAY_THRESHOLD = 50;

export default function HomeXISummaryTile({ result }: { result: OptimalXIResult }) {
  const rotationRiskCount = result.starters.filter((s) => s.rotationRisk).length;
  const cleanSheetCount = result.starters.filter(
    (s) =>
      (s.elementType === GK || s.elementType === DEF) &&
      s.cleanSheetProbability !== null &&
      s.cleanSheetProbability >= CLEAN_SHEET_DISPLAY_THRESHOLD
  ).length;

  return (
    <div className="rounded-[10px] bg-background p-5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">This week&apos;s XI</p>
      <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">
        {result.formation} formation
      </h3>

      <div className="mt-2 flex flex-wrap gap-2">
        {cleanSheetCount > 0 && (
          <span className="rounded-full bg-sky/15 px-2.5 py-1 text-xs font-bold text-brand">
            {cleanSheetCount} clean sheet pick{cleanSheetCount === 1 ? "" : "s"}
          </span>
        )}
        {rotationRiskCount > 0 && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            ⚠ {rotationRiskCount} rotation risk{rotationRiskCount === 1 ? "" : "s"} flagged
          </span>
        )}
      </div>

      <Link
        href="/xi"
        className="mt-3 inline-block text-sm font-bold text-brand-light hover:text-brand"
      >
        View full XI →
      </Link>
    </div>
  );
}
