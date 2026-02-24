"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── View Props ──────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Phase texts ─────────────────────────────────────────────────────────────

const PHASES = [
  "Consulting the ancients...",
  "Illuminating your cards...",
  "Binding the grimoire...",
];

// ─── SVG constants ───────────────────────────────────────────────────────────

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ─── Component ───────────────────────────────────────────────────────────────

export function GenerationView({ navigate, currentView }: ViewProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [complete, setComplete] = useState(false);

  // Reset state when this view becomes active
  useEffect(() => {
    if (currentView === "generation") {
      setProgress(0);
      setPhase(0);
      setComplete(false);
    }
  }, [currentView]);

  // Progress simulation
  useEffect(() => {
    if (currentView !== "generation") return;
    if (complete) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(interval);
          setComplete(true);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentView, complete]);

  // Phase transitions based on progress
  useEffect(() => {
    if (progress < 33) {
      setPhase(0);
    } else if (progress < 66) {
      setPhase(1);
    } else {
      setPhase(2);
    }
  }, [progress]);

  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);

  return (
    <div className="h-full flex flex-col items-center justify-center sm:pl-[72px]">
      <div className="flex flex-col items-center gap-8">
        {/* Progress ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative"
        >
          <svg width={120} height={120} viewBox="0 0 120 120">
            {/* Glow filter for the progress arc */}
            <defs>
              <filter id="gold-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background circle */}
            <circle
              cx={60}
              cy={60}
              r={RADIUS}
              fill="none"
              stroke="#3d3020"
              strokeWidth={4}
              opacity={0.3}
            />

            {/* Progress arc */}
            <circle
              cx={60}
              cy={60}
              r={RADIUS}
              fill="none"
              stroke="#c9a94e"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              filter="url(#gold-glow)"
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.1s ease" }}
            />

            {/* Center percentage text */}
            <text
              x={60}
              y={60}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#c9a94e"
              fontSize={24}
              fontFamily="var(--font-manuscript), serif"
              fontWeight={600}
            >
              {progress}
            </text>
          </svg>
        </motion.div>

        {/* Phase text */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!complete && (
              <motion.p
                key={phase}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-[#b8a88a] text-sm"
                style={{ fontFamily: "var(--font-manuscript), serif" }}
              >
                {PHASES[phase]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Completion content */}
        <AnimatePresence>
          {complete && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0.3,
              }}
              className="flex flex-col items-center gap-5"
            >
              <h2
                className="text-2xl sm:text-3xl text-[#c9a94e] tracking-wide text-center"
                style={{ fontFamily: "var(--font-manuscript), serif" }}
              >
                Your Grimoire Awaits
              </h2>

              <button
                onClick={() =>
                  navigate("deck-detail", { deckId: "souls-garden" })
                }
                className="relative px-8 py-3 rounded-xl font-semibold text-[#0f0b08] bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#8b7340] overflow-hidden transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ fontFamily: "var(--font-manuscript), serif" }}
              >
                {/* Animated sheen */}
                <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)",
                      animation: "gen-sheen 3s ease-in-out infinite",
                    }}
                  />
                </span>
                <span className="relative z-10 tracking-wide">
                  View Your Deck
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sheen keyframes */}
      <style jsx>{`
        @keyframes gen-sheen {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
