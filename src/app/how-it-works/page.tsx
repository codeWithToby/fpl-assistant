import type { Metadata } from "next";
import Link from "next/link";
import TripleCaptainBadge from "@/components/TripleCaptainBadge";
import PitchPreviewMini from "@/components/PitchPreviewMini";
import WeightBar from "@/components/WeightBar";

export const metadata: Metadata = {
  title: "How It Works — Armband",
  description: "A plain-language walkthrough of the logic behind every Armband recommendation.",
};

const CS_EXAMPLES = [
  { fixture: "Easy fixture (FDR 1/5)", probability: 43 },
  { fixture: "Average fixture (FDR 3/5)", probability: 27 },
  { fixture: "Hard fixture (FDR 5/5)", probability: 13 },
];

export default function HowItWorksPage() {
  return (
    <main className="flex-1">
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 py-16 md:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">
            Armband
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            How it decides
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            No stats tables, no ranked lists to interpret yourself — every screen in the app hands
            you one decision. Here&apos;s exactly what&apos;s happening behind each one, in plain
            English.
          </p>
        </div>
      </header>

      {/* Captain Call + Triple Captain flag */}
      <section className="px-4 py-16 md:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
            One pick, one reason
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            The Captain Call
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-base">
            Every player in your squad gets scored out of 100 using three ingredients — weighted so
            goal threat matters most, then fixture, then form.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
            <div className="rounded-[10px] border border-zinc-200 bg-background px-5 dark:border-zinc-700">
              <WeightBar label="Goal threat" percent={45} maxPercent={45}>
                How often they&apos;re involved in a goal — scoring or setting one up — based on the
                quality of chances they&apos;re getting, not just what&apos;s gone in so far.
              </WeightBar>
              <WeightBar label="Fixture difficulty" percent={30} maxPercent={45}>
                How tough their next opponent is, on the official 1 (easy) to 5 (hard) difficulty
                scale.
              </WeightBar>
              <WeightBar label="Recent form" percent={25} maxPercent={45}>
                How well they&apos;ve actually played over their last few games.
              </WeightBar>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                What comes out
              </p>
              <div className="flex flex-col justify-between gap-2 rounded-[10px] bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-light)_100%)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-white">
                    Saka <span className="font-normal text-white/60">ARS</span>
                  </span>
                  <span className="text-lg font-bold tabular-nums text-pitch">84</span>
                </div>
                <p className="text-xs leading-snug text-white/80">
                  Home vs COV (FDR 2/5), 0.68 xGI/90 — nailed-on starter.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            If a player&apos;s a doubt, their score shrinks to match — a 50/50 chance halves it, a
            real injury zeroes it out — so a fit, in-form player never loses to a bigger name who
            might not even play. Whoever&apos;s left on top is the pick, reasoning included.
          </p>

          <div className="mt-10 border-t border-zinc-200 pt-8 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <TripleCaptainBadge />
              <h3 className="text-lg font-semibold text-foreground">
                A flag, not a coin flip
              </h3>
            </div>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Most weeks the top pick is just the best option available — solid, not spectacular.
              When a high score, real goal threat, an easy fixture, strong form, and full fitness
              all line up at once, it&apos;s flagged as a genuine Triple Captain candidate — not
              just the best of an average week.
            </p>
          </div>
        </div>
      </section>

      {/* Optimal Starting XI */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-white/10 dark:bg-white/[0.03] md:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
            Best 11 from your 15
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Optimal Starting XI
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px] lg:items-start">
            <div>
              <p className="max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-base">
                Attackers and midfielders use the same goal-threat formula as the Captain Call.
                Defenders and keepers get their own formula, since attacking output barely applies
                to them:
              </p>
              <div className="mt-5 rounded-[10px] border border-zinc-200 bg-background px-5 dark:border-zinc-700">
                <WeightBar label="Clean sheet chance" percent={60} maxPercent={60}>
                  How likely they are to keep a clean sheet this fixture — see below.
                </WeightBar>
                <WeightBar label="Goal threat" percent={40} maxPercent={60}>
                  Same goal-involvement measure as everyone else, since defenders score and assist
                  too.
                </WeightBar>
              </div>
              <p className="mt-5 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-base">
                From there, every formation the rules allow — 3 to 5 defenders, 2 to 5 midfielders,
                1 to 3 forwards — gets tested, and whichever adds up to the highest score becomes
                your XI and bench, in substitution order.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Every formation, tested
              </p>
              <PitchPreviewMini />
            </div>
          </div>

          <p className="mt-6 max-w-prose text-sm font-medium leading-relaxed text-amber-700 dark:text-amber-400">
            ⚠ Rotation risks and injury doubts get flagged right on the card — never quietly left
            out with no explanation.
          </p>

          <div className="mt-8 max-w-prose rounded-[10px] border border-zinc-200 bg-background p-5 dark:border-zinc-700">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Same logic, no squad required —{" "}
              <Link
                href="/team-of-the-week"
                className="font-semibold text-brand-light underline decoration-dotted underline-offset-2 dark:text-pitch"
              >
                Team of the Week
              </Link>{" "}
              is this gameweek&apos;s strongest possible XI from every player in the league, with
              its own Captain Call.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Sheet Probability */}
      <section className="px-4 py-16 md:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
            Every defender &amp; keeper
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Clean Sheet Probability
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 md:text-base">
            We start from their team&apos;s defensive record while they&apos;re on the pitch, then
            adjust it for how tough the next opponent is — that gives an expected-goals-conceded
            number, which converts straight into a clean sheet percentage.
          </p>

          <div className="mt-6 rounded-[10px] border border-zinc-200 bg-background p-5 dark:border-zinc-700">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Same defender, three fixtures
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {CS_EXAMPLES.map((ex) => (
                <div key={ex.fixture} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{ex.fixture}</span>
                  <span className="whitespace-nowrap rounded-full bg-sky/15 px-2.5 py-1 text-xs font-bold text-brand dark:text-pitch">
                    {ex.probability}% clean sheet
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            If someone&apos;s barely played — a fresh signing, back from injury — we use a
            league-average rate instead of an unreliable small sample. Honest, not confidently
            wrong.
          </p>
        </div>
      </section>

      {/* Random Squad + Import by Team ID */}
      <section className="border-t border-zinc-200 bg-zinc-50 px-4 py-16 dark:border-white/10 dark:bg-white/[0.03] md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
              Try it without your real team
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">Random Squad</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              One click builds a complete, legal 15-man squad inside the real budget — budget-aware
              at every pick, so it never paints itself into a corner. Want more control? An optional
              Customize panel lets you bias the picks toward value, nailed-on starters, hot form, or
              an attack- or defense-heavy squad.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["2 GK", "5 DEF", "5 MID", "3 FWD", "£100.0m", "Max 3/club"].map((chip) => (
                <span
                  key={chip}
                  className="whitespace-nowrap rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
              Already play FPL?
            </span>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
              Import by Team ID
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              Paste your official FPL Team ID and your real, live squad gets pulled straight from the
              FPL website — no need to search and add all 15 players by hand.
            </p>
          </div>
        </div>
      </section>

      {/* Closing note + CTA */}
      <section className="px-4 py-16 md:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[10px] border-2 border-brand-light bg-pitch-soft p-6 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-light dark:text-pitch">
              Worth remembering
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base">
              Every recommendation shows its reasoning, so you can still apply your own judgment on
              anything the model can&apos;t see — team news, a press conference, your gut. We make
              the call; you always get the final word.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
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
    </main>
  );
}
