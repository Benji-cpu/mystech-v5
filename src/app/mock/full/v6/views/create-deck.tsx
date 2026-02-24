"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import { T, SPRING } from "../marionette-theme";

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onBack: () => void;
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

// ─── Card Counts ────────────────────────────────────────────────────────────

const CARD_COUNTS = [6, 8, 10, 12] as const;

// ─── Component ──────────────────────────────────────────────────────────────

export function MarionetteCreateDeck({ onNavigate, onBack }: Props) {
  const [cardCount, setCardCount] = useState(8);
  const [selectedStyle, setSelectedStyle] = useState("tarot-classic");

  const displayedStyles = MOCK_ART_STYLES.slice(0, 8);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Scrollable Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-32 md:pb-8">
        <motion.div
          className="max-w-2xl mx-auto px-4 py-6 md:px-8 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${T.border}`,
                  color: T.textMuted,
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h1
                className="text-2xl md:text-3xl font-semibold"
                style={{ fontFamily: "var(--font-playfair), serif", color: T.text }}
              >
                Create Your Deck
              </h1>
            </div>

            {/* Ornamental divider */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${T.border}, transparent)` }} />
              <div
                className="w-2 h-2 rotate-45"
                style={{ backgroundColor: `${T.gold}30`, border: `1px solid ${T.gold}40` }}
              />
              <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${T.border}, transparent)` }} />
            </div>
          </motion.div>

          {/* ── Deck Name ───────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label
              className="text-xs uppercase tracking-widest font-medium"
              style={{ color: T.gold }}
            >
              Deck Name
            </label>
            <input
              type="text"
              placeholder="Name your deck..."
              className="w-full px-4 py-3 rounded-xl outline-none transition-all"
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                color: T.text,
                caretColor: T.gold,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${T.gold}60`;
                e.currentTarget.style.boxShadow = `0 0 12px rgba(201,169,78,0.15)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </motion.div>

          {/* ── Description ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label
              className="text-xs uppercase tracking-widest font-medium"
              style={{ color: T.gold }}
            >
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What story will this deck tell?"
              className="w-full px-4 py-3 rounded-xl outline-none resize-none transition-all"
              style={{
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
                color: T.text,
                caretColor: T.gold,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = `${T.gold}60`;
                e.currentTarget.style.boxShadow = `0 0 12px rgba(201,169,78,0.15)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </motion.div>

          {/* ── Card Count ──────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label
              className="text-xs uppercase tracking-widest font-medium"
              style={{ color: T.gold }}
            >
              Number of Cards
            </label>
            <div className="flex gap-2">
              {CARD_COUNTS.map((count) => {
                const isActive = cardCount === count;
                return (
                  <motion.button
                    key={count}
                    onClick={() => setCardCount(count)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
                            color: T.bg,
                            boxShadow: `0 0 16px rgba(201,169,78,0.3)`,
                          }
                        : {
                            backgroundColor: T.surface,
                            border: `1px solid ${T.border}`,
                            color: T.textMuted,
                          }
                    }
                  >
                    {count}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Art Style ───────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label
              className="text-xs uppercase tracking-widest font-medium"
              style={{ color: T.gold }}
            >
              Art Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {displayedStyles.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <motion.button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative aspect-square rounded-xl overflow-hidden transition-all"
                    style={{
                      border: isSelected
                        ? `2px solid ${T.gold}`
                        : `1px solid ${T.border}`,
                      boxShadow: isSelected
                        ? `0 0 18px rgba(201,169,78,0.3)`
                        : "none",
                    }}
                  >
                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`} />

                    {/* Selected checkmark overlay */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
                            boxShadow: `0 0 12px rgba(201,169,78,0.4)`,
                          }}
                        >
                          <Check size={16} style={{ color: T.bg }} />
                        </div>
                      </motion.div>
                    )}

                    {/* Style name at bottom */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1.5 pt-4">
                      <span className="text-[10px] text-white/80 leading-tight block text-center">
                        {style.name}
                      </span>
                    </div>
                  </motion.button>
                );
              })}

              {/* Custom Style Slot */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1"
                style={{
                  border: `2px dashed ${T.border}`,
                  backgroundColor: "rgba(255,255,255,0.02)",
                }}
              >
                <Plus size={20} style={{ color: T.textMuted }} />
                <span className="text-[10px]" style={{ color: T.textMuted }}>
                  Custom
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Fixed CTA Button ─────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 py-4 md:px-8"
        style={{
          background: `linear-gradient(to top, ${T.bg}, ${T.bg}ee, transparent)`,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={() => onNavigate("generation")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full py-3.5 rounded-xl font-semibold overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
              color: T.bg,
              fontFamily: "var(--font-playfair), serif",
              boxShadow: `0 4px 20px rgba(201,169,78,0.3)`,
            }}
          >
            {/* Animated sheen */}
            <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
              <motion.span
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 55%)",
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            </span>
            <span className="relative z-10 text-base tracking-wide">
              Weave Your Deck
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
