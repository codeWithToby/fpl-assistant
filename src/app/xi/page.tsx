import ModuleHeader from "@/components/ModuleHeader";
import OptimalXIView from "@/components/OptimalXIView";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export default async function OptimalXIPage() {
  const [bootstrapResult, fixturesResult] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);

  return (
    <div className="flex flex-col">
      <ModuleHeader
        eyebrow="Optimal XI"
        title="Who do you start, and in what formation?"
        description="Your best valid formation from your 15, with rotation risks flagged, not silently benched."
        isStale={bootstrapResult.stale || fixturesResult.stale}
      />
      <OptimalXIView bootstrap={bootstrapResult.data} fixtures={fixturesResult.data} />
    </div>
  );
}
