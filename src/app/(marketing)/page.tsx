import Link from "next/link";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ArtStyleMarquee } from "@/components/marketing/art-style-marquee";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CtaSection } from "./cta-section";
import { SocialProof } from "@/components/marketing/social-proof";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <ArtStyleMarquee />
      <HowItWorks />
      <CtaSection />
      <SocialProof />
    </>
  );
}
