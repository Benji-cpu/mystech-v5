"use client";

import { motion } from "framer-motion";
import { MOCK_DECKS, getStyleById } from "@/app/mock/full/_shared/mock-data-v1";
import { GlassPanel } from "./shared/glass-panel";
import type { ViewId, ViewParams } from "@/app/mock/full/_shared/types";

interface DecksFloorProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

export function DecksFloor({ onNavigate }: DecksFloorProps) {
  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white/90">My Decks</h1>
            <p className="text-sm text-white/40 mt-1">{MOCK_DECKS.length} decks, {MOCK_DECKS.reduce((s, d) => s + d.cardCount, 0)} cards total</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("create-deck")}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#c9a94e]/20 border border-[#c9a94e]/30 flex items-center justify-center text-[#c9a94e] text-xl hover:bg-[#c9a94e]/30 transition-colors"
          >
            +
          </motion.button>
        </motion.div>

        {/* Deck Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {MOCK_DECKS.map((deck, idx) => {
            const style = getStyleById(deck.artStyleId);
            return (
              <motion.div
                key={deck.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, type: "spring", stiffness: 300, damping: 30 }}
              >
                <GlassPanel
                  onClick={() => onNavigate("deck-detail", { deckId: deck.id })}
                  className="overflow-hidden group hover:border-[#c9a94e]/20 transition-colors cursor-pointer"
                >
                  {/* Cover image */}
                  <motion.div
                    layoutId={`deck-cover-${deck.id}`}
                    className="aspect-[3/4] relative overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <img
                      src={deck.coverUrl}
                      alt={deck.name}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Card count badge */}
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white/80">
                      {deck.cardCount}
                    </div>
                  </motion.div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white/90 truncate">{deck.name}</h3>
                    {style && (
                      <p className="text-xs text-[#c9a94e]/70 mt-0.5">{style.name}</p>
                    )}
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}

          {/* New Deck CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + MOCK_DECKS.length * 0.08, type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.button
              whileHover={{ scale: 1.02, borderColor: "rgba(201,169,78,0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate("create-deck")}
              className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-[#c9a94e]/60 transition-colors"
            >
              <span className="text-3xl">+</span>
              <span className="text-xs font-medium">New Deck</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom spacer */}
        <div className="h-20" />
      </div>
    </div>
  );
}
