"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";

// ─── View Props ──────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DecksView({ navigate }: ViewProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <h1
            className="text-2xl sm:text-3xl text-[#f0e6d2] tracking-wide"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            Your Collection
          </h1>
          <p className="text-sm text-[#b8a88a] mt-1">
            {MOCK_DECKS.length} Decks
          </p>
        </motion.div>

        {/* ── Deck Grid ─────────────────────────────────────────────── */}
        <motion.div
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {MOCK_DECKS.map((deck) => (
            <motion.div
              key={deck.id}
              variants={fadeUp}
              layoutId={`deck-${deck.id}`}
              onClick={() => navigate("deck-detail", { deckId: deck.id })}
              className="group cursor-pointer bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl shadow-lg shadow-[#c9a94e]/5 overflow-hidden transition-colors hover:border-[#c9a94e]/30"
            >
              {/* Cover image */}
              <div className="relative aspect-[3/2] overflow-hidden">
                <img
                  src={deck.coverUrl}
                  alt={deck.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Bottom gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b08] via-[#0f0b08]/40 to-transparent" />

                {/* Card count badge */}
                <div className="absolute bottom-3 right-3 text-[10px] text-[#f0e6d2] px-2 py-0.5 border border-[#c9a94e]/30 rounded-full bg-[#0f0b08]/60 backdrop-blur-sm">
                  {deck.cardCount} Cards
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3
                  className="text-base text-[#f0e6d2] group-hover:text-[#e0c65c] transition-colors"
                  style={{ fontFamily: "var(--font-manuscript), serif" }}
                >
                  {deck.name}
                </h3>
                <p className="text-xs text-[#b8a88a] mt-1 line-clamp-2">
                  {deck.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* ── Inscribe New Deck ─────────────────────────────────── */}
          <motion.div
            variants={fadeUp}
            onClick={() => navigate("create-deck")}
            className="group cursor-pointer border-2 border-dashed border-[#8b7340]/40 rounded-2xl overflow-hidden transition-colors hover:border-[#c9a94e]/60 hover:bg-[#c9a94e]/5 flex flex-col"
          >
            {/* Match aspect ratio of other cards */}
            <div className="aspect-[3/2] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full border border-[#8b7340]/50 flex items-center justify-center group-hover:border-[#c9a94e]/70 transition-colors">
                  <Plus className="w-6 h-6 text-[#c9a94e]/70 group-hover:text-[#c9a94e] transition-colors" />
                </div>
                <span
                  className="text-sm text-[#c9a94e]/70 group-hover:text-[#c9a94e] transition-colors"
                  style={{ fontFamily: "var(--font-manuscript), serif" }}
                >
                  Inscribe New Deck
                </span>
              </div>
            </div>

            {/* Empty info block to match the layout height of other cards */}
            <div className="p-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
