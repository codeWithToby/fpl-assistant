import HomeView from "@/components/HomeView";
import StaleDataBanner from "@/components/StaleDataBanner";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";
import { getCurrentGameweek } from "@/lib/fpl/getCurrentGameweek";
import { getDeadlineCountdown } from "@/lib/fpl/deadline";

export default async function Home() {
  const [bootstrapResult, fixturesResult] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);

  const isStale = bootstrapResult.stale || fixturesResult.stale;
  const currentGameweek = getCurrentGameweek(bootstrapResult.data.events);
  const deadline = currentGameweek
    ? getDeadlineCountdown(currentGameweek.deadlineTime)
    : null;

  return (
    <div className="flex flex-col">
      {/* Masthead — FPL's own purple-to-green gradient, reserved for Home
          as the app's one identifying brand moment. Module pages use the
          lighter ModuleHeader instead. */}
      <header className="bg-[linear-gradient(160deg,var(--brand)_0%,var(--brand-light)_45%,var(--pitch)_150%)] px-4 pb-10 pt-8 md:pb-14 md:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <span className="text-xs font-bold uppercase tracking-wide text-pitch">
            FPL Captain Assistant
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            What do you need to do before the deadline?
          </h1>
          {deadline && currentGameweek && (
            <p className="mt-2 text-sm font-medium text-white/90">
              {currentGameweek.name} deadline:{" "}
              {deadline.isPast ? "has passed" : `${deadline.label} left`}
            </p>
          )}
        </div>
      </header>

      {isStale && <StaleDataBanner />}

      <HomeView bootstrap={bootstrapResult.data} fixtures={fixturesResult.data} />
    </div>
  );
}
