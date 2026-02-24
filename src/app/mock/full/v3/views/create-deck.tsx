"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lunar } from "../lunar-theme";
import { LunarCardFront } from "../lunar-card";
import { MOCK_ART_STYLES, MOCK_DECKS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams, CreatePhase } from "../../_shared/types";

// ─── Art style color mapping (static — no dynamic Tailwind) ───────────────────

const STYLE_COLORS: Record<string, string> = {
  "tarot-classic": "#b8860b",
  "watercolor-dream": "#d4a0d4",
  "celestial": "#4b0082",
  "botanical": "#2e7d32",
  "abstract-mystic": "#9c27b0",
  "dark-gothic": "#8b0000",
  "art-nouveau": "#00897b",
  "ethereal-light": "#87ceeb",
};

// ─── Card count options ────────────────────────────────────────────────────────

const CARD_COUNTS = [6, 8, 10, 12] as const;

// ─── Tidal shimmer keyframe injector ─────────────────────────────────────────

function TidalKeyframes() {
  return (
    <style>{`
      @keyframes tidal {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <motion.button
      onClick={onBack}
      className="flex items-center gap-2 mb-6"
      style={{ color: lunar.muted }}
      whileHover={{ color: lunar.pearl, x: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Chevron left */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm">Back to Decks</span>
    </motion.button>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium mb-2" style={{ color: lunar.pearl }}>
      {children}
    </label>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

const inputClass =
  "w-full bg-[#0c1829]/80 border border-[#1e3460]/50 rounded-xl px-4 py-3 text-[#dce8f0] placeholder-[#6888a8]/50 focus:outline-none focus:border-[#7ab8e8]/50 transition-colors duration-200";

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ total, revealed }: { total: number; revealed: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 8,
            height: 8,
            border: `1px solid ${lunar.glow}50`,
            backgroundColor: i < revealed ? lunar.glow : "transparent",
          }}
          animate={
            i < revealed
              ? { boxShadow: `0 0 6px 2px ${lunar.glow}60` }
              : { boxShadow: "none" }
          }
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function LunarCreateDeck({
  onNavigate,
  onBack,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
  onBack: () => void;
}) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<CreatePhase>("input");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState<number>(8);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  // ── Generation state ────────────────────────────────────────────────────────
  const [generatedCards, setGeneratedCards] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isImmersive = phase === "generating" || phase === "done";

  // ── Source deck cards (use first deck, sliced to cardCount) ─────────────────
  const sourceDeck = MOCK_DECKS[0];
  const cardsToGenerate = sourceDeck.cards.slice(0, cardCount);

  // ── Generation timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "generating") return;

    setGeneratedCards([]);

    let idx = 0;
    timerRef.current = setInterval(() => {
      idx += 1;
      setGeneratedCards((prev) => [...prev, idx - 1]);

      if (idx >= cardCount) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => setPhase("done"), 500);
      }
    }, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, cardCount]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleGenerate() {
    if (!theme || !selectedStyle) return;
    setPhase("generating");
  }

  function handleReset() {
    setPhase("input");
    setTheme("");
    setDescription("");
    setCardCount(8);
    setSelectedStyle(null);
    setGeneratedCards([]);
  }

  // ── Form view ───────────────────────────────────────────────────────────────
  if (!isImmersive) {
    return (
      <div className="px-4 py-6 md:px-8 md:py-8">
        <TidalKeyframes />
        <div className="max-w-2xl mx-auto">
          <BackButton onBack={onBack} />

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-2xl mb-1" style={{ color: lunar.foam }}>
              Create a New Deck
            </h1>
            <p className="text-sm" style={{ color: lunar.muted }}>
              Channel the moonlight into a new oracle deck.
            </p>
          </div>

          <div className="space-y-6">
            {/* Theme input */}
            <div>
              <FieldLabel>Deck Theme</FieldLabel>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g., Inner Growth, Shadow Work..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>

            {/* Description */}
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea
                className={inputClass}
                placeholder="What is this deck about?"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            {/* Card count */}
            <div>
              <FieldLabel>Number of Cards</FieldLabel>
              <div className="flex items-center gap-2">
                {CARD_COUNTS.map((count) => {
                  const isSelected = cardCount === count;
                  return (
                    <motion.button
                      key={count}
                      onClick={() => setCardCount(count)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      style={{
                        background: isSelected
                          ? `${lunar.glow}20`
                          : lunar.surface2,
                        border: isSelected
                          ? `1px solid ${lunar.glow}40`
                          : `1px solid ${lunar.border}50`,
                        color: isSelected ? lunar.glow : lunar.muted,
                      }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {count}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Art style picker */}
            <div>
              <FieldLabel>Art Style</FieldLabel>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {MOCK_ART_STYLES.slice(0, 8).map((style) => {
                  const isSelected = selectedStyle === style.id;
                  const dotColor = STYLE_COLORS[style.id] ?? lunar.glow;

                  return (
                    <motion.button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className="p-3 rounded-xl text-left transition-colors duration-200"
                      style={{
                        background: isSelected
                          ? `${lunar.glow}10`
                          : lunar.surface,
                        border: isSelected
                          ? `1px solid ${lunar.glow}50`
                          : `1px solid ${lunar.border}30`,
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {/* Colored indicator dot */}
                        <div
                          className="rounded-full shrink-0"
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: dotColor,
                            boxShadow: isSelected ? `0 0 6px 2px ${dotColor}60` : "none",
                          }}
                        />
                        <span
                          className="text-xs font-medium leading-tight"
                          style={{ color: isSelected ? lunar.pearl : lunar.silver }}
                        >
                          {style.name}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Generate CTA */}
            <motion.button
              onClick={handleGenerate}
              disabled={!theme || !selectedStyle}
              className="w-full mt-6 py-3.5 rounded-xl font-medium text-sm tracking-wide transition-opacity duration-200"
              style={{
                background: !theme || !selectedStyle
                  ? lunar.surface2
                  : `linear-gradient(90deg, ${lunar.tide}, ${lunar.glow}, ${lunar.tide})`,
                backgroundSize: "200% 100%",
                animation:
                  !theme || !selectedStyle ? "none" : "tidal 3s ease infinite",
                color:
                  !theme || !selectedStyle ? lunar.muted : lunar.bg,
                border:
                  !theme || !selectedStyle
                    ? `1px solid ${lunar.border}40`
                    : "none",
                cursor: !theme || !selectedStyle ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
              whileHover={!theme || !selectedStyle ? {} : { scale: 1.02 }}
              whileTap={!theme || !selectedStyle ? {} : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              Generate Deck
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // ── Generation / Done view ───────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 py-8">
      <TidalKeyframes />

      {/* Phase label */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={phase}
          className="text-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <p
            className="font-serif text-xl mb-1"
            style={{ color: lunar.pearl }}
          >
            {phase === "generating"
              ? "The tides are rising..."
              : "Your deck is ready"}
          </p>
          <p className="text-sm" style={{ color: lunar.muted }}>
            {phase === "generating"
              ? "Your cards are emerging from the depths."
              : `${cardCount} cards have answered the call.`}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Card reveal area */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl w-full">
        {cardsToGenerate.map((card, i) => {
          const isRevealed = generatedCards.includes(i);
          return (
            <AnimatePresence key={card.id}>
              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                >
                  <LunarCardFront
                    imageUrl={card.imageUrl}
                    title={card.title}
                    size="sm"
                    glowDelay={i * 0.15}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* Progress dots */}
      <ProgressDots total={cardCount} revealed={generatedCards.length} />

      {/* Done actions */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            className="flex items-center gap-3 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.1 }}
          >
            {/* View Deck */}
            <motion.button
              onClick={() => onNavigate("deck-detail", { deckId: MOCK_DECKS[0].id })}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: `${lunar.glow}20`,
                border: `1px solid ${lunar.glow}40`,
                color: lunar.glow,
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 0 20px ${lunar.glow}30`,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              View Deck
            </motion.button>

            {/* Create Another */}
            <motion.button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: lunar.surface2,
                border: `1px solid ${lunar.border}`,
                color: lunar.pearl,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              Create Another
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
