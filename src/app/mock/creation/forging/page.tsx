"use client";

import { useReducer, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { MOCK_CARDS, MOCK_THEMES } from "@/components/mock/mock-data";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { Button } from "@/components/ui/button";

type Phase = "compression" | "forging" | "revealing" | "complete";

interface State {
  phase: Phase;
  forgedCards: number;
}

type Action =
  | { type: "START_FORGING" }
  | { type: "CARD_FORGED"; cardIndex: number }
  | { type: "START_REVEALING" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_FORGING":
      return { ...state, phase: "forging", forgedCards: 0 };
    case "CARD_FORGED":
      return { ...state, forgedCards: action.cardIndex + 1 };
    case "START_REVEALING":
      return { ...state, phase: "revealing" };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { phase: "compression", forgedCards: 0 };
    default:
      return state;
  }
}

// First 6 themes and first 6 cards
const themes = MOCK_THEMES.slice(0, 6);
const cards = MOCK_CARDS.slice(0, 6);

// Calculate circular positions for theme orbs
const getOrbPosition = (index: number, total: number, radius = 35) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
};

export default function ForgingPage() {
  return (
    <MockImmersiveShell initialMood={{ primaryHue: 270, sparkleColor: "#c9a94e" }}>
      <ForgingContent />
    </MockImmersiveShell>
  );
}

function ForgingContent() {
  const [state, dispatch] = useReducer(reducer, { phase: "compression", forgedCards: 0 });
  const { setMood } = useMockImmersive();
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const {
    cardStates,
    isRevealing,
    allRevealed,
    startReveal,
    reset: resetReveal,
  } = useCardReveal({
    cardCount: 6,
    revealDuration: 1500,
    delayBetween: 800,
    onAllRevealed: () => {
      dispatch({ type: "COMPLETE" });
    },
  });

  // Phase transitions
  useEffect(() => {
    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    if (state.phase === "compression") {
      // Compression phase: 3 seconds — deep purple gathering energy
      setMood({ primaryHue: 270, sparkleColor: "#c9a94e" });
      const t = setTimeout(() => {
        dispatch({ type: "START_FORGING" });
      }, 3000);
      timeoutsRef.current.push(t);
    } else if (state.phase === "forging") {
      // Shift to fiery orange for forging
      setMood({ primaryHue: 30, sparkleColor: "#ff8c00" });
      // Forge cards one by one with 0.5s stagger
      cards.forEach((_, i) => {
        const t = setTimeout(() => {
          dispatch({ type: "CARD_FORGED", cardIndex: i });

          // After last card is forged, transition to revealing
          if (i === cards.length - 1) {
            const t2 = setTimeout(() => {
              dispatch({ type: "START_REVEALING" });
            }, 500);
            timeoutsRef.current.push(t2);
          }
        }, i * 500);
        timeoutsRef.current.push(t);
      });
    } else if (state.phase === "revealing") {
      // Shift mood toward golden
      setMood({ primaryHue: 50, sparkleColor: "#ffd700" });
      startReveal();
    } else if (state.phase === "complete") {
      // Completion mood
      setMood({ primaryHue: 290, sparkleColor: "#c9a94e" });
    }

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [state.phase, setMood, startReveal]);

  const handleReset = () => {
    resetReveal();
    dispatch({ type: "RESET" });
  };

  const isCardPhase = state.phase === "forging" || state.phase === "revealing" || state.phase === "complete";

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center overflow-hidden p-3 sm:p-8">
      {/* Back link - always mounted */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/mock/creation">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white/90">
            ← Back to Creation Mocks
          </Button>
        </Link>
      </div>

      {/* Title Zone - always mounted */}
      <motion.div
        layout
        className="shrink-0 mb-4 sm:mb-8 text-center"
        animate={{
          opacity: state.phase === "compression" ? 0 : state.phase === "complete" ? 1 : 0.8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.h1
          key={state.phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="text-xl sm:text-4xl font-bold text-[#c9a94e]"
          style={{
            textShadow: state.phase === "complete" ? "0 0 30px rgba(201,169,78,0.5)" : "none",
          }}
        >
          {state.phase === "compression" && "Gathering themes..."}
          {state.phase === "forging" && "Forging your cards..."}
          {state.phase === "revealing" && "Revealing your deck..."}
          {state.phase === "complete" && "Your deck has been forged"}
        </motion.h1>
      </motion.div>

      {/* Stage Zone - always mounted */}
      <div className="relative w-full max-w-2xl aspect-[4/3] shrink-0">
        {/* Compression content - always mounted, opacity controlled */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: state.phase === "compression" ? 1 : 0,
            pointerEvents: state.phase === "compression" ? "auto" : "none",
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Theme orbs */}
          {themes.map((theme, i) => {
            const { x, y } = getOrbPosition(i, themes.length);
            return (
              <motion.div
                key={theme.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                animate={
                  state.phase === "compression"
                    ? {
                        x: ["", "50%"],
                        y: ["", "50%"],
                        scale: [1, 0.3, 0],
                        opacity: [0, 1, 1, 0],
                      }
                    : {
                        opacity: 0,
                        scale: 0,
                      }
                }
                initial={{ x: `${x}%`, y: `${y}%`, scale: 1, opacity: 0 }}
                transition={
                  state.phase === "compression"
                    ? {
                        duration: 3,
                        times: [0, 0.3, 0.8, 1],
                        ease: "easeInOut",
                      }
                    : { type: "spring", stiffness: 300, damping: 30 }
                }
              >
                <div
                  className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2"
                  style={{
                    borderColor: theme.color,
                    backgroundColor: `${theme.color}22`,
                    boxShadow: `0 0 30px ${theme.color}66`,
                  }}
                >
                  <span className="text-xs font-medium text-white/80">{theme.label}</span>
                </div>
              </motion.div>
            );
          })}

          {/* Central golden glow */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#c9a94e]"
            animate={
              state.phase === "compression"
                ? { scale: 1, opacity: 1 }
                : { scale: 0, opacity: 0 }
            }
            initial={{ scale: 0, opacity: 0 }}
            transition={
              state.phase === "compression"
                ? { duration: 2, delay: 1 }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            style={{
              background: "radial-gradient(circle, #c9a94e, #c9a94e66, transparent)",
              boxShadow: "0 0 60px rgba(201,169,78,0.6)",
            }}
          />

          {/* Spinning vortex */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full"
            animate={
              state.phase === "compression"
                ? { scale: 1, opacity: 1, rotate: 360 }
                : { scale: 0, opacity: 0 }
            }
            initial={{ scale: 0, opacity: 0 }}
            transition={
              state.phase === "compression"
                ? {
                    scale: { duration: 1.5, delay: 0.5 },
                    opacity: { duration: 1.5, delay: 0.5 },
                    rotate: { duration: 0.6, repeat: Infinity, ease: "linear" },
                  }
                : { type: "spring", stiffness: 300, damping: 30 }
            }
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(201,169,78,0.3), transparent, rgba(100,50,150,0.3), transparent)",
            }}
          />
        </motion.div>

        {/* Card grid - always mounted, opacity controlled */}
        <motion.div
          className="absolute inset-0 grid grid-cols-3 gap-2 sm:gap-4 justify-items-center items-center p-4 sm:p-8"
          animate={{
            opacity: isCardPhase ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {cards.map((card, i) => {
            const isForged = i < state.forgedCards;
            const revealState = cardStates[i];
            const isFlipping = revealState === "revealing";
            const isRevealed = revealState === "revealed";

            return (
              <motion.div
                key={card.id}
                className="relative"
                animate={{
                  opacity: isForged || isCardPhase ? 1 : 0,
                  scale: isForged || isCardPhase ? 1 : 0,
                }}
                transition={
                  isForged
                    ? { type: "spring", stiffness: 200, damping: 20, delay: i * 0.5 }
                    : { type: "spring", stiffness: 200, damping: 20 }
                }
              >
                {/* Card flip container with perspective */}
                <div style={{ perspective: 800 }}>
                  <motion.div
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25, duration: 1.5 }}
                    style={{
                      transformStyle: "preserve-3d",
                      position: "relative",
                    }}
                    className="w-[80px] h-[120px] sm:w-[140px] sm:h-[210px]"
                  >
                    {/* Front of card (revealed) */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <MockCardFront card={card} size="sm" />
                    </div>

                    {/* Back of card */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <MockCardBack size="sm" />
                    </div>
                  </motion.div>
                </div>

                {/* Golden glow pulse on reveal */}
                <AnimatePresence>
                  {isFlipping && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 2, opacity: [0, 0.6, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, #ffd700, transparent)",
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Celebration particles - AnimatePresence OK for decorative overlay */}
        <AnimatePresence>
          {state.phase === "complete" && (
            <>
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const distance = 120;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance,
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-[#c9a94e]"
                    style={{
                      boxShadow: "0 0 10px rgba(201,169,78,0.8)",
                    }}
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Action Zone - always mounted */}
      <motion.div
        className="shrink-0 mt-6 sm:mt-12 flex gap-4"
        animate={{
          opacity: state.phase === "complete" ? 1 : 0,
          y: state.phase === "complete" ? 0 : 20,
          pointerEvents: state.phase === "complete" ? "auto" : "none",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: state.phase === "complete" ? 0.5 : 0,
        }}
      >
        <Link href="/mock/creation">
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#c9a94e] to-[#a88a3d] hover:from-[#d4b45e] hover:to-[#b89a4d] text-black font-semibold"
          >
            View Deck
          </Button>
        </Link>
        <Button
          size="lg"
          variant="outline"
          onClick={handleReset}
          className="border-white/20 text-white/80 hover:text-white hover:border-white/40"
        >
          Forge Again
        </Button>
      </motion.div>
    </div>
  );
}
