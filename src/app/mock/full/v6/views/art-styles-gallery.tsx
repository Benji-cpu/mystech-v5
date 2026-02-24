"use client";

import { motion } from "framer-motion";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import { T, glassStyle, SPRING } from "../marionette-theme";

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export function MarionetteArtStylesGallery({ onNavigate }: Props) {
  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 space-y-6">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div>
          <p
            className="text-xs uppercase tracking-widest font-medium mb-1"
            style={{ color: T.gold }}
          >
            Collection
          </p>
          <h1
            className="text-2xl md:text-3xl font-semibold"
            style={{
              fontFamily: "var(--font-playfair), serif",
              color: T.text,
            }}
          >
            Art Styles
          </h1>
          <p className="mt-1 text-sm" style={{ color: T.textMuted }}>
            Choose a visual tradition for your deck
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-4">
            <div
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${T.border}, transparent)`,
              }}
            />
            <div
              className="w-2 h-2 rotate-45"
              style={{
                backgroundColor: `${T.gold}30`,
                border: `1px solid ${T.gold}40`,
              }}
            />
            <div
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${T.border}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* ── Styles Grid ─────────────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {MOCK_ART_STYLES.map((style) => (
            <motion.div
              key={style.id}
              variants={itemVariants}
              onClick={() =>
                onNavigate("art-style-detail", { styleId: style.id })
              }
              className="cursor-pointer group rounded-2xl overflow-hidden transition-colors"
              style={{
                ...glassStyle(),
              }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient banner */}
              <div className={`relative h-20 bg-gradient-to-r ${style.gradient}`}>
                <div className="absolute inset-0 bg-black/15" />
                {/* Icon text */}
                <div className="absolute top-2 right-2">
                  <span className="text-white/60 text-xs">{style.icon}</span>
                </div>
              </div>

              {/* Content area */}
              <div className="p-3 space-y-2.5">
                {/* Style name */}
                <h3
                  className="text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-playfair), serif",
                    color: T.text,
                  }}
                >
                  {style.name}
                </h3>

                {/* Sample thumbnails row */}
                <div className="flex gap-1.5">
                  {style.sampleImages.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 rounded-lg overflow-hidden"
                      style={{
                        width: 48,
                        height: 48,
                        border: `1px solid ${T.border}`,
                      }}
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
                <p
                  className="text-xs line-clamp-2 leading-relaxed"
                  style={{ color: T.textMuted }}
                >
                  {style.description}
                </p>
              </div>

              {/* Bottom gold accent line on hover */}
              <motion.div
                className="h-0.5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                whileHover={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
