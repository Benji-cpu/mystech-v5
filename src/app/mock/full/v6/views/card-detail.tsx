"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getCardById } from "../../_shared/mock-data-v1";

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

interface MarionetteCardDetailProps {
  cardId: string;
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

// ─── Thread Sigil (card back design) ────────────────────────────────────────

function ThreadSigilBack() {
  const r = 130;
  const half = r / 2;
  const outerR = half * 0.75;
  const innerR = half * 0.45;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(160deg, ${T.surface2} 0%, ${T.bg} 100%)`,
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: r,
          height: r,
          background: `radial-gradient(circle, rgba(201,169,78,0.10) 0%, transparent 70%)`,
        }}
      />

      <svg width={r} height={r} viewBox={`0 0 ${r} ${r}`} fill="none">
        {/* Outer circle */}
        <circle cx={half} cy={half} r={outerR} stroke={T.gold} strokeWidth={0.8} opacity={0.6} />
        {/* Inner circle */}
        <circle cx={half} cy={half} r={innerR} stroke={T.gold} strokeWidth={0.6} opacity={0.3} />
        {/* Cross threads */}
        <line x1={half} y1={half - outerR} x2={half} y2={half + outerR} stroke={T.goldDim} strokeWidth={0.5} opacity={0.4} />
        <line x1={half - outerR} y1={half} x2={half + outerR} y2={half} stroke={T.goldDim} strokeWidth={0.5} opacity={0.4} />
        {/* Diagonal threads */}
        <line x1={half - innerR * 0.7} y1={half - innerR * 0.7} x2={half + innerR * 0.7} y2={half + innerR * 0.7} stroke={T.goldDim} strokeWidth={0.4} opacity={0.3} />
        <line x1={half + innerR * 0.7} y1={half - innerR * 0.7} x2={half - innerR * 0.7} y2={half + innerR * 0.7} stroke={T.goldDim} strokeWidth={0.4} opacity={0.3} />
      </svg>

      {/* Pulsing center dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 10,
          height: 10,
          backgroundColor: T.gold,
        }}
        animate={{
          boxShadow: [
            `0 0 4px 1px rgba(201,169,78,0.5)`,
            `0 0 10px 3px rgba(201,169,78,0.85)`,
          ],
          scale: [1, 1.15],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 1.8,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ─── Flippable Card ─────────────────────────────────────────────────────────

interface FlippableCardProps {
  imageUrl: string;
  title: string;
  isFlipped: boolean;
  onFlip: () => void;
}

function FlippableCard({ imageUrl, title, isFlipped, onFlip }: FlippableCardProps) {
  return (
    <div
      className="relative cursor-pointer select-none"
      style={{
        perspective: "900px",
        width: "min(260px, 72vw)",
        aspectRatio: "2/3",
      }}
      onClick={onFlip}
    >
      {/* Pulsing glow ring behind card */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          boxShadow: [
            `0 0 15px rgba(201, 169, 78, 0.2)`,
            `0 0 25px rgba(201, 169, 78, 0.4)`,
          ],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3,
          ease: "easeInOut",
        }}
        style={{ borderRadius: 12 }}
      />

      {/* Flip container */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
      >
        {/* Front face -- the card image */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            border: `2px solid ${T.border}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Bottom gradient for readability */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3"
            style={{
              background: `linear-gradient(to bottom, transparent, ${T.bg}dd)`,
            }}
          />
        </div>

        {/* Back face -- thread sigil design */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            border: `2px solid ${T.border}`,
          }}
        >
          <ThreadSigilBack />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Info Section ───────────────────────────────────────────────────────────

interface InfoSectionProps {
  label: string;
  content: string;
  delay: number;
  italic?: boolean;
}

function InfoSection({ label, content, delay, italic = false }: InfoSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay }}
    >
      <span
        className="block text-xs uppercase tracking-wider mb-1"
        style={{ color: T.textMuted }}
      >
        {label}
      </span>
      <p
        className={`text-sm leading-relaxed${italic ? " italic" : ""}`}
        style={{ color: T.text }}
      >
        {content}
      </p>
    </motion.div>
  );
}

// ─── MarionetteCardDetail ───────────────────────────────────────────────────

export function MarionetteCardDetail({ cardId, onBack }: MarionetteCardDetailProps) {
  const card = getCardById(cardId);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-serif" style={{ color: T.text }}>
          Card not found
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Back button row */}
      <div className="shrink-0 px-4 pt-3 sm:px-6">
        <BackButton onClick={onBack} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 sm:px-6">
        <div className="flex flex-col items-center gap-6 pt-4">
          {/* Card with entrance animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.05 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Flippable card */}
            <div
              style={{
                maxWidth: "min(300px, 78vw)",
                width: "100%",
              }}
            >
              <FlippableCard
                imageUrl={card.imageUrl}
                title={card.title}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((f) => !f)}
              />
            </div>

            {/* Flip hint */}
            <motion.p
              className="text-xs"
              style={{ color: T.goldDim }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            >
              {isFlipped ? "Tap to reveal card" : "Tap to flip"}
            </motion.p>
          </motion.div>

          {/* Title in serif gold */}
          <motion.h2
            className="font-serif text-2xl sm:text-3xl text-center"
            style={{ color: T.gold }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.12 }}
          >
            {card.title}
          </motion.h2>

          {/* Card info block -- glass panel */}
          <div
            className="w-full max-w-sm rounded-2xl px-5 py-5 flex flex-col gap-5"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(201,169,78,0.10)",
              borderRadius: "1rem",
              boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
            }}
          >
            {/* Divider */}
            <motion.div
              className="h-px w-full"
              style={{ backgroundColor: `rgba(201,169,78,0.15)` }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            />

            {/* Meaning */}
            <InfoSection
              label="Meaning"
              content={card.meaning}
              delay={0.22}
            />

            {/* Guidance */}
            <InfoSection
              label="Guidance"
              content={card.guidance}
              delay={0.37}
              italic
            />
          </div>
        </div>
      </div>
    </div>
  );
}
