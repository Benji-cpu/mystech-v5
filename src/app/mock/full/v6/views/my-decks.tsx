"use client";

import { motion } from "framer-motion";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── Theme ───────────────────────────────────────────────────────────────────

const T = {
  bg: "#0a0118",
  surface: "#110220",
  surface2: "#1a0530",
  border: "rgba(201,169,78,0.15)",
  gold: "#c9a94e",
  goldBright: "#e8c84e",
  goldDim: "#8a7535",
  text: "#e8e0d4",
  textMuted: "#9e957e",
} as const;

// ─── Props ───────────────────────────────────────────────────────────────────

interface MarionetteMyDecksProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

// ─── Deck Card ───────────────────────────────────────────────────────────────

interface DeckCardProps {
  deck: (typeof MOCK_DECKS)[number];
  index: number;
  onClick: () => void;
}

function DeckCard({ deck, index, onClick }: DeckCardProps) {
  return (
    <motion.div
      className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.03,
        boxShadow: `0 8px 32px rgba(201, 169, 78, 0.28), 0 0 0 1px rgba(201, 169, 78, 0.18)`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        border: `1px solid ${T.border}`,
        boxShadow: `0 4px 16px rgba(10, 1, 24, 0.6)`,
      }}
    >
      {/* Cover image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={deck.coverUrl}
        alt={deck.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay -- bottom fade */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 40%, ${T.bg} 100%)`,
        }}
      />

      {/* Card count badge */}
      <div className="absolute top-3 right-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${T.surface}cc`,
            color: T.textMuted,
            border: `1px solid ${T.border}`,
            backdropFilter: "blur(8px)",
          }}
        >
          {deck.cardCount} cards
        </span>
      </div>

      {/* Deck name */}
      <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <h3
          className="font-serif text-lg leading-tight"
          style={{ color: T.text, textShadow: `0 2px 8px rgba(10, 1, 24, 0.9)` }}
        >
          {deck.name}
        </h3>
      </div>
    </motion.div>
  );
}

// ─── New Deck Card ───────────────────────────────────────────────────────────

interface NewDeckCardProps {
  index: number;
  onClick: () => void;
}

function NewDeckCard({ index, onClick }: NewDeckCardProps) {
  return (
    <motion.div
      className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer flex flex-col items-center justify-center gap-3"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: index * 0.08,
      }}
      whileHover={{
        scale: 1.03,
        backgroundColor: T.surface2,
        borderColor: `rgba(201, 169, 78, 0.4)`,
        boxShadow: `0 8px 32px rgba(201, 169, 78, 0.15)`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        backgroundColor: `${T.surface}80`,
        border: `1.5px dashed ${T.border}`,
      }}
    >
      {/* Plus icon */}
      <motion.div
        className="flex items-center justify-center w-14 h-14 rounded-full"
        style={{
          backgroundColor: `rgba(201, 169, 78, 0.08)`,
          border: `1px solid rgba(201, 169, 78, 0.25)`,
        }}
        whileHover={{ scale: 1.1 }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="14"
            y1="5"
            x2="14"
            y2="23"
            stroke={T.gold}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="14"
            x2="23"
            y2="14"
            stroke={T.gold}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <span
        className="text-sm font-medium"
        style={{ color: T.gold }}
      >
        Create New Deck
      </span>
    </motion.div>
  );
}

// ─── MarionetteMyDecks ──────────────────────────────────────────────────────

export function MarionetteMyDecks({ onNavigate }: MarionetteMyDecksProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Page header */}
      <motion.div
        className="shrink-0 px-4 pt-4 pb-5 sm:px-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1
          className="font-serif text-3xl sm:text-4xl tracking-tight"
          style={{ color: T.text }}
        >
          Your Decks
        </h1>
        <p className="mt-1 text-sm" style={{ color: T.textMuted }}>
          {MOCK_DECKS.length} deck{MOCK_DECKS.length !== 1 ? "s" : ""} in your collection
        </p>
      </motion.div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_DECKS.map((deck, i) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              index={i}
              onClick={() => onNavigate("deck-detail", { deckId: deck.id })}
            />
          ))}

          <NewDeckCard
            index={MOCK_DECKS.length}
            onClick={() => onNavigate("create-deck")}
          />
        </div>
      </div>
    </div>
  );
}
