"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Wand2 } from "lucide-react";
import { getStyleById } from "../../_shared/mock-data-v1";
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

// ─── Art Style Detail View ───────────────────────────────────────────────────

interface ArtStyleDetailViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  params: ViewParams;
}

export default function ArtStyleDetailView({
  navigate,
  goBack,
  params,
}: ArtStyleDetailViewProps) {
  const style = getStyleById(params.styleId ?? "");

  if (!style) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-slate-400 text-sm">Style not found.</p>
        <button
          onClick={goBack}
          className="mt-4 text-cyan-400 text-sm underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  const emoji = styleEmoji[style.icon] ?? "\u{2728}";

  return (
    <div className="pb-8 space-y-5">
      {/* Hero Banner — full bleed */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 128 }}>
        {/* Gradient background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}
          style={{ minHeight: 128 }}
        />
        {/* Responsive height */}
        <div className="h-32 md:h-48" />
        {/* Ink wave overlay — dark gradient from bottom into page bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 30%, rgba(2,4,8,0.35) 60%, #020408 100%)",
          }}
        />

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          {/* Large emoji icon */}
          <motion.span
            className="text-4xl md:text-5xl drop-shadow-lg"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 26, delay: 0.1 }}
          >
            {emoji}
          </motion.span>
          {/* Style name */}
          <InkTextReveal
            text={style.name}
            as="h1"
            className="text-2xl md:text-3xl font-bold text-white tracking-tight text-center"
            charDelay={0.03}
            glowColor="rgba(255, 255, 255, 0.15)"
            delay={0.2}
          />
        </div>
      </div>

      {/* Description */}
      <div className="px-4 md:px-8 max-w-2xl mx-auto">
        <InkFade delay={0.4}>
          <p className="text-sm md:text-base leading-relaxed text-slate-300">
            {style.description}
          </p>
        </InkFade>
      </div>

      {/* Sample Cards Section */}
      <div className="px-4 md:px-8 max-w-3xl mx-auto space-y-3">
        <InkFade delay={0.5}>
          <h2 className="text-sm font-medium text-slate-300 tracking-wide uppercase">
            Sample Cards
          </h2>
        </InkFade>

        <InkStagger
          className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4"
          staggerDelay={0.08}
        >
          {style.sampleImages.map((img, i) => (
            <InkStaggerItem key={i}>
              <motion.div
                className="relative overflow-hidden rounded-xl border border-white/[0.06]"
                style={{ aspectRatio: "2 / 3" }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <img
                  src={img}
                  alt={`${style.name} sample ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />

                {/* Subtle ink overlay at bottom */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 60%, rgba(2,4,8,0.4) 100%)",
                  }}
                />

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: "inset 0 0 30px rgba(0, 229, 255, 0.06)",
                  }}
                />
              </motion.div>
            </InkStaggerItem>
          ))}
        </InkStagger>
      </div>

      {/* Use This Style Button */}
      <div className="px-4 md:px-8 max-w-2xl mx-auto pt-2">
        <InkFade delay={0.7}>
          <motion.button
            onClick={() => navigate("create-deck")}
            className={`${inkGlass} w-full py-3.5 flex items-center justify-center gap-2.5 cursor-pointer group`}
            style={{
              borderColor: "rgba(0, 229, 255, 0.15)",
            }}
            whileHover={{
              borderColor: "rgba(0, 229, 255, 0.35)",
              boxShadow: "0 0 28px rgba(0, 229, 255, 0.1)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            <Wand2 className="w-4.5 h-4.5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
              Use This Style
            </span>
          </motion.button>
        </InkFade>
      </div>

      {/* Back link */}
      <div className="px-4 md:px-8 max-w-2xl mx-auto">
        <InkFade delay={0.8}>
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All styles
          </button>
        </InkFade>
      </div>
    </div>
  );
}
