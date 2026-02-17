"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoCard, DemoCardBack, DEMO_CARDS } from "./demo-card";
import { TransitionStage } from "./transition-stage";

type JourneyStep = "idle" | "deal" | "spread" | "flip" | "content" | "rearrange";

const STEPS: { key: JourneyStep; label: string; description: string }[] = [
  { key: "deal", label: "1. Deal", description: "Cards appear from deck pile" },
  { key: "spread", label: "2. Spread", description: "Cards fan out to positions" },
  { key: "flip", label: "3. Flip", description: "Cards flip to reveal faces" },
  { key: "content", label: "4. Content", description: "Card meanings fade in" },
  { key: "rearrange", label: "5. Rearrange", description: "Cards move to final layout" },
];

const cards = DEMO_CARDS.slice(0, 3);

export function JourneySimulation() {
  const [step, setStep] = useState<JourneyStep>("idle");
  const [stepIndex, setStepIndex] = useState(-1);

  const advanceStep = useCallback(() => {
    setStepIndex((prev) => {
      const next = prev + 1;
      if (next < STEPS.length) {
        setStep(STEPS[next].key);
        return next;
      }
      return prev;
    });
  }, []);

  const handlePlay = () => {
    setStepIndex(0);
    setStep("deal");
    // Auto-advance through steps
    let delay = 0;
    STEPS.forEach((_, i) => {
      if (i === 0) return;
      delay += 1500;
      setTimeout(() => {
        setStepIndex(i);
        setStep(STEPS[i].key);
      }, delay);
    });
  };

  const handleReset = () => {
    setStep("idle");
    setStepIndex(-1);
  };

  return (
    <div className="rounded-xl border border-border bg-card/50 p-6">
      {/* Step indicators */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              i < stepIndex
                ? "bg-green-500/20 text-green-300"
                : i === stepIndex
                ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Stage */}
      <TransitionStage className="min-h-[320px]">
        <JourneyContent step={step} />
      </TransitionStage>

      {/* Description */}
      <div className="mt-4 h-6">
        {stepIndex >= 0 && stepIndex < STEPS.length && (
          <p className="text-xs text-muted-foreground text-center">
            {STEPS[stepIndex].description}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handlePlay}
          disabled={step !== "idle"}
          className="flex-1 rounded-lg bg-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/30 transition-colors disabled:opacity-40"
        >
          Play Journey
        </button>
        <button
          onClick={handleReset}
          className="flex-1 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function JourneyContent({ step }: { step: JourneyStep }) {
  if (step === "idle") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {cards.map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: -i * 2,
                left: -i * 1,
                zIndex: cards.length - i,
              }}
            >
              <DemoCardBack size="md" />
            </div>
          ))}
          <div style={{ visibility: "hidden" }}>
            <DemoCardBack size="md" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Press Play to begin</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start justify-center flex-wrap">
      {cards.map((card, i) => (
        <JourneyCard key={card.title} card={card} index={i} step={step} />
      ))}
    </div>
  );
}

function JourneyCard({
  card,
  index,
  step,
}: {
  card: (typeof DEMO_CARDS)[0];
  index: number;
  step: JourneyStep;
}) {
  const stepNum = STEPS.findIndex((s) => s.key === step);
  const isDeal = stepNum >= 0;
  const isSpread = stepNum >= 1;
  const isFlipped = stepNum >= 2;
  const isContent = stepNum >= 3;
  const isRearranged = stepNum >= 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.5 }}
        animate={{
          opacity: isDeal ? 1 : 0,
          y: isDeal ? 0 : 80,
          scale: isDeal ? 1 : 0.5,
          x: isRearranged ? (index - 1) * 10 : 0,
          rotate: isRearranged ? (index - 1) * 5 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
          delay: index * 0.15,
        }}
        style={{ perspective: 800 }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: index * 0.2,
          }}
          style={{ transformStyle: "preserve-3d", width: 120, height: 180 }}
        >
          {/* Back */}
          <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
            <DemoCardBack size="sm" />
          </div>
          {/* Front */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <DemoCard title={card.title} size="sm" />
          </div>
        </motion.div>
      </motion.div>

      {/* Content fade in */}
      <AnimatePresence>
        {isContent && (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="text-center"
          >
            <p className="text-[10px] text-[#c9a94e]/80 font-medium">
              {card.title}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5 max-w-[100px]">
              A journey awaits within this card...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
