"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { MOCK_CARDS } from "@/components/mock/mock-data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Demo 1: Setup → Draw ────────────────────────────────────────────────────

function SetupToDrawDemo() {
  const [phase, setPhase] = useState<"setup" | "draw">("setup");
  const [key, setKey] = useState(0);

  const play = () => {
    setPhase("draw");
    setTimeout(() => {
      setKey((k) => k + 1);
      setPhase("setup");
    }, 2500);
  };

  const reset = () => {
    setKey((k) => k + 1);
    setPhase("setup");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg sm:text-xl font-semibold text-white/90">Setup → Draw</h3>
      <div className="relative w-full h-[350px] overflow-hidden rounded-xl bg-gradient-to-b from-purple-950/20 to-black/40">
        {/* Form - always mounted */}
        <motion.div
          animate={{
            opacity: phase === "setup" ? 1 : 0,
            scale: phase === "setup" ? 1 : 0.95,
            pointerEvents: phase === "setup" ? "auto" : "none",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center p-4 sm:p-6"
        >
          <div className="w-full max-w-xs bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
            <h4 className="text-sm font-medium text-white/90 mb-4">Choose your spread</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={`spread-${key}`}
                  defaultChecked
                  className="w-4 h-4 accent-[#c9a94e]"
                />
                <span className="text-sm text-white/70">Single Card</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name={`spread-${key}`} className="w-4 h-4 accent-[#c9a94e]" />
                <span className="text-sm text-white/70">Three Card</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name={`spread-${key}`} className="w-4 h-4 accent-[#c9a94e]" />
                <span className="text-sm text-white/70">Five Card Cross</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Cards - always mounted */}
        <motion.div
          animate={{
            opacity: phase === "draw" ? 1 : 0,
            scale: phase === "draw" ? 1 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`card-${i}-${key}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: phase === "draw" ? i * 0.1 : 0,
              }}
            >
              <MockCardBack size="sm" />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="flex gap-2">
        <Button onClick={play} size="sm" variant="outline" className="text-xs">
          Play
        </Button>
        <Button onClick={reset} size="sm" variant="ghost" className="text-xs">
          Reset
        </Button>
      </div>
    </div>
  );
}

// ─── Demo 2: Draw → Reveal ───────────────────────────────────────────────────

function DrawToRevealDemo() {
  const [phase, setPhase] = useState<"draw" | "reveal">("draw");
  const [key, setKey] = useState(0);

  const play = () => {
    setPhase("reveal");
    setTimeout(() => {
      setKey((k) => k + 1);
      setPhase("draw");
    }, 3000);
  };

  const reset = () => {
    setKey((k) => k + 1);
    setPhase("draw");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg sm:text-xl font-semibold text-white/90">Draw → Reveal</h3>
      <div className="relative w-full h-[350px] overflow-hidden rounded-xl bg-gradient-to-b from-purple-950/20 to-black/40">
        {/* Golden wave overlay - decorative enter/exit */}
        <AnimatePresence>
          {phase === "reveal" && (
            <motion.div
              key={`wave-${key}`}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-y-0 w-[120%] pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(201,169,78,0.6) 50%, transparent 100%)",
                filter: "blur(20px)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Cards - flip transition with both faces always mounted */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6">
          {[0, 1, 2].map((i) => (
            <div key={`card-container-${i}`} style={{ perspective: 1000 }}>
              <motion.div
                animate={{ rotateY: phase === "reveal" ? 180 : 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  delay: phase === "reveal" ? i * 0.3 : 0,
                }}
                style={{ transformStyle: "preserve-3d", position: "relative" }}
                className="w-[120px] h-[168px]"
              >
                {/* Front face (card front) - rotated 180deg initially */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <MockCardFront card={MOCK_CARDS[i]} size="sm" />
                </div>
                {/* Back face (card back) - starts visible */}
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                  <MockCardBack size="sm" />
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={play} size="sm" variant="outline" className="text-xs">
          Play
        </Button>
        <Button onClick={reset} size="sm" variant="ghost" className="text-xs">
          Reset
        </Button>
      </div>
    </div>
  );
}

// ─── Demo 3: Reveal → Interpretation ─────────────────────────────────────────

function RevealToInterpretationDemo() {
  const [phase, setPhase] = useState<"reveal" | "interpretation">("reveal");
  const [key, setKey] = useState(0);

  const play = () => {
    setPhase("interpretation");
    setTimeout(() => {
      setKey((k) => k + 1);
      setPhase("reveal");
    }, 3000);
  };

  const reset = () => {
    setKey((k) => k + 1);
    setPhase("reveal");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg sm:text-xl font-semibold text-white/90">Reveal → Interpretation</h3>
      <div className="relative w-full h-[350px] overflow-hidden rounded-xl bg-gradient-to-b from-purple-950/20 to-black/40">
        <div className="absolute inset-0 flex flex-col items-center p-4 sm:p-6">
          {/* Cards row */}
          <motion.div
            layout
            className={cn(
              "flex justify-center gap-3 sm:gap-4",
              phase === "interpretation" && "gap-2 mb-4"
            )}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`card-${i}-${key}`}
                layoutId={`card-${i}-${key}`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <MockCardFront
                  card={MOCK_CARDS[i]}
                  size={phase === "reveal" ? "md" : "sm"}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Interpretation panel - always mounted, animated height */}
          <motion.div
            animate={{
              height: phase === "interpretation" ? "auto" : 0,
              opacity: phase === "interpretation" ? 1 : 0,
            }}
            className="overflow-hidden w-full max-w-sm"
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: phase === "interpretation" ? 0.2 : 0 }}
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                The cards reveal a journey of transformation. The Dreamer speaks to new
                beginnings, while The Alchemist shows mastery emerging through practice. The
                Wanderer calls you forward into unexplored territory...
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={play} size="sm" variant="outline" className="text-xs">
          Play
        </Button>
        <Button onClick={reset} size="sm" variant="ghost" className="text-xs">
          Reset
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function PhaseTransitionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0118] to-[#1a0530] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back link */}
        <Link
          href="/mock/reading"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-8"
        >
          ← Back to Reading
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">Phase Transitions</h1>
          <p className="text-sm sm:text-base text-white/60">
            3 between-phase transition demos for the reading ceremony
          </p>
        </div>

        {/* Demo grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Demo 1 */}
          <div className="border border-white/10 rounded-2xl bg-white/5 p-4 sm:p-6">
            <SetupToDrawDemo />
          </div>

          {/* Demo 2 */}
          <div className="border border-white/10 rounded-2xl bg-white/5 p-4 sm:p-6">
            <DrawToRevealDemo />
          </div>

          {/* Demo 3 */}
          <div className="border border-white/10 rounded-2xl bg-white/5 p-4 sm:p-6">
            <RevealToInterpretationDemo />
          </div>
        </div>
      </div>
    </div>
  );
}
