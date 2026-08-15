export default function Loading() {
  return (
    <div className="flex flex-col">
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12 lg:px-8">
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="h-3 w-24 rounded bg-white/20" />
          <div className="mt-4 h-8 w-72 rounded bg-white/20 md:h-10 md:w-96" />
          <div className="mt-3 h-4 w-full max-w-md rounded bg-white/15" />
          <div className="mt-5 flex gap-2">
            <div className="h-7 w-28 rounded-full bg-white/10" />
            <div className="h-7 w-32 rounded-full bg-white/10" />
            <div className="h-7 w-20 rounded-full bg-white/10" />
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-6 w-full max-w-3xl px-4 pb-12 md:-mt-8 lg:px-8">
        <div className="h-[560px] animate-pulse rounded-[10px] bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
