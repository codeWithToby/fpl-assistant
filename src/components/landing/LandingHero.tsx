import Link from "next/link";

export default function LandingHero() {
  return (
    <header className="relative overflow-hidden bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 py-16 md:py-24 lg:px-8">
      {/* Subtle decorative texture — a dot grid, purely atmospheric, kept
          low-opacity so it never competes with the actual content. */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        aria-hidden="true"
      >
        <pattern id="hero-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="white" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">
            Your FPL Assistant
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Your FPL decisions — made for you, not dumped on you.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg lg:mx-0">
            Enter your squad and get a captain recommendation with the reasoning behind it, your
            optimal starting XI, and clean sheet picks for your defense — decided, not just
            displayed. No stats tables to interpret under deadline pressure.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 lg:items-start">
            <Link
              href="/squad"
              className="rounded-[10px] bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-brand transition-colors hover:bg-pitch-soft"
            >
              Set up your squad
            </Link>
            <Link
              href="/squad?random=1"
              className="text-sm font-semibold text-white/80 hover:text-white"
            >
              Or jump straight to a random squad →
            </Link>
          </div>
        </div>

        {/* Product preview — a real mockup of what the Captain Call result
            looks like, styled identically to the actual featured CaptainCard,
            so the hero shows the product instead of just describing it. */}
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <div className="rounded-[10px] bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-light)_100%)] p-6 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-white/60">
                  Captain pick
                </span>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                  Haaland <span className="font-medium text-white/60">MCI</span>
                </h3>
              </div>
              <span className="text-3xl font-bold tabular-nums text-pitch">92</span>
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-pitch px-3 py-1 text-xs font-bold text-brand">
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path
                  d="M8 1.5 9.7 5l3.8.5-2.75 2.7.65 3.8L8 10.2l-3.4 1.8.65-3.8L2.5 5.5 6.3 5Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Triple Captain candidate
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/90">
              Nailed-on starter, home vs BOU (FDR 2/5), 0.86 xGI/90. Every signal lines up.
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-white/50 lg:text-left">
            Example recommendation — yours runs on your real squad.
          </p>
        </div>
      </div>
    </header>
  );
}
