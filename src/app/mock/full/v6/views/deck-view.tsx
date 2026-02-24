"use client";

import { motion } from "framer-motion";
import { getDeckById } from "../../_shared/mock-data-v1";
import type { MockFullCard } from "../../_shared/types";
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

// ─── Art style display names ────────────────────────────────────────────────

const artStyleLabels: Record<string, string> = {
  botanical: "Botanical",
  "dark-gothic": "Dark Gothic",
  celestial: "Celestial",
  "watercolor-dream": "Watercolor Dream",
  "tarot-classic": "Tarot Classic",
  "abstract-mystic": "Abstract Mystic",
  "art-nouveau": "Art Nouveau",
  "ethereal-light": "Ethereal Light",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface MarionetteDeckViewProps {
  deckId: string;
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onBack: () => void;
}

// ─── Back Button ─────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      className="flex items-center gap-2 min-h-[44px] min-w-[44px] px-1"
      onClick={onClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4L6 10L12 16"
          stroke={T.textMuted}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm" style={{ color: T.textMuted }}>
        Back
      </span>
    </motion.button>
  );
}

// ─── Info Pill ───────────────────────────────────────────────────────────────

function InfoPill({ label }: { label: string }) {
  return (
    <span
      className="text-xs px-3 py-1 rounded-full"
      style={{
        backgroundColor: `${T.surface}cc`,
        color: T.textMuted,
        border: `1px solid ${T.border}`,
      }}
    >
      {label}
    </span>
  );
}

// ─── Card Thumbnail ─────────────────────────────────────────────────────────

interface CardThumbnailProps {
  card: MockFullCard;
  index: number;
  onClick: () => void;
}

function CardThumbnail({ card, index, onClick }: CardThumbnailProps) {
  return (
    <motion.div
      className="relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        delay: 0.1 + index * 0.05,
      }}
      whileHover={{
        scale: 1.04,
        boxShadow: `0 0 0 1px rgba(201, 169, 78, 0.5), 0 6px 20px rgba(201, 169, 78, 0.2)`,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        border: `1px solid ${T.border}`,
      }}
    >
      {/* Card image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.imageUrl}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Bottom gradient for title */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background: `linear-gradient(to bottom, transparent, ${T.bg}ee)`,
        }}
      />

      {/* Card title */}
      <div className="absolute inset-x-0 bottom-0 px-2 pb-2">
        <p
          className="text-xs font-serif leading-tight text-center"
          style={{
            color: T.text,
            textShadow: `0 1px 4px rgba(10, 1, 24, 0.95)`,
          }}
        >
          {card.title}
        </p>
      </div>
    </motion.div>
  );
}

// ─── MarionetteDeckView ─────────────────────────────────────────────────────

export function MarionetteDeckView({ deckId, onNavigate, onBack }: MarionetteDeckViewProps) {
  const deck = getDeckById(deckId);

  if (!deck) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-serif" style={{ color: T.text }}>
          Deck not found
        </p>
        <button
          className="text-sm underline"
          style={{ color: T.textMuted }}
          onClick={onBack}
        >
          Go back
        </button>
      </div>
    );
  }

  const styleLabel = artStyleLabels[deck.artStyleId] ?? deck.artStyleId;
  const formattedDate = new Date(deck.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header section ── */}
      <div className="relative shrink-0 overflow-hidden">
        {/* Blurred background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={deck.coverUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          style={{ opacity: 0.28 }}
        />

        {/* Gradient overlay: transparent top -> bg bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${T.bg} 85%)`,
          }}
        />

        {/* Header content */}
        <div className="relative z-10 px-4 pt-3 pb-6 sm:px-6">
          {/* Back button */}
          <BackButton onClick={onBack} />

          {/* Deck title and meta */}
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
          >
            <h1
              className="font-serif text-3xl sm:text-4xl tracking-tight"
              style={{ color: T.text }}
            >
              {deck.name}
            </h1>

            {deck.description && (
              <p className="mt-2 text-sm leading-relaxed max-w-prose" style={{ color: T.textMuted }}>
                {deck.description}
              </p>
            )}

            {/* Pill row */}
            <div className="mt-4 flex flex-wrap gap-2">
              <InfoPill label={styleLabel} />
              <InfoPill label={`${deck.cardCount} cards`} />
              <InfoPill label={`Created ${formattedDate}`} />
            </div>

            {/* Start Reading button */}
            <motion.button
              className="mt-4 py-2.5 px-6 rounded-xl text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
                color: T.bg,
                boxShadow: `0 4px 20px rgba(201,169,78,0.35)`,
              }}
              whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate("reading")}
            >
              Start Reading
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* ── Card grid (scrollable) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {deck.cards.map((card, i) => (
            <CardThumbnail
              key={card.id}
              card={card}
              index={i}
              onClick={() => onNavigate("card-detail", { deckId, cardId: card.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
