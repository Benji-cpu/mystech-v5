"use client";

import { motion } from "framer-motion";
import { lunar } from "../lunar-theme";
import { LunarCardFront } from "../lunar-card";
import { getDeckById, getStyleById } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── Animation Variants ───────────────────────────────────────────────────────

const heroVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 28 },
  },
};

const gridContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const cardItemVariants = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 28 },
  },
};

// ─── LunarDeckView ────────────────────────────────────────────────────────────

export function LunarDeckView({
  deckId,
  onNavigate,
  onBack,
}: {
  deckId: string;
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onBack: () => void;
}) {
  const deck = getDeckById(deckId);

  if (!deck) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full px-4 py-12 text-center"
        style={{ color: lunar.muted }}
      >
        <p
          className="font-serif text-xl mb-2"
          style={{ color: lunar.pearl }}
        >
          Deck not found
        </p>
        <p className="text-sm mb-6" style={{ color: lunar.muted }}>
          This deck may have been removed or the link is invalid.
        </p>
        <button
          className="text-sm underline underline-offset-4 transition-colors duration-200"
          style={{ color: lunar.tide }}
          onClick={onBack}
        >
          Go back
        </button>
      </div>
    );
  }

  const styleName = getStyleById(deck.artStyleId)?.name;

  return (
    <div className="px-4 py-6 md:px-8 md:py-8 pb-24">
      <div className="max-w-4xl mx-auto">

        {/* ── Hero Cover ─────────────────────────────────────────────────── */}
        <motion.div
          variants={heroVariants}
          initial="initial"
          animate="animate"
          className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6"
        >
          {/* Cover image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deck.coverUrl}
            alt={deck.name}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay — bottom half fade to bg */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: `linear-gradient(to bottom, transparent, ${lunar.bg})`,
            }}
          />

          {/* Deck info — overlaid at bottom-left */}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
            {/* Deck name */}
            <h1
              className="font-serif text-2xl md:text-3xl leading-tight"
              style={{ color: "#dce8f0" }}
            >
              {deck.name}
            </h1>

            {/* Description */}
            <p
              className="text-sm mt-1 leading-snug max-w-prose"
              style={{ color: "#94a8c0" }}
            >
              {deck.description}
            </p>

            {/* Style tag pill */}
            {styleName && (
              <span
                className="inline-block text-xs mt-2 px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(122, 184, 232, 0.15)",
                  color: "#7ab8e8",
                  border: "1px solid rgba(122, 184, 232, 0.25)",
                }}
              >
                {styleName}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Card Grid ──────────────────────────────────────────────────── */}
        <div>
          {/* Section label */}
          <h2
            className="font-serif text-lg mb-4"
            style={{ color: "#c8dce8" }}
          >
            {deck.cardCount} Cards
          </h2>

          {/* Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
            variants={gridContainerVariants}
            initial="initial"
            animate="animate"
          >
            {deck.cards.map((card, index) => (
              <motion.div
                key={card.id}
                variants={cardItemVariants}
                className="flex items-center justify-center"
                onClick={() =>
                  onNavigate("card-detail", { cardId: card.id, deckId: deck.id })
                }
              >
                <LunarCardFront
                  imageUrl={card.imageUrl}
                  title={card.title}
                  size="md"
                  glowDelay={index * 0.3}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
