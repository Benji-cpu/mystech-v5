"use client";

import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";
import { ScrollProgressLine } from "./scroll-progress-line";
import { StepChatPreview } from "./step-chat-preview";
import { StepCardMaterialization } from "./step-card-materialization";
import { StepReadingPreview } from "./step-reading-preview";

const steps = [
  {
    number: 1,
    title: "Tell Your Story",
    description:
      "Share your experiences, memories, and themes with our AI guide. It listens deeply and finds the symbolism within.",
    visual: StepChatPreview,
  },
  {
    number: 2,
    title: "Get Your Deck",
    description:
      "Your stories are transformed into a unique oracle deck — each card a reflection of your personal journey.",
    visual: StepCardMaterialization,
  },
  {
    number: 3,
    title: "Discover Insights",
    description:
      "Draw cards and receive AI-powered readings that speak directly to your life, with meaning only you can truly understand.",
    visual: StepReadingPreview,
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border/40">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:py-20 sm:px-6">
        <ScrollReveal className="mb-8 sm:mb-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            From story to spread in three simple steps.
          </p>
        </ScrollReveal>

        <div className="relative">
          <ScrollProgressLine className="hidden md:block md:left-1/2" />

          <div className="space-y-8 sm:space-y-16">
            {steps.map((step, i) => {
              const Visual = step.visual;
              const isEven = i % 2 === 0;

              return (
                <ScrollReveal key={step.number} delay={0.1}>
                  <div
                    className={cn(
                      "flex flex-col items-center gap-6",
                      "md:flex-row md:items-center md:gap-12",
                      !isEven && "md:flex-row-reverse"
                    )}
                  >
                    {/* Text side */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold mb-3">
                        {step.number}
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {step.title}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed max-w-md mx-auto md:mx-0">
                        {step.description}
                      </p>
                    </div>

                    {/* Visual side */}
                    <div className="flex-1 flex justify-center">
                      <Visual />
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
