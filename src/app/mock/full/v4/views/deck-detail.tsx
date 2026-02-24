"use client";

import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getDeckById, MOCK_ART_STYLES } from "../../_shared/mock-data-v1";

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

// ─── DeckDetailView ────────────────────────────────────────────────────────

export function DeckDetailView({ navigate, viewParams }: ViewProps) {
  const deck = getDeckById(viewParams.deckId || "souls-garden");

  if (!deck) {
    return (
      <div className="h-full flex items-center justify-center">
        <p style={{ color: "#b8a88a" }}>Deck not found.</p>
      </div>
    );
  }

  // Look up the art style name
  const artStyle = MOCK_ART_STYLES.find((s) => s.id === deck.artStyleId);
  const artStyleName = artStyle?.name || deck.artStyleId;

  // Format creation date
  const createdDate = new Date(deck.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      {/* Hero section */}
      <div className="relative" style={{ minHeight: 200 }}>
        {/* Blurred cover background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={deck.coverUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-2xl"
          style={{ opacity: 0.3 }}
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 30%, #0f0b08 100%)",
          }}
        />

        {/* Content overlay */}
        <motion.div
          className="relative z-10 px-4 sm:px-6 pt-14 pb-6 flex flex-col gap-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-manuscript), serif",
              color: "#f0e6d2",
            }}
          >
            {deck.name}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base leading-relaxed max-w-lg"
            style={{ color: "#b8a88a" }}
          >
            {deck.description}
          </motion.p>

          {/* Info pills row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap gap-2 mt-1"
          >
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: "#241c14",
                border: "1px solid rgba(61, 48, 32, 0.5)",
                color: "#b8a88a",
              }}
            >
              {artStyleName}
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: "#241c14",
                border: "1px solid rgba(61, 48, 32, 0.5)",
                color: "#b8a88a",
              }}
            >
              {deck.cardCount} cards
            </span>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: "#241c14",
                border: "1px solid rgba(61, 48, 32, 0.5)",
                color: "#b8a88a",
              }}
            >
              {createdDate}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Card grid */}
      <motion.div
        className="px-4 sm:px-6 pt-4"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {deck.cards.map((card) => (
            <motion.button
              key={card.id}
              variants={fadeUp}
              className="relative rounded-xl overflow-hidden group focus:outline-none"
              style={{
                aspectRatio: "2 / 3",
                border: "1px solid rgba(61, 48, 32, 0.4)",
              }}
              whileHover={{
                borderColor: "rgba(201, 169, 78, 0.5)",
                scale: 1.02,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                },
              }}
              onClick={() =>
                navigate("card-detail", {
                  deckId: deck.id,
                  cardId: card.id,
                })
              }
            >
              {/* Card image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Bottom gradient overlay */}
              <div
                className="absolute inset-x-0 bottom-0 h-2/5"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(15, 11, 8, 0.9))",
                }}
              />

              {/* Title */}
              <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 flex items-end justify-center">
                <span
                  className="text-center leading-tight text-xs sm:text-sm"
                  style={{
                    fontFamily: "var(--font-manuscript), serif",
                    color: "#f0e6d2",
                    textShadow: "0 1px 4px rgba(15, 11, 8, 0.9)",
                  }}
                >
                  {card.title}
                </span>
              </div>

              {/* Hover gold glow effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  boxShadow:
                    "inset 0 0 20px 2px rgba(201, 169, 78, 0.15)",
                }}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
