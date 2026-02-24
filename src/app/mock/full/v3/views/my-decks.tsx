"use client";
import { motion } from "framer-motion";
import { lunar } from "../lunar-theme";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LunarMyDecks({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1
            className="font-serif text-2xl mb-1"
            style={{ color: lunar.foam }}
          >
            My Decks
          </h1>
          <p className="text-sm" style={{ color: lunar.muted }}>
            {MOCK_DECKS.length} decks in your collection
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Deck Cards */}
          {MOCK_DECKS.map((deck) => (
            <motion.div key={deck.id} variants={cardVariants}>
              <motion.button
                className="w-full text-left overflow-hidden rounded-xl"
                style={{
                  border: `1px solid ${lunar.border}60`,
                  background: lunar.surface,
                }}
                onClick={() => onNavigate("deck-detail", { deckId: deck.id })}
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 8px 32px ${lunar.glow}25`,
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {/* Aspect ratio container */}
                <div className="aspect-[3/4] relative">
                  {/* Cover image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={deck.coverUrl}
                    alt={deck.name}
                    className="object-cover w-full h-full absolute inset-0"
                  />

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-x-0 bottom-0 h-1/2"
                    style={{
                      background: `linear-gradient(to bottom, transparent, ${lunar.surface}f0)`,
                    }}
                  />

                  {/* Bottom text area */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p
                      className="font-serif text-sm font-medium leading-tight mb-1.5"
                      style={{ color: lunar.foam }}
                    >
                      {deck.name}
                    </p>
                    <span
                      className="inline-block text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${lunar.glow}15`,
                        color: lunar.glow,
                      }}
                    >
                      {deck.cardCount} cards
                    </span>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}

          {/* New Deck Card */}
          <motion.div variants={cardVariants}>
            <motion.button
              className="w-full rounded-xl overflow-hidden"
              style={{
                border: `2px dashed ${lunar.border}80`,
                background: "transparent",
              }}
              onClick={() => onNavigate("create-deck")}
              whileHover={{
                scale: 1.02,
                borderColor: lunar.glow,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2">
                {/* Plus icon */}
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="15"
                    stroke={lunar.muted}
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <line
                    x1="16"
                    y1="9"
                    x2="16"
                    y2="23"
                    stroke={lunar.muted}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="9"
                    y1="16"
                    x2="23"
                    y2="16"
                    stroke={lunar.muted}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

                <span className="text-sm" style={{ color: lunar.muted }}>
                  New Deck
                </span>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
