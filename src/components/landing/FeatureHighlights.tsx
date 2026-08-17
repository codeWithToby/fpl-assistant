import type { ReactNode } from "react";
import PitchPreviewMini from "@/components/PitchPreviewMini";

interface Feature {
  title: string;
  description: string;
  preview: ReactNode;
}

const FEATURES: Feature[] = [
  {
    title: "Captain Call",
    description:
      "One recommended captain, backed by expected goal involvement, fixture difficulty, and current form — plus a Triple Captain flag when the pick clears a genuinely high bar.",
    preview: (
      <div className="flex h-24 flex-col justify-between rounded-[8px] bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-light)_100%)] p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold text-white">
            Palmer <span className="font-normal text-white/60">CHE</span>
          </span>
          <span className="text-lg font-bold tabular-nums text-pitch">88</span>
        </div>
        <p className="text-[11px] leading-snug text-white/80">
          Home vs BUR (FDR 2/5), 0.71 xGI/90 — every signal lines up.
        </p>
      </div>
    ),
  },
  {
    title: "Optimal XI",
    description:
      "Your best valid formation from your 15-man squad, with rotation-risk players flagged instead of silently benched.",
    preview: <PitchPreviewMini />,
  },
  {
    title: "Defensive Watch",
    description:
      "Clean sheet probability for every defender and keeper in your squad, factored straight into who starts.",
    preview: (
      <div className="flex h-24 flex-col justify-center gap-2 rounded-[8px] border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Van Dijk <span className="font-normal text-zinc-400 dark:text-zinc-500">LIV</span>
          </span>
          <span className="rounded-full bg-sky/15 px-2 py-0.5 text-[10px] font-bold text-brand dark:text-pitch">
            71% CS
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Gabriel <span className="font-normal text-zinc-400 dark:text-zinc-500">ARS</span>
          </span>
          <span className="rounded-full bg-sky/15 px-2 py-0.5 text-[10px] font-bold text-brand dark:text-pitch">
            64% CS
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Team of the Week",
    description:
      "The strongest possible squad from every player in the league this gameweek, with its own Captain Call — no squad-building required.",
    preview: (
      <div className="flex h-24 flex-col justify-center gap-1.5 rounded-[8px] border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          This gameweek
        </span>
        <span className="text-lg font-bold text-foreground">
          3-4-3 <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">· £99.5m</span>
        </span>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">No squad needed</span>
      </div>
    ),
  },
];

export default function FeatureHighlights() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-white/10 dark:bg-white/[0.03] md:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
            What your assistant does today
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Built to answer one question at a time
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-[10px] bg-background p-6 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]"
            >
              {f.preview}
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
