import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { ArtStyleMarquee } from "@/components/marketing/art-style-marquee";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CtaSection } from "./cta-section";
import { SocialProof } from "@/components/marketing/social-proof";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mystech-v5.vercel.app";

export const metadata: Metadata = {
  title: "MysTech — Personalized Oracle Card Readings",
  description:
    "Create oracle decks shaped by your own life. Get AI-guided readings that remember who you are, and share the ones that land.",
  alternates: { canonical: APP_URL },
  openGraph: {
    title: "MysTech — Personalized Oracle Card Readings",
    description:
      "Oracle decks shaped by your own life. AI readings that remember who you are.",
    url: APP_URL,
    siteName: "MysTech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MysTech — Personalized Oracle Card Readings",
    description:
      "Oracle decks shaped by your own life. AI readings that remember who you are.",
  },
};

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "MysTech",
  url: APP_URL,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  description:
    "Personalized oracle card decks, AI-guided readings, and shareable mystical artifacts.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "4.99",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "4.99",
        priceCurrency: "USD",
        billingIncrement: 1,
        unitCode: "MON",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <HeroSection />
      <FeatureGrid />
      <ArtStyleMarquee />
      <HowItWorks />
      <CtaSection />
      <SocialProof />
    </>
  );
}
