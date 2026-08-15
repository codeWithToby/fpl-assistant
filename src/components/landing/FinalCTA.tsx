import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 text-center dark:border-white/10 dark:bg-white/[0.03] md:py-24 lg:px-8">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Ready to let your assistant make the call?
        </h2>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link
            href="/squad"
            className="rounded-[10px] bg-brand-light px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand"
          >
            Set up your squad
          </Link>
          <Link
            href="/squad?random=1"
            className="text-sm font-semibold text-brand-light hover:text-brand dark:text-pitch dark:hover:text-pitch-dark"
          >
            Or try a random squad →
          </Link>
        </div>
      </div>
    </section>
  );
}
