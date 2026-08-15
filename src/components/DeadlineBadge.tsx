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
    setRelative(formatRelative(deadlineTime));
  }, [deadlineTime]);

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
      <span>
        {gameweekName} deadline: {formatDeadline(deadlineTime)}
      </span>
      {relative && (
        <span className="rounded-full bg-pitch px-2 py-0.5 text-[10px] font-bold text-brand">
          {relative}
        </span>
      )}
    </div>
  );
}
