import type { Metadata } from "next";
import CaptainAssistant from "@/components/CaptainAssistant";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export const metadata: Metadata = {
  title: "Squad — Armband",
  description:
    "Build your 15-man FPL squad and get your Captain Call, Optimal XI, and clean sheet picks, decided for you with the reasoning behind every call.",
};

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
