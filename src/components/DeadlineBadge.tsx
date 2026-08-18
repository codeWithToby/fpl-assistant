"use client";

import { useEffect, useState } from "react";

interface Props {
  gameweekName: string;
  deadlineTime: string;
}

// Fixed locale/timezone (not the viewer's) so server and client render
// identical text — FPL deadlines are UK kickoff times anyway, so this is
// also just the least confusing way to show them regardless of who's
// asking.
function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function formatRelative(iso: string): string | null {
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return null; // deadline's passed — don't claim time's left
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "closing soon";
}

export default function DeadlineBadge({ gameweekName, deadlineTime }: Props) {
  // "Time left" depends on the reader's clock, which drifts from the
  // server's between render and hydration — computed client-side only,
  // after mount, so there's nothing for React to mismatch. Set once, not
  // on an interval — a badge, not a live ticker.
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    // Deliberately client-only (see comment above) — nothing for React to
    // mismatch, since the server never renders a value for this at all.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRelative(formatRelative(deadlineTime));
  }, [deadlineTime]);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-[10px] bg-pitch px-4 py-2.5 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.45)]">
      <svg
        className="h-5 w-5 flex-none text-brand"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-bold uppercase tracking-wide text-brand/70">
          {gameweekName} deadline
        </span>
        <span className="text-sm font-bold text-brand">
          {formatDeadline(deadlineTime)}
          {relative && <span className="ml-1.5">· {relative}</span>}
        </span>
      </div>
    </div>
  );
}
