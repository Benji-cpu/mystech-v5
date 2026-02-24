"use client";

import { motion } from "framer-motion";
import { getDeckById, getStyleById } from "@/app/mock/full/_shared/mock-data-v1";
import { GlassPanel } from "./shared/glass-panel";
import { GoldButton } from "./shared/gold-button";
import type { ViewId, ViewParams } from "@/app/mock/full/_shared/types";

interface DeckViewFloorProps {
  deckId: string;
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onBack: () => void;
}

export function DeckViewFloor({ deckId, onNavigate, onBack }: DeckViewFloorProps) {
  const deck = getDeckById(deckId);
  if (!deck) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40">Deck not found</p>
      </div>
    );
  }

  const style = getStyleById(deck.artStyleId);

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="text-sm text-white/40 hover:text-white/70 transition-colors mb-4 flex items-center gap-1"
        >
          <span>&larr;</span> Back
        </motion.button>

        {/* Hero section */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Cover image with layoutId */}
          <motion.div
            layoutId={`deck-cover-${deck.id}`}
            className="w-32 h-48 sm:w-40 sm:h-60 rounded-xl overflow-hidden shrink-0 self-center sm:self-start"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <img
              src={deck.coverUrl}
              alt={deck.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Deck info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 30 }}
            className="text-center sm:text-left"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white/90">{deck.name}</h1>
            <p className="text-white/50 text-sm mt-2 max-w-md">{deck.description}</p>
            <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
              <span className="text-xs text-white/30">{deck.cardCount} cards</span>
              {style && (
                <>
                  <span className="text-white/10">|</span>
                  <span className="text-xs text-[#c9a94e]/70">{style.name}</span>
                </>
              )}
              <span className="text-white/10">|</span>
              <span className="text-xs text-white/30">{deck.createdAt}</span>
            </div>
            <div className="mt-4">
              <GoldButton
                onClick={() => onNavigate("reading")}
                className="text-sm px-5 py-2.5"
              >
                Start Reading
              </GoldButton>
            </div>
          </motion.div>
        </div>

        {/* Card Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            Cards in this deck
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {deck.cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.06, type: "spring", stiffness: 300, damping: 30 }}
              >
                <motion.button
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigate("card-detail", { cardId: card.id, deckId: deck.id })}
                  className="w-full text-left"
                >
                  <motion.div
                    layoutId={`card-image-${card.id}`}
                    className="aspect-[2/3] rounded-xl overflow-hidden border border-[#c9a94e]/20 shadow-lg shadow-purple-900/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <p className="text-xs text-white/60 mt-1.5 text-center truncate px-1">
                    {card.title}
                  </p>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}
