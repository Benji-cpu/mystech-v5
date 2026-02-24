"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lunar } from "../lunar-theme";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── Style Color Map ──────────────────────────────────────────────────────────
// Inline colors required because Tailwind can't resolve dynamic class names

const STYLE_COLORS: Record<string, [string, string]> = {
  "tarot-classic": ["#b8860b", "#d4a017"],
  "watercolor-dream": ["#d4a0d4", "#a0c4e8"],
  "celestial": ["#4b0082", "#1a237e"],
  "botanical": ["#2e7d32", "#4caf50"],
  "abstract-mystic": ["#9c27b0", "#e040fb"],
  "dark-gothic": ["#8b0000", "#424242"],
  "art-nouveau": ["#00897b", "#b8860b"],
  "ethereal-light": ["#87ceeb", "#e8b0d4"],
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function IconX({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Style Gallery Card ───────────────────────────────────────────────────────

function StyleCard({
  style,
  isActive,
  onClick,
}: {
  style: (typeof MOCK_ART_STYLES)[number];
  isActive: boolean;
  onClick: () => void;
}) {
  const colors = STYLE_COLORS[style.id] ?? ["#4b0082", "#1a237e"];

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-xl overflow-hidden cursor-pointer"
      style={{
        border: isActive
          ? `1px solid ${lunar.glow}80`
          : `1px solid ${lunar.border}66`,
        boxShadow: isActive
          ? `0 0 20px ${lunar.glow}20, 0 4px 16px ${lunar.glow}10`
          : `0 4px 16px rgba(0,0,0,0.2)`,
        background: lunar.surface,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      onClick={onClick}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient preview */}
      <div
        className="h-24 w-full"
        style={{
          background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        }}
      />

      {/* Info row */}
      <div className="p-3">
        <p
          className="text-sm font-serif leading-snug"
          style={{ color: lunar.foam }}
        >
          {style.name}
        </p>

        {/* Thumbnail strip */}
        <div className="flex gap-1 mt-2">
          {style.sampleImages.slice(0, 4).map((src, idx) => (
            <div
              key={idx}
              className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: `1px solid ${lunar.border}80` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function StyleDetail({
  style,
  onUse,
  onClose,
}: {
  style: (typeof MOCK_ART_STYLES)[number];
  onUse: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="overflow-hidden"
    >
      <div
        className="relative rounded-2xl p-5 mt-4"
        style={{
          background: `${lunar.surface}cc`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${lunar.border}80`,
          boxShadow: `0 8px 32px ${lunar.glow}0d`,
        }}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-150"
          style={{
            background: `${lunar.border}60`,
            color: lunar.silver,
          }}
          onClick={onClose}
          aria-label="Close detail panel"
        >
          <IconX size={14} />
        </button>

        {/* Style name */}
        <h2 className="font-serif text-xl pr-8" style={{ color: lunar.foam }}>
          {style.name}
        </h2>

        {/* Description */}
        <p className="text-sm mt-2 leading-relaxed" style={{ color: lunar.silver }}>
          {style.description}
        </p>

        {/* 2x2 sample image grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {style.sampleImages.slice(0, 4).map((src, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden aspect-square"
              style={{ border: `1px solid ${lunar.border}60` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${style.name} sample ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          className="mt-4 flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold"
          style={{
            background: `${lunar.glow}20`,
            border: `1px solid ${lunar.glow}40`,
            color: lunar.glow,
          }}
          onClick={onUse}
          whileHover={{
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 25 },
          }}
          whileTap={{ scale: 0.98 }}
        >
          Use This Style
          <IconArrowRight size={15} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── LunarArtStyles ───────────────────────────────────────────────────────────

export function LunarArtStyles({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  const selectedStyle = selectedStyleId
    ? MOCK_ART_STYLES.find((s) => s.id === selectedStyleId) ?? null
    : null;

  function handleCardClick(id: string) {
    setSelectedStyleId((prev) => (prev === id ? null : id));
  }

  function handleClose() {
    setSelectedStyleId(null);
  }

  function handleUse() {
    onNavigate("create-deck");
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl" style={{ color: lunar.foam }}>
            Art Styles
          </h1>
          <p className="text-sm mt-1" style={{ color: lunar.muted }}>
            Choose the visual language for your oracle deck.
          </p>
        </div>

        {/* Gallery grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {MOCK_ART_STYLES.map((style) => (
            <StyleCard
              key={style.id}
              style={style}
              isActive={selectedStyleId === style.id}
              onClick={() => handleCardClick(style.id)}
            />
          ))}
        </motion.div>

        {/* Inline detail expansion */}
        <AnimatePresence>
          {selectedStyle && (
            <StyleDetail
              key={selectedStyle.id}
              style={selectedStyle}
              onUse={handleUse}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>

        {/* Bottom padding so last item isn't flush with nav */}
        <div className="h-6" />
      </div>
    </div>
  );
}
