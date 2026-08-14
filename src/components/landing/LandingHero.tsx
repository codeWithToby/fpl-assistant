import Link from "next/link";

export default function LandingHero() {
  return (
    <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-16 pt-14 md:pb-24 md:pt-20 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wide text-pitch">
          Your FPL Assistant
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Your FPL decisions — made for you, not dumped on you.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
          Enter your squad and get a captain recommendation with the reasoning behind it, your
          optimal starting XI, and clean sheet picks for your defense — decided, not just
          displayed. No stats tables to interpret under deadline pressure.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/squad"
            className="rounded-[10px] bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-brand transition-colors hover:bg-pitch-soft"
          >
            Set up your squad
          </Link>
          <Link href="/squad" className="text-sm font-semibold text-white/80 hover:text-white">
            Or jump straight to a random squad →
          </Link>
        </div>
      </div>
    </header>
  );
}
