"use client";

import Link from "next/link";
import { GoldButton } from "@/components/ui/gold-button";
import { CtaCardReveal } from "@/components/marketing/cta-card-reveal";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";

export function CtaSection() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-col items-center gap-8">
          <ScrollReveal>
            <CtaCardReveal className="h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]" />
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Ready to discover your cards?
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
              Start with a free account. Create your first deck in minutes.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <GoldButton className="relative overflow-hidden text-base px-8 py-3.5">
                  Begin Your Journey
                  <span className="absolute inset-0 animate-gold-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </GoldButton>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
