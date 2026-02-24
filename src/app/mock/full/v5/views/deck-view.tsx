"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { getDeckById } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkTextReveal } from "../ink-text-reveal";
import { InkStagger, InkStaggerItem, InkFade } from "../ink-transitions";
import { InkCardFront } from "../ink-card";
import { inkGlass } from "../ink-theme";
import { INK } from "../ink-theme";

// ─── Props ───────────────────────────────────────────────────────────────────

interface DeckViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  params: { deckId?: string };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DeckViewView({ navigate, goBack, params }: DeckViewProps) {
  const deck = params.deckId ? getDeckById(params.deckId) : undefined;

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <p className="text-slate-400 text-sm">Deck not found</p>
        <button
          onClick={goBack}
          className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  const artStyleLabel = deck.artStyleId
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="min-h-full pb-8">
      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden">
        {/* Blurred cover background */}
        <div className="absolute inset-0 z-0">
          <img
            src={deck.coverUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "blur(40px)", opacity: 0.3, transform: "scale(1.2)" }}
            draggable={false}
          />
        </div>

        {/* Dark overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(2,4,8,0.5) 0%, rgba(2,4,8,0.85) 70%, #020408 100%)",
          }}
        />

        {/* Hero content */}
        <div className="relative z-[2] px-4 md:px-8 pt-8 pb-6 md:pt-12 md:pb-8 max-w-4xl mx-auto">
          <InkTextReveal
            text={deck.name}
            as="h1"
            className="text-2xl md:text-3xl font-semibold tracking-tight"
            glowColor={INK.cyanGlow}
          />

          <InkFade delay={0.3}>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl leading-relaxed">
              {deck.description}
            </p>
          </InkFade>

          <InkFade delay={0.5}>
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {/* Card count pill */}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  color: INK.cyan,
                  background: "rgba(0, 229, 255, 0.06)",
                  border: "1px solid rgba(0, 229, 255, 0.12)",
                }}
              >
                {deck.cardCount} cards
              </span>

              {/* Art style pill */}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  color: INK.violet,
                  background: "rgba(139, 92, 246, 0.06)",
                  border: "1px solid rgba(139, 92, 246, 0.12)",
                }}
              >
                {artStyleLabel}
              </span>
            </div>
          </InkFade>
        </div>
      </div>

      {/* ── Card Grid ───────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 mt-2 max-w-4xl mx-auto">
        <InkStagger
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
          staggerDelay={0.07}
        >
          {deck.cards.map((card) => (
            <InkStaggerItem key={card.id}>
              <motion.button
                onClick={() =>
                  navigate("card-detail", {
                    deckId: deck.id,
                    cardId: card.id,
                  })
                }
                className="w-full flex flex-col items-center gap-2 group cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
              >
                {/* Card with cyan glow on hover */}
                <motion.div
                  className="rounded-xl overflow-hidden"
                  whileHover={{
                    boxShadow: `0 0 24px ${INK.cyanGlowSoft}, 0 0 48px rgba(0, 229, 255, 0.06)`,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <InkCardFront card={card} size="md" />
                </motion.div>

                {/* Card title below */}
                <span
                  className="text-xs text-slate-400 group-hover:text-cyan-400/80 transition-colors duration-200 text-center leading-tight"
                >
                  {card.title}
                </span>
              </motion.button>
            </InkStaggerItem>
          ))}
        </InkStagger>
      </div>

      {/* ── Start Reading Button ────────────────────────────────────────────── */}
      <InkFade delay={0.6} className="px-4 md:px-8 mt-8 max-w-4xl mx-auto">
        <motion.button
          onClick={() => navigate("reading")}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-medium transition-colors ${inkGlass}`}
          style={{
            color: INK.cyan,
            borderColor: "rgba(0, 229, 255, 0.15)",
            boxShadow: `0 0 20px ${INK.cyanGlowSoft}`,
          }}
          whileHover={{
            boxShadow: `0 0 32px ${INK.cyanGlow}, 0 0 64px ${INK.cyanGlowSoft}`,
            borderColor: "rgba(0, 229, 255, 0.3)",
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
        >
          <BookOpen className="w-4 h-4" />
          Start Reading with This Deck
        </motion.button>
      </InkFade>
    </div>
  );
}
