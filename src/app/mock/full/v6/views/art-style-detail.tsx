"use client";

import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getStyleById } from "../../_shared/mock-data-v1";
import { T, glassStyle, SPRING } from "../marionette-theme";

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  styleId: string;
  onBack: () => void;
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

// ─── Style Detail Tags ─────────────────────────────────────────────────────

const STYLE_TAGS: Record<string, string[]> = {
  "tarot-classic": ["Traditional", "Gilded", "Symbolic", "Rich Colors"],
  "watercolor-dream": ["Soft", "Flowing", "Pastel", "Organic"],
  celestial: ["Cosmic", "Deep Space", "Nebulae", "Luminous"],
  botanical: ["Detailed", "Natural", "Floral", "Verdant"],
  "abstract-mystic": ["Geometric", "Sacred", "Abstract", "Spiritual"],
  "dark-gothic": ["Dramatic", "Shadows", "Chiaroscuro", "Intense"],
  "art-nouveau": ["Ornamental", "Organic Lines", "Decorative", "Elegant"],
  "ethereal-light": ["Luminous", "Pastel", "Dreamlike", "Soft Glow"],
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MarionetteArtStyleDetail({ styleId, onBack, onNavigate }: Props) {
  const style = getStyleById(styleId);

  if (!style) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm" style={{ color: T.textMuted }}>
            Style not found.
          </p>
          <button
            onClick={onBack}
            className="text-sm underline"
            style={{ color: T.gold }}
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const tags = STYLE_TAGS[style.id] ?? ["Unique", "Custom", "Expressive"];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Scrollable Content ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-28 md:pb-8">
        <motion.div
          className="max-w-2xl mx-auto space-y-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* ── Gradient Banner Header ──────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className={`relative w-full overflow-hidden bg-gradient-to-r ${style.gradient}`}
            style={{ height: 120, borderRadius: "0 0 1rem 1rem" }}
          >
            <div className="absolute inset-0 bg-black/20" />

            {/* Back button overlay */}
            <button
              onClick={onBack}
              className="absolute top-4 left-4 w-9 h-9 rounded-xl flex items-center justify-center z-10 transition-colors"
              style={{
                background: "rgba(0,0,0,0.3)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <svg
                className="w-4 h-4 text-white/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            {/* Icon + Style Name centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl mb-1 opacity-70">{style.icon}</span>
              <h1
                className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {style.name}
              </h1>
            </div>
          </motion.div>

          <div className="px-4 md:px-8 space-y-5">
            {/* ── Description ──────────────────────────────────────────── */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-4"
              style={glassStyle()}
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: T.text }}
              >
                {style.description}
              </p>
            </motion.div>

            {/* ── Sample Gallery (2x2) ─────────────────────────────────── */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3"
            >
              {style.sampleImages.slice(0, 4).map((img, i) => (
                <motion.div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${T.border}` }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`${style.name} sample ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* ── Style Tags ───────────────────────────────────────────── */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label
                className="text-xs uppercase tracking-widest font-medium"
                style={{ color: T.gold }}
              >
                Style Characteristics
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "rgba(201,169,78,0.08)",
                      border: `1px solid ${T.border}`,
                      color: T.textMuted,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── Fixed CTA ────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 py-4 md:px-8"
        style={{
          background: `linear-gradient(to top, ${T.bg}, ${T.bg}ee, transparent)`,
        }}
      >
        <div className="max-w-2xl mx-auto">
          <motion.button
            onClick={() => onNavigate("create-deck")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-xl font-semibold text-sm"
            style={{
              background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
              color: T.bg,
              fontFamily: "var(--font-playfair), serif",
              boxShadow: `0 4px 20px rgba(201,169,78,0.3)`,
            }}
          >
            Use This Style
          </motion.button>
        </div>
      </div>
    </div>
  );
}
