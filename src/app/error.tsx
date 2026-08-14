"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-risk">
        FPL data unavailable
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        Couldn&apos;t reach the FPL API
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        This is usually temporary — the official FPL API is occasionally slow
        or unavailable, especially near deadlines.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-[10px] bg-brand-light px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand"
      >
        Try again
      </button>
    </div>
  );
}
