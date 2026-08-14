import LandingHero from "@/components/landing/LandingHero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import WhyNotDashboard from "@/components/landing/WhyNotDashboard";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <div className="flex flex-col">
      <LandingHero />
      <HowItWorks />
      <FeatureHighlights />
      <WhyNotDashboard />
      <FinalCTA />
    </div>
  );
}
