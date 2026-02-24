"use client";

import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { MOCK_SPREADS } from "@/components/mock/mock-data";
import { cn } from "@/lib/utils";
import type { ViewId } from "../types";

interface ReadingFlowViewProps {
  isActive: boolean;
  onNavigate: (view: ViewId) => void;
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

export function ReadingFlowView({ isActive, onNavigate }: ReadingFlowViewProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ y: "100%" }}
      animate={isActive ? { y: 0 } : { y: "100%" }}
      transition={SPRING}
      // Prevent interaction when hidden behind other views
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Darkening backdrop behind the panel */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#06000f] via-[#0a0118] to-[#0d0126]"
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Subtle mystic glow at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a94e]/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#c9a94e]/5 to-transparent pointer-events-none" />

      {/* Reading content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Close button row */}
        <div className="flex items-center justify-between p-4 sm:p-6 shrink-0">
          <span className="text-xs text-white/20 uppercase tracking-widest font-medium">Reading</span>
          <motion.button
            onClick={() => onNavigate("dashboard")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              "bg-white/5 border border-white/10 hover:bg-white/10 transition-colors",
              "text-white/60 hover:text-white/90"
            )}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Main content — centered */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5 sm:px-8 pb-8 overflow-y-auto">
          {/* Animated sparkle icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={
              isActive
                ? { scale: 1, opacity: 1, rotate: 0 }
                : { scale: 0, opacity: 0, rotate: -20 }
            }
            transition={{ delay: isActive ? 0.15 : 0, ...SPRING }}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#c9a94e]/10 border border-[#c9a94e]/25"
          >
            <Sparkles className="w-8 h-8 text-[#c9a94e]" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: isActive ? 0.2 : 0, ...SPRING }}
            className="text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-2">Begin Your Reading</h2>
            <p className="text-white/50 text-sm sm:text-base max-w-xs sm:max-w-sm leading-relaxed">
              Select a spread and let the cards reveal your path. Trust the wisdom that already lives within you.
            </p>
          </motion.div>

          {/* Spread selection */}
          <div className="w-full max-w-sm space-y-2.5">
            {MOCK_SPREADS.slice(0, 3).map((spread, i) => (
              <motion.button
                key={spread.name}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isActive
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
                }
                transition={{
                  delay: isActive ? 0.3 + i * 0.1 : 0,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3.5 sm:p-4 text-left",
                  "hover:bg-white/10 hover:border-[#c9a94e]/30 transition-colors",
                  "flex items-center justify-between gap-3"
                )}
              >
                <div>
                  <h3 className="text-white/90 font-medium text-sm sm:text-base">{spread.name}</h3>
                  <p className="text-white/35 text-xs mt-0.5">
                    {spread.count} {spread.count === 1 ? "card" : "cards"}
                  </p>
                </div>
                {/* Position dots indicator */}
                <div className="flex gap-0.5 shrink-0">
                  {Array.from({ length: Math.min(spread.count, 5) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/40"
                    />
                  ))}
                  {spread.count > 5 && (
                    <span className="text-[#c9a94e]/40 text-[10px] ml-0.5">+{spread.count - 5}</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Decorative divider */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isActive ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ delay: isActive ? 0.65 : 0, duration: 0.4 }}
            className="w-full max-w-sm h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />

          {/* Subtitle note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: isActive ? 0.7 : 0, duration: 0.4 }}
            className="text-white/20 text-xs text-center max-w-xs"
          >
            Free tier includes 3-card spread. Upgrade for full access.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
