"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "./scroll-reveal";
import { FeatureVignette } from "./feature-vignette";

const features = [
  {
    vignetteType: "story" as const,
    title: "Personalized Decks",
    description:
      "Create oracle card decks drawn from your own life experiences, memories, and personal symbolism. Each card becomes a mirror of your inner world.",
  },
  {
    vignetteType: "readings" as const,
    title: "AI-Powered Readings",
    description:
      "Receive insightful readings guided by AI that understands the meaning behind your unique cards.",
  },
  {
    vignetteType: "styles" as const,
    title: "Custom Art Styles",
    description:
      "Choose from mystical art styles or create your own — each deck is a visual masterpiece.",
  },
  {
    vignetteType: "share" as const,
    title: "Share & Connect",
    description:
      "Share readings with friends and explore how your personal oracle speaks to others.",
  },
];

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

export function FeatureGrid() {
  const [hero, ...rest] = features;

  return (
    <section id="features" className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6">
        <ScrollReveal className="mb-10 sm:mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Everything you need for mystical insight
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            A complete platform for creating, reading, and sharing personal
            oracle cards.
          </p>
        </ScrollReveal>

        {/* Hero feature — full width, more prominent */}
        <ScrollReveal className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={spring}
          >
            <Card className="border-border/50 bg-white/[0.05] overflow-hidden">
              <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                <FeatureVignette
                  type={hero.vignetteType}
                  className="w-full sm:w-72 sm:shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground font-display mb-2">
                    {hero.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
                    {hero.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </ScrollReveal>

        {/* Secondary features — 3-column row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {rest.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={spring}
              >
                <Card className="border-border/50 bg-white/[0.03] overflow-hidden h-full">
                  <CardContent className="p-4 sm:pt-4 sm:pb-6 sm:px-6">
                    <FeatureVignette type={feature.vignetteType} className="mb-3 sm:mb-4" />
                    <h3 className="mb-1 sm:mb-2 text-base font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
