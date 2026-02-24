"use client";

import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";

// ─── ViewProps ────────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── ArtStylesView ──────────────────────────────────────────────────────────

export function ArtStylesView({ navigate }: ViewProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-[#f0e6d2]"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            Illumination Styles
          </h1>
          <p className="mt-1 text-sm text-[#b8a88a]">
            Choose a visual tradition for your deck
          </p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {MOCK_ART_STYLES.map((style) => (
            <motion.div
              key={style.id}
              variants={fadeUp}
              onClick={() =>
                navigate("art-style-detail", { styleId: style.id })
              }
              className="bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl overflow-hidden cursor-pointer hover:border-[#c9a94e]/30 transition-colors"
            >
              {/* Gradient banner */}
              <div
                className={`relative h-[120px] bg-gradient-to-r ${style.gradient}`}
              >
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-4">
                  <span
                    className="text-white text-lg font-semibold drop-shadow-md"
                    style={{ fontFamily: "var(--font-manuscript), serif" }}
                  >
                    {style.name}
                  </span>
                </div>
              </div>

              {/* Content area */}
              <div className="p-4 space-y-3">
                {/* Style name */}
                <h3
                  className="text-[#f0e6d2] text-sm font-medium"
                  style={{ fontFamily: "var(--font-manuscript), serif" }}
                >
                  {style.name}
                </h3>

                {/* Sample thumbnails */}
                <div className="flex gap-2">
                  {style.sampleImages.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-[#3d3020]/30 flex-shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p className="text-[#b8a88a] text-xs line-clamp-2">
                  {style.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
