import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to discover your cards?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Start with a free account. Create your first deck in minutes.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/login">Begin Your Journey</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
