import CaptainAssistant from "@/components/CaptainAssistant";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export default async function Home() {
  const [bootstrapResult, fixturesResult] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);

  return (
    <CaptainAssistant
      bootstrap={bootstrapResult.data}
      fixtures={fixturesResult.data}
      isStale={bootstrapResult.stale || fixturesResult.stale}
    />
  );
}
