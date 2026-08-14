import CaptainAssistant from "@/components/CaptainAssistant";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export default async function Home() {
  const [bootstrap, fixtures] = await Promise.all([
    fetchBootstrap(),
    fetchFixtures(),
  ]);

  return <CaptainAssistant bootstrap={bootstrap} fixtures={fixtures} />;
}
