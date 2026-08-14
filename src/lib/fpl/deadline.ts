export interface DeadlineCountdown {
  label: string; // e.g. "3d 4h" or "6h 20m" or "Deadline has passed"
  isPast: boolean;
  deadlineDate: Date;
}

// Server-rendered, not a live ticker — this is a "how much runway do I
// have" read at page load, not a countdown-timer app. Computed once per
// request; no client-side interval needed for a value measured in hours.
export function getDeadlineCountdown(
  deadlineTime: string,
  now: Date = new Date()
): DeadlineCountdown {
  const deadlineDate = new Date(deadlineTime);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const isPast = diffMs <= 0;
  const totalMinutes = Math.max(0, Math.round(diffMs / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const label = isPast
    ? "Deadline has passed"
    : days > 0
      ? `${days}d ${hours}h`
      : `${hours}h ${minutes}m`;

  return { label, isPast, deadlineDate };
}
