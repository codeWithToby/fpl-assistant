import ModuleHeader from "@/components/ModuleHeader";
import CaptainCallView from "@/components/CaptainCallView";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export default async function CaptainCallPage() {
  const [bootstrapResult, fixturesResult] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);

  return (
    <div className="flex flex-col">
      <ModuleHeader
        eyebrow="Captain Call"
        title="Who do you captain this week?"
        description="One recommendation, one reason — xGI, fixture difficulty, and form combined into the call."
        isStale={bootstrapResult.stale || fixturesResult.stale}
      />
      <CaptainCallView bootstrap={bootstrapResult.data} fixtures={fixturesResult.data} />
    </div>
  );
}
