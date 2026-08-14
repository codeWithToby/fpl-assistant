import ModuleHeader from "@/components/ModuleHeader";
import SquadSetupView from "@/components/SquadSetupView";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export default async function SquadSetupPage() {
  const [bootstrapResult, fixturesResult] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);

  return (
    <div className="flex flex-col">
      <ModuleHeader
        eyebrow="Squad Setup"
        title="What's my 15?"
        description="Search for your real squad, generate a random one, or import from your FPL Team ID."
        isStale={bootstrapResult.stale || fixturesResult.stale}
      />
      <SquadSetupView bootstrap={bootstrapResult.data} />
    </div>
  );
}
