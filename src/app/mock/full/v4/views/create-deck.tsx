"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";

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

// ─── Card count options ──────────────────────────────────────────────────────

const CARD_COUNTS = [6, 8, 10, 12] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function CreateDeckView({ navigate }: ViewProps) {
  const [cardCount, setCardCount] = useState(8);
  const [selectedStyle, setSelectedStyle] = useState("tarot-classic");

  const displayedStyles = MOCK_ART_STYLES.slice(0, 8);

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <h1
            className="text-2xl sm:text-3xl text-[#f0e6d2] tracking-wide"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            Inscribe a New Deck
          </h1>
          <p className="text-sm text-[#b8a88a] mt-1">
            Shape your vision into a grimoire of personal meaning
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3d3020]/50 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#c9a94e]/30 border border-[#c9a94e]/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3d3020]/50 to-transparent" />
          </div>
        </motion.div>

        {/* ── Deck Name ───────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-2">
          <label className="text-[#c9a94e] text-xs uppercase tracking-widest font-medium">
            Deck Name
          </label>
          <input
            type="text"
            placeholder="Name your grimoire..."
            className="bg-[#1a1510] border border-[#3d3020]/50 rounded-xl px-4 py-3 text-[#f0e6d2] placeholder-[#b8a88a]/40 focus:ring-1 focus:ring-[#c9a94e]/50 focus:border-[#c9a94e]/50 outline-none w-full transition-colors"
          />
        </motion.div>

        {/* ── Description ─────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-2">
          <label className="text-[#c9a94e] text-xs uppercase tracking-widest font-medium">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="What story will this deck tell?"
            className="bg-[#1a1510] border border-[#3d3020]/50 rounded-xl px-4 py-3 text-[#f0e6d2] placeholder-[#b8a88a]/40 focus:ring-1 focus:ring-[#c9a94e]/50 focus:border-[#c9a94e]/50 outline-none w-full resize-none transition-colors"
          />
        </motion.div>

        {/* ── Card Count ──────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-2">
          <label className="text-[#c9a94e] text-xs uppercase tracking-widest font-medium">
            Number of Cards
          </label>
          <div className="flex gap-2">
            {CARD_COUNTS.map((count) => {
              const isActive = cardCount === count;
              return (
                <button
                  key={count}
                  onClick={() => setCardCount(count)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#c9a94e] text-[#0f0b08]"
                      : "bg-[#1a1510] border border-[#3d3020]/50 text-[#b8a88a] hover:border-[#c9a94e]/30 hover:text-[#f0e6d2]"
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Art Style ───────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-2">
          <label className="text-[#c9a94e] text-xs uppercase tracking-widest font-medium">
            Art Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {displayedStyles.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? "ring-2 ring-[#c9a94e] ring-offset-1 ring-offset-[#0f0b08]"
                      : "ring-1 ring-[#3d3020]/30 hover:ring-[#8b7340]/60"
                  }`}
                >
                  {/* Gradient background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}
                  />

                  {/* Selected checkmark overlay */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#c9a94e] flex items-center justify-center shadow-lg shadow-[#c9a94e]/30">
                        <Check size={16} className="text-[#0f0b08]" />
                      </div>
                    </motion.div>
                  )}

                  {/* Style name at bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4">
                    <span className="text-[10px] text-white/80 leading-tight block text-center">
                      {style.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── CTA Button ──────────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="pt-2 pb-4">
          <button
            onClick={() => navigate("generation")}
            className="relative w-full py-3.5 rounded-xl font-semibold text-[#0f0b08] bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#8b7340] overflow-hidden transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            {/* Animated sheen */}
            <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
              <span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)",
                  animation: "sheen 3s ease-in-out infinite",
                }}
              />
            </span>
            <span className="relative z-10 text-base tracking-wide">
              Begin Inscription
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* Sheen keyframes */}
      <style jsx>{`
        @keyframes sheen {
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
