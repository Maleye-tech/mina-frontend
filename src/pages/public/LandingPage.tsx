import { HeroSection } from "./landing/HeroSection";
import { StatsStrip } from "./landing/StatsStrip";
import { ProblemSection } from "./landing/ProblemSection";
import { SpacesSection } from "./landing/SpacesSection";
import { FeaturesSection } from "./landing/FeaturesSection";
import { CareSection } from "./landing/CareSection";
import { StepsSection } from "./landing/StepsSection";
import { OfflineSection } from "./landing/OfflineSection";
import { PricingSection } from "./landing/PricingSection";
import { PartnersSection } from "./landing/PartnersSection";
import { TestimonialsSection } from "./landing/TestimonialsSection";
import { TrustSection } from "./landing/TrustSection";
import { FaqSection } from "./landing/FaqSection";
import { CtaSection } from "./landing/CtaSection";

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <StatsStrip />
      <ProblemSection />
      <SpacesSection />
      <FeaturesSection />
      <CareSection />
      <StepsSection />
      <OfflineSection />
      <PricingSection />
      <PartnersSection />
      <TestimonialsSection />
      <TrustSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
