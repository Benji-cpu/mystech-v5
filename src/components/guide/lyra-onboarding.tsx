"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LyraSigil } from "./lyra-sigil";
import { LYRA_ONBOARDING_MESSAGES } from "./lyra-constants";

const STORAGE_KEY = "lyra-onboarding-seen";

interface LyraOnboardingProps {
  onComplete: () => void;
}

function LyraOnboardingOverlay({ onComplete }: LyraOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isLastStep = step === LYRA_ONBOARDING_MESSAGES.length - 1;

  function handleNext() {
    if (isLastStep) {
      localStorage.setItem(STORAGE_KEY, "true");
      onComplete();
      router.push("/decks/new");
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleSkip() {
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
      >
        {/* Skip link */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>

        {/* Sigil */}
        <div className="flex justify-center mb-6">
          <LyraSigil size="xl" state="speaking" />
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-sm text-muted-foreground leading-relaxed mb-8"
          >
            {LYRA_ONBOARDING_MESSAGES[step]}
          </motion.p>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {LYRA_ONBOARDING_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i === step ? "bg-[#c9a94e]" : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Action */}
        <Button
          onClick={handleNext}
          variant="outline"
          className="w-full"
        >
          {isLastStep ? "Let's Begin" : "Continue"}
        </Button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Gate component that checks localStorage and conditionally renders
 * the onboarding overlay. Use in a client component.
 */
export function LyraOnboardingGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <LyraOnboardingOverlay onComplete={() => setShow(false)} />
    </AnimatePresence>
  );
}
