"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getCardById, getDeckById } from "../../_shared/mock-data-v1";
import { GildedFlipCard } from "../gilded-card";

// ─── ViewProps ──────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Animation variants ────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── Ornamental Divider (inline) ────────────────────────────────────────────

function OrnamentDivider() {
  return (
    <div
      className="w-full flex items-center justify-center py-3"
      aria-hidden="true"
    >
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: "rgba(61, 48, 32, 0.3)" }}
      />
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="mx-3 shrink-0"
      >
        <path
          d="M6 0 L8.5 6 L6 12 L3.5 6 Z"
          fill="#c9a94e"
          fillOpacity={0.5}
        />
      </svg>
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: "rgba(61, 48, 32, 0.3)" }}
      />
    </div>
  );
}

// ─── CardDetailView ─────────────────────────────────────────────────────────

export function CardDetailView({ viewParams }: ViewProps) {
  const card = getCardById(viewParams.cardId || "sg-1");
  const deck = card ? getDeckById(card.deckId) : undefined;

  const [isFlipped, setIsFlipped] = useState(true);

  if (!card) {
    return (
      <div className="h-full flex items-center justify-center">
        <p style={{ color: "#b8a88a" }}>Card not found.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <div className="max-w-md mx-auto px-4 pt-8 sm:pt-12 flex flex-col items-center gap-6">
        {/* Card display area */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <GildedFlipCard
            imageUrl={card.imageUrl}
            title={card.title}
            isFlipped={isFlipped}
            size="lg"
            enableTilt
            onFlip={() => setIsFlipped(!isFlipped)}
          />

          {/* Pulsing hint text */}
          <motion.p
            className="text-xs text-center select-none"
            style={{ color: "#b8a88a" }}
            animate={{ opacity: [0.4, 0.8] }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.6,
              ease: "easeInOut",
            }}
          >
            Tap to turn the page
          </motion.p>
        </motion.div>

        {/* Info panel */}
        <motion.div
          className="w-full rounded-2xl p-5"
          style={{
            backgroundColor: "rgba(26, 21, 16, 0.7)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(61, 48, 32, 0.5)",
          }}
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Card title */}
          <motion.h2
            variants={fadeUp}
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-manuscript), serif",
              color: "#f0e6d2",
            }}
          >
            {card.title}
          </motion.h2>

          {/* Deck attribution */}
          {deck && (
            <motion.p
              variants={fadeUp}
              className="text-xs mt-1"
              style={{ color: "#8b7340" }}
            >
              from {deck.name}
            </motion.p>
          )}

          {/* Ornamental divider */}
          <motion.div variants={fadeUp}>
            <OrnamentDivider />
          </motion.div>

          {/* Meaning section */}
          <motion.div variants={fadeUp}>
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-1.5"
              style={{ color: "#c9a94e" }}
            >
              Meaning
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#f0e6d2" }}
            >
              {card.meaning}
            </p>
          </motion.div>

          {/* Separator */}
          <motion.div
            variants={fadeUp}
            className="my-4"
            style={{ borderTop: "1px solid rgba(61, 48, 32, 0.3)" }}
          />

          {/* Guidance section */}
          <motion.div variants={fadeUp}>
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-1.5"
              style={{ color: "#c9a94e" }}
            >
              Guidance
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#f0e6d2" }}
            >
              {card.guidance}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
