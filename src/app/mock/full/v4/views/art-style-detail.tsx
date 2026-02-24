"use client";

import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { getStyleById } from "../../_shared/mock-data-v1";

// ─── ViewProps ────────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// ─── ArtStyleDetailView ─────────────────────────────────────────────────────

export function ArtStyleDetailView({ navigate, viewParams }: ViewProps) {
  const style = getStyleById(viewParams.styleId || "tarot-classic");

  if (!style) {
    return (
      <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
        <div className="max-w-2xl mx-auto p-4 sm:p-8 flex items-center justify-center min-h-[50vh]">
          <p className="text-[#b8a88a] text-sm">Style not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Gradient banner */}
        <motion.div
          variants={fadeUp}
          className={`relative w-full h-[180px] rounded-2xl overflow-hidden bg-gradient-to-r ${style.gradient}`}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1
              className="text-white text-3xl sm:text-4xl font-bold drop-shadow-lg"
              style={{ fontFamily: "var(--font-manuscript), serif" }}
            >
              {style.name}
            </h1>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl p-5"
        >
          <p className="text-[#f0e6d2] text-sm leading-relaxed">
            {style.description}
          </p>
        </motion.div>

        {/* Sample gallery */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 gap-3"
        >
          {style.sampleImages.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl overflow-hidden border border-[#3d3020]/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${style.name} sample ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate("create-deck")}
          className="w-full bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#8b7340] text-[#0f0b08] font-semibold rounded-xl py-3.5 text-sm transition-opacity hover:opacity-90 active:opacity-80"
        >
          Inscribe with This Style
        </motion.button>
      </motion.div>
    </div>
  );
}
