"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  ZODIAC_GLYPHS,
  type ZodiacSign,
} from "@/lib/astrology/birth-chart";

type AstroPlacement = "sun" | "moon" | "rising" | "general" | null;

interface AstrologyBarProps {
  sunSign: string;
  moonSign: string | null;
  risingSign: string | null;
  moonPhase?: string;
  activePlacement?: AstroPlacement;
  className?: string;
}

const PLACEMENT_LABELS: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  rising: "Rising",
};

const PLACEMENT_COLORS: Record<string, string> = {
  sun: "from-amber-500/30 to-yellow-500/30 border-amber-500/40",
  moon: "from-blue-400/30 to-indigo-400/30 border-blue-400/40",
  rising: "from-rose-400/30 to-pink-400/30 border-rose-400/40",
};

const ACTIVE_GLOW: Record<string, string> = {
  sun: "shadow-[0_0_12px_rgba(245,158,11,0.5)]",
  moon: "shadow-[0_0_12px_rgba(96,165,250,0.5)]",
  rising: "shadow-[0_0_12px_rgba(244,114,182,0.5)]",
};

function PlacementBadge({
  placement,
  sign,
  isActive,
}: {
  placement: "sun" | "moon" | "rising";
  sign: string;
  isActive: boolean;
}) {
  const glyph = ZODIAC_GLYPHS[sign as ZodiacSign] ?? "";

  return (
    <motion.div
      animate={{
        scale: isActive ? 1.08 : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "bg-gradient-to-r border text-xs font-medium",
        "transition-shadow duration-500",
        PLACEMENT_COLORS[placement],
        isActive && ACTIVE_GLOW[placement]
      )}
    >
      <span className="text-sm">{glyph}</span>
      <span className="text-white/50">{PLACEMENT_LABELS[placement]}</span>
      <span className="text-white/80">{sign}</span>
      {isActive && (
        <motion.span
          layoutId="astro-active-dot"
          className="w-1.5 h-1.5 rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.div>
  );
}

function MoonPhaseBadge({ phase }: { phase: string }) {
  const phaseEmoji = getMoonPhaseEmoji(phase);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs">
      <span className="text-sm">{phaseEmoji}</span>
      <span className="text-white/50">{phase}</span>
    </div>
  );
}

export function AstrologyBar({
  sunSign,
  moonSign,
  risingSign,
  moonPhase,
  activePlacement,
  className,
}: AstrologyBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sunGlyph = ZODIAC_GLYPHS[sunSign as ZodiacSign] ?? "";

  return (
    <div className={cn("px-3", className)}>
      {/* Collapsed: thin clickable row */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <span className="text-sm">{sunGlyph}</span>
        <span className="font-medium tracking-wider uppercase">Astrology</span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      {/* Expanded: full badge strip */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 py-1.5">
              <PlacementBadge
                placement="sun"
                sign={sunSign}
                isActive={activePlacement === "sun"}
              />
              {moonSign && (
                <PlacementBadge
                  placement="moon"
                  sign={moonSign}
                  isActive={activePlacement === "moon"}
                />
              )}
              {risingSign && (
                <PlacementBadge
                  placement="rising"
                  sign={risingSign}
                  isActive={activePlacement === "rising"}
                />
              )}
              {moonPhase && <MoonPhaseBadge phase={moonPhase} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getMoonPhaseEmoji(phase: string): string {
  const p = phase.toLowerCase();
  if (p.includes("new")) return "\uD83C\uDF11";
  if (p.includes("waxing crescent")) return "\uD83C\uDF12";
  if (p.includes("first quarter")) return "\uD83C\uDF13";
  if (p.includes("waxing gibbous")) return "\uD83C\uDF14";
  if (p.includes("full")) return "\uD83C\uDF15";
  if (p.includes("waning gibbous")) return "\uD83C\uDF16";
  if (p.includes("last quarter") || p.includes("third quarter")) return "\uD83C\uDF17";
  if (p.includes("waning crescent")) return "\uD83C\uDF18";
  return "\uD83C\uDF19";
}
