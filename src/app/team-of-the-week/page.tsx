import type { Metadata } from "next";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";
import { selectTeamOfTheWeek } from "@/lib/fpl/teamOfTheWeek";
import { getCurrentGameweek, getFinishedGameweekCount } from "@/lib/fpl/getCurrentGameweek";
import { formatPrice } from "@/lib/fpl/constants";
import OptimalXI from "@/components/OptimalXI";

export const metadata: Metadata = {
  title: "Team of the Week — Armband",
  description:
    "The strongest possible squad from every player in the league this gameweek — not tied to your own squad.",
};

export default async function TeamOfTheWeekPage() {
  const [bootstrapResult, fixturesResult] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);
  const bootstrap = bootstrapResult.data;
  const fixtures = fixturesResult.data;

  const finishedGameweekCount = getFinishedGameweekCount(bootstrap.events);
  const currentGameweek = getCurrentGameweek(bootstrap.events);

  const result = selectTeamOfTheWeek(
    bootstrap.players,
    bootstrap.teams,
    fixtures.fixtures,
    finishedGameweekCount
  );

  const costById = new Map(bootstrap.players.map((p) => [p.id, p.nowCost]));
  const squadCost = result
    ? [...result.starters, ...result.bench].reduce(
        (sum, s) => sum + (costById.get(s.playerId) ?? 0),
        0
      )
    : 0;

  return (
    <div className="flex flex-col">
      {/* Same gradient masthead as Squad/How It Works, so this reads as a
          sibling page rather than a bolted-on extra. */}
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">Armband</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            This week&apos;s Team of the Week
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
            The strongest possible squad from every player in the league this gameweek — not
            built from your squad, and not affected by it. Same scoring model as your Captain
            Call, just applied to everyone.
          </p>

          {result && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">
                Formation <span className="text-pitch">{result.formation}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">
                Squad cost <span className="text-pitch">{formatPrice(squadCost)}</span>
              </span>
              {currentGameweek && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/20">
                  {currentGameweek.name}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto -mt-6 w-full max-w-3xl px-4 pb-12 md:-mt-8 lg:px-8">
        {result ? (
          <OptimalXI result={result} title="Team of the Week" />
        ) : (
          <p className="rounded-[10px] border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
            Couldn&apos;t put together a valid squad right now — try again shortly.
          </p>
        )}
      </div>
    </div>
  );
}
