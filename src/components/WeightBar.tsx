import type { ReactNode } from "react";

interface Props {
  label: string;
  percent: number;
  maxPercent: number;
  children: ReactNode;
}

// Bar length is relative to maxPercent (the largest weight in its own group)
// rather than 100%, so the biggest factor in a group reads as visually
// dominant instead of every bar looking similarly short.
export default function WeightBar({ label, percent, maxPercent, children }: Props) {
  return (
    <div className="border-b border-zinc-200 py-3.5 last:border-0 dark:border-zinc-700">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <div className="flex flex-none items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-light),var(--grass))]"
              style={{ width: `${(percent / maxPercent) * 100}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-bold tabular-nums text-zinc-500 dark:text-zinc-400">
            {percent}%
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{children}</p>
    </div>
  );
}
