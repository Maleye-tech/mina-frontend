import { HeroSection } from "./landing/HeroSection";
import { ProblemSection } from "./landing/ProblemSection";
import { SpacesSection } from "./landing/SpacesSection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { CareSection } from "./landing/CareSection";
import { StepsSection } from "./landing/StepsSection";
import { OfflineSection } from "./landing/OfflineSection";
import { PricingSection } from "./landing/PricingSection";
import { TrustSection } from "./landing/TrustSection";
import { FaqSection } from "./landing/FaqSection";
import { CtaSection } from "./landing/CtaSection";

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ProblemSection />
      <SpacesSection />
      <FeaturesSection />
      <CareSection />
      <StepsSection />
      <OfflineSection />
      <PricingSection />
      <TrustSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
