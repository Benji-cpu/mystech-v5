"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GoldButton } from "@/components/ui/gold-button";
import { HeroBackground } from "./hero-background";
import { HeroCardConstellation } from "./hero-card-constellation";
import { HeroTextReveal } from "./hero-text-reveal";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <HeroCardConstellation />

      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-32">
        <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
          {/* Badge — original text */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Oracle Cards
          </motion.div>

          {/* Headline — original text, word-level reveal for clean wrapping */}
          <HeroTextReveal
            as="h1"
            className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Your life story, revealed in cards
          </HeroTextReveal>

          {/* Subtitle — original text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground"
          >
            Transform your experiences into a personalized oracle deck. Let AI
            weave your memories into meaningful cards, then discover what the
            universe has to say.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/login">
              <GoldButton className="relative overflow-hidden text-base px-8 py-3.5">
                Get Started Free
                <span className="absolute inset-0 animate-gold-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              </GoldButton>
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              View Pricing
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
