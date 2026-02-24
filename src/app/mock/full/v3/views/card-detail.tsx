"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { lunar } from "../lunar-theme";
import { LunarFlipCard } from "../lunar-card";
import { getCardById } from "../../_shared/mock-data-v1";

// ─── Back Button ──────────────────────────────────────────────────────────────

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
          stroke={lunar.silver}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm" style={{ color: lunar.silver }}>
        Back
      </span>
    </motion.button>
  );
}

// ─── LunarCardDetail ──────────────────────────────────────────────────────────

export function LunarCardDetail({
  cardId,
  onBack,
}: {
  cardId: string;
  onBack: () => void;
}) {
  const card = getCardById(cardId);
  const [isFlipped, setIsFlipped] = useState(true);

  if (!card) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-serif" style={{ color: lunar.foam }}>
          Card not found
        </p>
        <button
          className="text-sm underline"
          style={{ color: lunar.muted }}
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
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col items-center px-4 py-6 md:py-8 max-w-lg mx-auto w-full">

          {/* 1. Card Display */}
          <motion.div
            className="flex flex-col items-center py-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <LunarFlipCard
              imageUrl={card.imageUrl}
              title={card.title}
              isFlipped={isFlipped}
              size="lg"
              enableTilt
              onFlip={() => setIsFlipped((f) => !f)}
            />

            {/* Flip hint */}
            <p
              className="text-xs text-center mt-2"
              style={{ color: lunar.muted }}
            >
              Tap to flip
            </p>
          </motion.div>

          {/* 2. Card Info Panel */}
          <motion.div
            className="bg-[#0c1829]/60 backdrop-blur-xl border border-[#1e3460]/40 rounded-2xl p-5 mt-4 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 28,
              delay: 0.2,
            }}
          >
            {/* Card title */}
            <h2
              className="font-serif text-xl"
              style={{ color: lunar.foam }}
            >
              {card.title}
            </h2>

            {/* Meaning */}
            <p
              className="text-sm mt-2 italic"
              style={{ color: lunar.silver }}
            >
              {card.meaning}
            </p>

            {/* Divider */}
            <div
              className="h-px my-4"
              style={{ backgroundColor: `${lunar.border}4d` }}
            />

            {/* Guidance label */}
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: lunar.glow }}
            >
              Guidance
            </span>

            {/* Guidance blockquote */}
            <blockquote
              className="border-l-2 border-[#7ab8e8]/30 pl-4 mt-2"
            >
              <p
                className="text-sm leading-relaxed"
                style={{ color: lunar.pearl }}
              >
                {card.guidance}
              </p>
            </blockquote>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
