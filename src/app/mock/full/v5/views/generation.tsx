"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkTextReveal } from "../ink-text-reveal";

// ─── Phase config ──────────────────────────────────────────────────────────

type GenPhase = "gathering" | "forming" | "infusing" | "complete";

const PHASE_CONFIG: {
  id: GenPhase;
  label: string;
  startMs: number;
}[] = [
  { id: "gathering", label: "Gathering ink...", startMs: 0 },
  { id: "forming", label: "Forming cards...", startMs: 1500 },
  { id: "infusing", label: "Infusing essence...", startMs: 3000 },
  { id: "complete", label: "Complete", startMs: 5000 },
];

const TOTAL_MS = 5000;
const CARD_COUNT = 8;

// ─── Card silhouette positions (arranged in ellipse around center) ─────────

function getCardPositions(count: number) {
  const positions: { x: number; y: number; rotation: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const rx = 120;
    const ry = 90;
    positions.push({
      x: Math.cos(angle) * rx,
      y: Math.sin(angle) * ry,
      rotation: (angle * 180) / Math.PI + 90,
    });
  }
  return positions;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface GenerationViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  params: ViewParams;
}

export default function GenerationView({
  navigate,
  params,
}: GenerationViewProps) {
  const [phase, setPhase] = useState<GenPhase>("gathering");
  const [progress, setProgress] = useState(0);
  const [phaseKey, setPhaseKey] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const navigatedRef = useRef(false);

  const deckName = params.deckName || "Mystic Deck";
  const cardPositions = getCardPositions(CARD_COUNT);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(elapsed / TOTAL_MS, 1);
    setProgress(pct);

    // Determine phase
    let current: GenPhase = "gathering";
    for (const cfg of PHASE_CONFIG) {
      if (elapsed >= cfg.startMs) current = cfg.id;
    }
    setPhase((prev) => {
      if (prev !== current) {
        setPhaseKey((k) => k + 1);
        return current;
      }
      return prev;
    });

    if (elapsed < TOTAL_MS + 600) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (!navigatedRef.current) {
      navigatedRef.current = true;
      navigate("deck-detail", { deckId: MOCK_DECKS[0].id });
    }
  }, [navigate]);

  useEffect(() => {
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // Phase booleans for visual progression
  const isForming = phase === "forming" || phase === "infusing" || phase === "complete";
  const isInfusing = phase === "infusing" || phase === "complete";
  const isComplete = phase === "complete";

  const currentLabel =
    PHASE_CONFIG.find((p) => p.id === phase)?.label ?? "Generating...";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden select-none">
      {/* Deck name — top */}
      <motion.p
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 0.5, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="text-sm tracking-[0.2em] uppercase mb-8 md:mb-12"
        style={{ color: "#94a3b8" }}
      >
        {deckName}
      </motion.p>

      {/* Central blob + card silhouettes */}
      <div className="relative flex items-center justify-center" style={{ width: 300, height: 280 }}>
        {/* Ambient radial glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 320,
            height: 320,
            background: `radial-gradient(circle, rgba(0,229,255,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)`,
          }}
          animate={{
            scale: isInfusing ? 1.3 : isForming ? 1.1 : 1,
            opacity: isComplete ? 0.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />

        {/* Morphing ink blob */}
        <motion.div
          className="absolute"
          style={{
            width: 140,
            height: 140,
            background: `radial-gradient(ellipse at 40% 40%, rgba(0,229,255,0.12), rgba(139,92,246,0.08) 50%, rgba(2,4,8,0.9) 80%)`,
            boxShadow: `0 0 60px rgba(0,229,255,0.15), inset 0 0 40px rgba(139,92,246,0.1)`,
          }}
          animate={{
            borderRadius: isComplete
              ? "50%"
              : [
                  "40% 60% 55% 45% / 55% 45% 60% 40%",
                  "55% 45% 40% 60% / 45% 60% 45% 55%",
                  "45% 55% 60% 40% / 60% 40% 55% 45%",
                  "40% 60% 55% 45% / 55% 45% 60% 40%",
                ],
            scale: isComplete ? 0.6 : isInfusing ? 1.15 : 1,
            opacity: isComplete ? 0.4 : 1,
          }}
          transition={
            isComplete
              ? { type: "spring", stiffness: 200, damping: 25 }
              : {
                  borderRadius: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  scale: { type: "spring", stiffness: 100, damping: 20 },
                }
          }
        />

        {/* Inner pulse ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            border: "1px solid rgba(0,229,255,0.15)",
          }}
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* Card silhouettes */}
        {cardPositions.map((pos, i) => {
          const cardDelay = 1.5 + i * 0.15;
          const showCard = isForming;

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 36,
                height: 54,
                left: "50%",
                top: "50%",
                marginLeft: -18,
                marginTop: -27,
              }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
              animate={{
                x: showCard ? pos.x : 0,
                y: showCard ? pos.y : 0,
                opacity: showCard ? 1 : 0,
                scale: showCard ? (isComplete ? 1.1 : 1) : 0.3,
                rotate: showCard ? pos.rotation * 0.15 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 22,
                delay: showCard ? cardDelay - 1.5 + i * 0.08 : 0,
              }}
            >
              {/* Card body */}
              <motion.div
                className="w-full h-full rounded-sm relative overflow-hidden"
                style={{
                  border: `1px solid rgba(0, 229, 255, ${isInfusing ? 0.35 : 0.12})`,
                  background: isInfusing
                    ? "rgba(255,255,255,0.03)"
                    : "transparent",
                }}
                animate={{
                  boxShadow: isComplete
                    ? `0 0 12px rgba(0,229,255,0.25), 0 0 4px rgba(139,92,246,0.15)`
                    : isInfusing
                    ? `0 0 8px rgba(0,229,255,0.12)`
                    : "0 0 0px transparent",
                  borderColor: isComplete
                    ? "rgba(0,229,255,0.5)"
                    : isInfusing
                    ? "rgba(0,229,255,0.35)"
                    : "rgba(0,229,255,0.12)",
                }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
              >
                {/* Fill shimmer inside card during infusing */}
                {isInfusing && (
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, rgba(0,229,255,0.06), rgba(139,92,246,0.08), rgba(212,168,67,0.04))`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0.4, 0.8] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                )}

                {/* Tiny inner line detail */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 rounded-full"
                  style={{
                    width: 12,
                    height: 1,
                    bottom: 6,
                    background: "rgba(0,229,255,0.2)",
                  }}
                  animate={{ opacity: isInfusing ? 0.6 : 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                />
              </motion.div>
            </motion.div>
          );
        })}

        {/* Completion flash */}
        {isComplete && (
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: `radial-gradient(circle, rgba(0,229,255,0.2), transparent 60%)`,
            }}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1.6, opacity: [0, 0.6, 0] }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Phase status text */}
      <div className="mt-10 md:mt-14 h-8 flex items-center justify-center">
        <InkTextReveal
          key={phaseKey}
          text={currentLabel}
          className="text-base md:text-lg tracking-wide"
          delay={0.05}
          charDelay={0.025}
          glowColor={
            isComplete
              ? "rgba(212,168,67,0.2)"
              : "rgba(0,229,255,0.15)"
          }
          as="p"
          once={false}
          animate={true}
        />
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-48 md:w-64 relative">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            height: 2,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isComplete
                ? "linear-gradient(90deg, #00e5ff, #d4a843)"
                : "linear-gradient(90deg, #00e5ff, #8b5cf6)",
              transformOrigin: "left center",
            }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>

        {/* Percentage */}
        <motion.p
          className="text-center mt-3 text-xs tabular-nums"
          style={{ color: "#475569" }}
          animate={{ opacity: isComplete ? 0 : 0.7 }}
        >
          {Math.round(progress * 100)}%
        </motion.p>
      </div>

      {/* Decorative corner dots */}
      {[
        { top: 32, left: 32 },
        { top: 32, right: 32 },
        { bottom: 32, left: 32 },
        { bottom: 32, right: 32 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            ...pos,
            background: "rgba(0,229,255,0.2)",
          }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.7,
          }}
        />
      ))}
    </div>
  );
}
