export default function WhyNotDashboard() {
  return (
    <section className="relative overflow-hidden px-4 py-16 md:py-24 lg:px-8">
      {/* Faint pitch-circle echoes, tying back to the Optimal XI pitch
          visual — restrained corner accents, not a generic gradient blob. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 hidden h-72 w-72 rounded-full border-2 border-brand-light/10 dark:border-pitch/10 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-16 hidden h-56 w-56 rounded-full border-2 border-brand-light/10 dark:border-pitch/10 lg:block"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
          Why not just another stats dashboard
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Most FPL tools hand you more data. Your assistant makes the calls.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-base">
          FPL rewards decisions, not data collection. Most tools show you stats tables,
          fixture-difficulty grids, and ownership charts — and leave you to synthesize five
          numbers into one choice, often in the last few minutes before deadline. That&apos;s a
          dashboard problem, not a decision problem.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[10px] border border-zinc-200 p-6 dark:border-zinc-700">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            Typical FPL tools
          </p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            Stats tables. FDR grids. Ownership charts. You still make every call yourself.
          </p>
        </div>
        <div className="rounded-[10px] border-2 border-brand-light bg-pitch-soft p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
            Your FPL Assistant
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            One recommendation per decision, with one sentence of reasoning. The call, made —
            with the full breakdown still there if you want to check our work.
          </p>
        </div>
      </div>
    </section>
  );
}
