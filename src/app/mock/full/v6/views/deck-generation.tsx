"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewId, ViewParams, MockFullCard } from "../../_shared/types";
import { MOCK_DECKS } from "../../_shared/mock-data-v1";
import { T, SPRING } from "../marionette-theme";

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TOTAL_CARDS = 8;
const INTERVAL_MS = 2000;
const SOURCE_DECK = MOCK_DECKS.find((d) => d.cards.length >= TOTAL_CARDS) ?? MOCK_DECKS[0];
const SOURCE_CARDS = SOURCE_DECK.cards.slice(0, TOTAL_CARDS);

// ─── Status Messages ────────────────────────────────────────────────────────

function getStatusText(generated: number, done: boolean): string {
  if (done) return "Your deck is ready";
  if (generated === 0) return "Weaving...";
  return `Weaving card ${generated} of ${TOTAL_CARDS}...`;
}

// ─── Thread Particle ────────────────────────────────────────────────────────

function ThreadParticle({ index }: { index: number }) {
  const xOffset = (index - 2.5) * 30;
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 3,
        height: 3,
        backgroundColor: T.gold,
        left: `calc(50% + ${xOffset}px)`,
        top: "50%",
        boxShadow: `0 0 6px 2px ${T.gold}66`,
      }}
      animate={{
        y: [-60, 60],
        opacity: [0.3, 0.9, 0.3],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.6 + index * 0.2,
        delay: index * 0.25,
        ease: "easeInOut",
      }}
    />
  );
}

// ─── Generated Card Slot ────────────────────────────────────────────────────

function CardSlot({
  card,
  index,
  isGenerated,
}: {
  card: MockFullCard;
  index: number;
  isGenerated: boolean;
}) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 56, height: 84 }}>
      {/* Placeholder outline */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          border: `1px dashed ${T.border}`,
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      />

      {/* Generated card */}
      <AnimatePresence>
        {isGenerated && (
          <motion.div
            className="absolute inset-0 rounded-lg overflow-hidden"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          >
            {/* Gold flash overlay */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{
                background: `radial-gradient(circle, ${T.goldBright}80 0%, transparent 70%)`,
              }}
            />

            {/* Card image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageUrl}
              alt={card.title}
              className="w-full h-full object-cover"
            />

            {/* Bottom overlay with title */}
            <div
              className="absolute inset-x-0 bottom-0 px-1 pb-1 pt-3"
              style={{
                background: `linear-gradient(to bottom, transparent, ${T.bg}dd)`,
              }}
            >
              <span
                className="text-[7px] text-center block leading-tight"
                style={{ color: T.text }}
              >
                {card.title}
              </span>
            </div>

            {/* Gold border */}
            <div
              className="absolute inset-0 rounded-lg pointer-events-none"
              style={{ border: `1px solid ${T.gold}40` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MarionetteDeckGeneration({ onNavigate }: Props) {
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setGeneratedCount((prev) => {
        const next = prev + 1;
        if (next >= TOTAL_CARDS) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setTimeout(() => setIsDone(true), 800);
          return TOTAL_CARDS;
        }
        return next;
      });
    }, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = generatedCount / TOTAL_CARDS;
  const statusText = getStatusText(generatedCount, isDone);

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
      {/* ── Status Text ────────────────────────────────────────────────── */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="text-lg md:text-xl font-medium"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: isDone ? T.goldBright : T.text,
            }}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* ── Thread Animation Area ──────────────────────────────────────── */}
      <div className="relative w-full max-w-[240px] h-[140px] mb-8">
        {!isDone &&
          Array.from({ length: 6 }).map((_, i) => (
            <ThreadParticle key={i} index={i} />
          ))}

        {/* Central glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 80,
            height: 80,
            background: `radial-gradient(circle, ${T.gold}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: isDone ? [1, 1.3, 1] : [1, 1.15, 1],
            opacity: isDone ? [0.8, 1, 0.8] : [0.5, 0.8, 0.5],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: isDone ? 1.6 : 2.4,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────────── */}
      <div className="w-full max-w-xs mb-8">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${T.gold}, ${T.goldBright})`,
              boxShadow: `0 0 10px ${T.gold}60`,
            }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
          />
        </div>
        <p
          className="text-xs mt-2 text-center"
          style={{ color: T.textMuted }}
        >
          {generatedCount} / {TOTAL_CARDS} cards
        </p>
      </div>

      {/* ── Card Strip ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-md overflow-x-auto pb-2">
        <div className="flex gap-2 justify-center px-2">
          {SOURCE_CARDS.map((card, i) => (
            <CardSlot
              key={card.id}
              card={card}
              index={i}
              isGenerated={i < generatedCount}
            />
          ))}
        </div>
      </div>

      {/* ── Completion CTA ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
            className="mt-8"
          >
            <motion.button
              onClick={() =>
                onNavigate("deck-detail", { deckId: "souls-garden" })
              }
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl font-semibold text-sm"
              style={{
                background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
                color: T.bg,
                fontFamily: "var(--font-playfair), serif",
                boxShadow: `0 4px 20px rgba(201,169,78,0.3)`,
              }}
            >
              View Deck
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
