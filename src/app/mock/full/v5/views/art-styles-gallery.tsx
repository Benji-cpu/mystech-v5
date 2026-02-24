"use client";

import { motion } from "framer-motion";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkTextReveal } from "../ink-text-reveal";
import { InkStagger, InkStaggerItem, InkFade } from "../ink-transitions";
import { inkGlass } from "../ink-theme";

// ─── Icon String to Emoji Map ────────────────────────────────────────────────

const styleEmoji: Record<string, string> = {
  Crown: "\u{1F451}",
  Droplets: "\u{1F4A7}",
  Star: "\u{2B50}",
  Leaf: "\u{1F33F}",
  Hexagon: "\u{1F52E}",
  Skull: "\u{1F480}",
  Flower2: "\u{1F338}",
  Sun: "\u{2728}",
};

// ─── Art Styles Gallery ──────────────────────────────────────────────────────

interface ArtStylesGalleryViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
}

export default function ArtStylesGalleryView({
  navigate,
}: ArtStylesGalleryViewProps) {
  return (
    <div className="px-4 py-6 space-y-4 md:px-8 md:py-8 md:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <InkTextReveal
          text="Art Styles"
          as="h1"
          className="text-2xl font-semibold tracking-tight text-slate-100"
          charDelay={0.04}
          glowColor="rgba(0, 229, 255, 0.15)"
        />
        <InkFade delay={0.3}>
          <p className="text-sm text-slate-400">
            Explore visual aesthetics for your decks
          </p>
        </InkFade>
      </div>

      {/* Count pill */}
      <InkFade delay={0.4}>
        <span
          className="inline-block text-xs font-medium px-3 py-1 rounded-full"
          style={{
            background: "rgba(0, 229, 255, 0.06)",
            border: "1px solid rgba(0, 229, 255, 0.1)",
            color: "rgba(0, 229, 255, 0.7)",
          }}
        >
          {MOCK_ART_STYLES.length} styles available
        </span>
      </InkFade>

      {/* Styles Grid */}
      <InkStagger
        className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        staggerDelay={0.07}
      >
        {MOCK_ART_STYLES.map((style) => (
          <InkStaggerItem key={style.id}>
            <motion.button
              onClick={() =>
                navigate("art-style-detail", { styleId: style.id })
              }
              className="relative w-full overflow-hidden rounded-xl border border-white/[0.06] text-left group cursor-pointer"
              style={{ aspectRatio: "4 / 3" }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 24px rgba(0, 229, 255, 0.12)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}
              />

              {/* Dark ink overlay at bottom */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 25%, rgba(2,4,8,0.4) 60%, rgba(2,4,8,0.8) 100%)",
                }}
              />

              {/* Hover glow ring */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: "inset 0 0 40px rgba(0, 229, 255, 0.08)",
                  border: "1px solid rgba(0, 229, 255, 0.12)",
                }}
              />

              {/* Icon emoji in top-right */}
              <div className="absolute top-2.5 right-2.5 text-lg leading-none opacity-80 drop-shadow-md">
                {styleEmoji[style.icon] ?? "\u{2728}"}
              </div>

              {/* Bottom content */}
              <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-4">
                {/* Style name */}
                <p className="text-sm font-medium text-white leading-tight truncate mb-1.5">
                  {style.name}
                </p>

                {/* Sample image thumbnails */}
                <div className="flex items-center gap-1">
                  {style.sampleImages.slice(0, 2).map((img, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0"
                      style={{
                        boxShadow: "0 0 6px rgba(0,0,0,0.4)",
                      }}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </div>
                  ))}
                  {style.sampleImages.length > 2 && (
                    <span className="text-[10px] text-slate-400 ml-0.5">
                      +{style.sampleImages.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          </InkStaggerItem>
        ))}
      </InkStagger>
    </div>
  );
}
