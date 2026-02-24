"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { getCardById, getDeckById } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkTextReveal } from "../ink-text-reveal";
import { InkFade, InkScaleIn } from "../ink-transitions";
import { inkGlass } from "../ink-theme";
import { INK } from "../ink-theme";

// ─── Props ───────────────────────────────────────────────────────────────────

interface CardDetailProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  params: { deckId?: string; cardId?: string };
}

// ─── Cycling glow keyframes ──────────────────────────────────────────────────
// Cyan -> Violet -> Cyan, pulsing border glow around the card image.

const glowCycle = {
  boxShadow: [
    `0 0 20px ${INK.cyanGlowSoft}, 0 0 40px rgba(0,229,255,0.05)`,
    `0 0 24px ${INK.violetGlowSoft}, 0 0 48px rgba(139,92,246,0.08)`,
    `0 0 20px ${INK.cyanGlowSoft}, 0 0 40px rgba(0,229,255,0.05)`,
  ],
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CardDetailView({ navigate, goBack, params }: CardDetailProps) {
  const card = params.cardId ? getCardById(params.cardId) : undefined;
  const deck = params.deckId ? getDeckById(params.deckId) : undefined;

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
        <p className="text-slate-400 text-sm">Card not found</p>
        <button
          onClick={goBack}
          className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5 max-w-lg mx-auto text-center min-h-full">
      {/* ── Card Image with Ink Emergence ───────────────────────────────────── */}
      <InkScaleIn className="flex justify-center">
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            maxWidth: 280,
            width: "100%",
          }}
          // Cycling cyan/violet border glow
          animate={glowCycle}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Ink emergence clip-path animation */}
          <motion.div
            className="w-full"
            style={{ aspectRatio: "2/3" }}
            initial={{ clipPath: "inset(50% 50% 50% 50%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 24,
              delay: 0.15,
            }}
          >
            <img
              src={card.imageUrl}
              alt={card.title}
              className="w-full h-full object-cover rounded-2xl"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </InkScaleIn>

      {/* ── Title ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <InkTextReveal
          text={card.title}
          as="h2"
          className="text-xl font-semibold tracking-tight"
          delay={0.3}
          glowColor={INK.cyanGlow}
        />

        {/* Card number pill */}
        <InkFade delay={0.45}>
          <span
            className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full"
            style={{
              color: INK.cyan,
              background: "rgba(0, 229, 255, 0.06)",
              border: "1px solid rgba(0, 229, 255, 0.12)",
            }}
          >
            #{card.cardNumber}
          </span>
        </InkFade>
      </div>

      {/* ── Meaning Section ─────────────────────────────────────────────────── */}
      <InkFade delay={0.55}>
        <div className={`${inkGlass} p-4 text-left space-y-2`}>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "rgba(0, 229, 255, 0.6)" }}
          >
            Meaning
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK.textSecondary }}>
            {card.meaning}
          </p>
        </div>
      </InkFade>

      {/* ── Guidance Section ─────────────────────────────────────────────────── */}
      <InkFade delay={0.7}>
        <div className={`${inkGlass} p-4 text-left space-y-2`}>
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "rgba(0, 229, 255, 0.6)" }}
          >
            Guidance
          </p>
          <p className="text-sm leading-relaxed" style={{ color: INK.textSecondary }}>
            {card.guidance}
          </p>
        </div>
      </InkFade>

      {/* ── Back to Deck Link ───────────────────────────────────────────────── */}
      <InkFade delay={0.85}>
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 text-sm transition-colors duration-200 mt-2"
          style={{ color: "rgba(0, 229, 255, 0.6)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = INK.cyan)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 229, 255, 0.6)")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {deck ? `Back to ${deck.name}` : "Back to deck"}
        </button>
      </InkFade>
    </div>
  );
}
