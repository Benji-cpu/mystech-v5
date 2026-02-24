"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MOCK_CARDS } from "@/components/mock/mock-data";
import { MockCardFront } from "@/components/mock/mock-card";
import { cn } from "@/lib/utils";
import { MOCK_DECKS } from "./deck-grid";
import type { ViewId } from "../types";

interface DeckDetailViewProps {
  isActive: boolean;
  deckId: string | null;
  onNavigate: (view: ViewId, params?: { deckId?: string }) => void;
}

const DECK_DESCRIPTIONS: Record<string, string> = {
  d1: "A deck woven from the threads of introspection and personal growth. Each card reflects a stage of the inner journey toward self-knowledge.",
  d2: "Drawn from the wisdom of the natural world. Seasons, elements, and cycles guide the seeker toward harmony.",
  d3: "For those brave enough to face the hidden self. Shadow Work illuminates the parts of us we keep in darkness.",
  d4: "Channeling the muse and the maker. Creative Spirit awakens dormant gifts and opens pathways to expression.",
};

// Stagger variants for content below the morphed header
const contentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2, // Wait for layoutId morph to settle
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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

export function DeckDetailView({ isActive, deckId, onNavigate }: DeckDetailViewProps) {
  const deck = MOCK_DECKS.find((d) => d.id === deckId) ?? MOCK_DECKS[0];
  const coverCard = MOCK_CARDS[deck.coverIdx % MOCK_CARDS.length];
  const previewCards = [
    MOCK_CARDS[(deck.coverIdx + 1) % MOCK_CARDS.length],
    MOCK_CARDS[(deck.coverIdx + 2) % MOCK_CARDS.length],
    MOCK_CARDS[(deck.coverIdx + 3) % MOCK_CARDS.length],
  ];
  const description = DECK_DESCRIPTIONS[deck.id] ?? DECK_DESCRIPTIONS.d1;

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-4">
      <div className="max-w-lg mx-auto space-y-3">
        {/* Back navigation */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: isActive ? 0.05 : 0 }}
          onClick={() => onNavigate("deck-grid")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors pt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Decks</span>
        </motion.button>

        {/* Morphed hero header — uses layoutId to animate from grid card */}
        <motion.div
          layoutId={`deck-${deck.id}`}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Expanded cover area */}
          <div className="h-40 sm:h-56 bg-gradient-to-b from-purple-900/40 via-purple-900/20 to-transparent flex items-center justify-center">
            <MockCardFront card={coverCard} width={100} height={150} />
          </div>
          {/* Deck name + count */}
          <div className="p-4 sm:p-6 border-t border-white/5">
            <h2 className="text-xl sm:text-2xl font-bold text-white/90">{deck.name}</h2>
            <p className="text-white/50 text-sm mt-1">{deck.cardCount} cards</p>
          </div>
        </motion.div>

        {/* Staggered content below */}
        <motion.div
          variants={contentVariants}
          initial={false}
          animate={isActive ? "visible" : "exit"}
          className="space-y-3"
        >
          {/* Description */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 sm:p-4"
          >
            <p className="text-sm text-white/60 leading-relaxed">{description}</p>
          </motion.div>

          {/* Card preview thumbnails */}
          <motion.div variants={itemVariants}>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-medium">Sample Cards</p>
            <div className="flex gap-3">
              {previewCards.map((card) => (
                <MockCardFront key={card.id} card={card} width={60} height={90} />
              ))}
              <div
                className={cn(
                  "flex items-center justify-center rounded-xl border border-dashed border-white/10",
                  "text-white/20 text-xs"
                )}
                style={{ width: 60, height: 90 }}
              >
                +{Math.max(0, deck.cardCount - 3)}
              </div>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 sm:gap-3 pb-4">
            <motion.button
              onClick={() => onNavigate("reading-flow")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "bg-[#c9a94e]/10 border border-[#c9a94e]/30 rounded-xl",
                "flex items-center justify-center gap-2 py-3 px-4",
                "hover:bg-[#c9a94e]/20 hover:border-[#c9a94e]/50 transition-colors"
              )}
            >
              <Sparkles className="w-4 h-4 text-[#c9a94e]" />
              <span className="text-sm font-medium text-[#c9a94e]">Start Reading</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("deck-grid")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "bg-white/5 border border-white/10 rounded-xl",
                "flex items-center justify-center gap-2 py-3 px-4",
                "hover:bg-white/10 hover:border-white/20 transition-colors"
              )}
            >
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-sm font-medium text-white/60">All Decks</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
