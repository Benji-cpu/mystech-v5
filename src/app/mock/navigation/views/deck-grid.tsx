"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { MOCK_CARDS } from "@/components/mock/mock-data";
import { MockCardFront } from "@/components/mock/mock-card";
import { cn } from "@/lib/utils";
import type { ViewId } from "../types";

interface DeckGridViewProps {
  isActive: boolean;
  onNavigate: (view: ViewId, params?: { deckId?: string }) => void;
}

export const MOCK_DECKS = [
  { id: "d1", name: "Inner Journey", cardCount: 12, coverIdx: 0 },
  { id: "d2", name: "Nature's Wisdom", cardCount: 8, coverIdx: 3 },
  { id: "d3", name: "Shadow Work", cardCount: 10, coverIdx: 6 },
  { id: "d4", name: "Creative Spirit", cardCount: 6, coverIdx: 9 },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1 as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

export function DeckGridView({ isActive, onNavigate }: DeckGridViewProps) {
  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-4">
      <motion.div
        variants={containerVariants}
        initial={false}
        animate={isActive ? "visible" : "exit"}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2 mb-4">
          <motion.button
            onClick={() => onNavigate("dashboard")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </motion.button>
          <h1 className="text-lg sm:text-xl font-bold text-white/90">Your Decks</h1>
        </motion.div>

        {/* Deck grid — 2 columns on mobile, up to 3 on desktop */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {MOCK_DECKS.map((deck) => {
            const coverCard = MOCK_CARDS[deck.coverIdx % MOCK_CARDS.length];
            return (
              <motion.div
                key={deck.id}
                layoutId={`deck-${deck.id}`}
                onClick={() => onNavigate("deck-detail", { deckId: deck.id })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer"
              >
                <div
                  className={cn(
                    "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden",
                    "hover:border-[#c9a94e]/30 hover:bg-white/8 transition-colors"
                  )}
                >
                  {/* Card preview area */}
                  <div className="aspect-[3/4] bg-gradient-to-b from-purple-900/30 to-transparent flex items-center justify-center p-4">
                    <MockCardFront card={coverCard} width={80} height={120} />
                  </div>
                  {/* Deck info */}
                  <div className="p-2.5 sm:p-3 border-t border-white/5">
                    <h3 className="text-white/90 text-xs sm:text-sm font-semibold truncate">{deck.name}</h3>
                    <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">{deck.cardCount} cards</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
