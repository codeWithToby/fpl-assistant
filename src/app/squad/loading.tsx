export default function Loading() {
  return (
    <div className="flex flex-col">
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-3 w-32 rounded bg-white/20" />
          <div className="mt-4 h-8 w-72 rounded bg-white/20 md:h-10 md:w-96" />
          <div className="mt-3 h-4 w-full max-w-md rounded bg-white/15" />
        </div>
      </header>

      <div className="mx-auto -mt-6 w-full max-w-7xl px-4 pb-12 md:-mt-8 lg:grid lg:grid-cols-[380px_1fr] lg:items-start lg:gap-8 lg:px-8">
        <div className="animate-pulse rounded-[10px] bg-background p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)] md:p-6">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-4 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-3 h-10 rounded-[10px] bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-3 h-10 rounded-[10px] bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-3 h-10 rounded-[10px] bg-zinc-100 dark:bg-zinc-800" />
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:mt-0">
          <div className="h-36 animate-pulse rounded-[10px] bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-64 animate-pulse rounded-[10px] bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
