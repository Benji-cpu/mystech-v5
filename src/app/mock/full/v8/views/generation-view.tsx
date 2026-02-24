"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ViewId, ViewParams, MoodId } from "../../_shared/types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { DREAM, SPRING, SPRING_GENTLE } from "../dream-theme";

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// Use first deck's cards as mock generated cards
const GENERATED_CARDS = MOCK_DECKS[0].cards.slice(0, 8);

export function GenerationView({ navigate, currentView }: NavProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const isComplete = revealedCount >= GENERATED_CARDS.length;
  const isActive = currentView === "generation";

  useEffect(() => {
    if (!isActive) return;
    setRevealedCount(0);

    const timers: NodeJS.Timeout[] = [];
    GENERATED_CARDS.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedCount(i + 1), 1200 + i * 800));
    });

    return () => timers.forEach(clearTimeout);
  }, [isActive]);

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="text-center mb-8"
      >
        <h1 className={`text-xl text-[#e8e6f0] ${DREAM.heading} font-serif`}>
          {isComplete ? "Your Deck Awaits" : "Dreaming Your Cards..."}
        </h1>
        <p className="text-xs text-[#8b87a0] mt-1">
          {isComplete
            ? `${GENERATED_CARDS.length} cards materialized`
            : `${revealedCount} of ${GENERATED_CARDS.length} cards`}
        </p>
      </motion.div>

      {/* Progress ring */}
      {!isComplete && (
        <motion.div
          className="mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={24} className="text-[#d4a843]" />
        </motion.div>
      )}

      {/* Card grid — cards materialize */}
      <div className="grid grid-cols-4 gap-2 max-w-[340px] w-full">
        {GENERATED_CARDS.map((card, i) => {
          const isRevealed = i < revealedCount;
          return (
            <motion.div
              key={card.id}
              className="relative aspect-[3/4] rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.5, filter: "blur(12px)" }}
              animate={isRevealed ? {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              } : {
                opacity: 0.15,
                scale: 0.8,
                filter: "blur(12px)",
              }}
              transition={{ ...SPRING_GENTLE, delay: isRevealed ? 0 : 0 }}
            >
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                className="object-cover"
                sizes="80px"
              />
              {isRevealed && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    background: "linear-gradient(135deg, rgba(212,168,67,0.5), transparent)",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[340px] mt-6">
        <div className="h-1 bg-[#2a2b5a]/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#d4a843] to-[#e8c96a]"
            animate={{ width: `${(revealedCount / GENERATED_CARDS.length) * 100}%` }}
            transition={SPRING}
          />
        </div>
      </div>

      {/* Complete button */}
      <motion.div
        animate={{ opacity: isComplete ? 1 : 0, y: isComplete ? 0 : 16 }}
        transition={SPRING}
        className="mt-8"
        style={{ pointerEvents: isComplete ? "auto" : "none" }}
      >
        <motion.button
          onClick={() => navigate("deck-detail", { deckId: MOCK_DECKS[0].id })}
          className={`${DREAM.goldGradient} rounded-xl px-6 py-3 flex items-center gap-2 ${DREAM.goldGlow}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={`text-sm font-semibold text-[#0a0b1e] ${DREAM.heading} font-serif`}>View Your Deck</span>
          <ArrowRight size={16} className="text-[#0a0b1e]" />
        </motion.button>
      </motion.div>
    </div>
  );
}
