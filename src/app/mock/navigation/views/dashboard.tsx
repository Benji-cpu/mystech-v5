"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewId } from "../types";

interface DashboardViewProps {
  isActive: boolean;
  onNavigate: (view: ViewId, params?: { deckId?: string }) => void;
}

const RECENT_ACTIVITY = [
  { id: "r1", label: "Inner Journey reading", sub: "3-card spread · 2 days ago", icon: "sparkle" },
  { id: "r2", label: "Nature's Wisdom reading", sub: "Single card · 4 days ago", icon: "sparkle" },
  { id: "r3", label: "Shadow Work reading", sub: "5-card cross · 1 week ago", icon: "sparkle" },
];

const STATS = [
  { label: "Decks", value: "4" },
  { label: "Readings", value: "12" },
  { label: "Cards", value: "48" },
];

// Container stagger variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

export function DashboardView({ isActive, onNavigate }: DashboardViewProps) {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-4">
      <motion.div
        variants={containerVariants}
        initial={false}
        animate={isActive ? "visible" : "exit"}
        className="max-w-lg mx-auto space-y-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c9a94e]/10 border border-[#c9a94e]/20">
            <Sparkles className="w-5 h-5 text-[#c9a94e]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white/90">Welcome back, Seeker</h1>
            <p className="text-xs text-white/40">Your mystical journey continues</p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 sm:gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center"
            >
              <p className="text-xl sm:text-2xl font-bold text-[#c9a94e]">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-medium">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <motion.button
              onClick={() => onNavigate("reading-flow")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              animate={{ borderColor: ["rgba(201,169,78,0.3)", "rgba(201,169,78,0.7)", "rgba(201,169,78,0.3)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={cn(
                "bg-[#c9a94e]/10 backdrop-blur-xl border-2 rounded-xl py-4 px-3 sm:p-5",
                "flex flex-col items-center gap-2 text-center min-h-[72px]",
                "hover:bg-[#c9a94e]/20 transition-colors"
              )}
            >
              <Sparkles className="w-5 h-5 text-[#c9a94e]" />
              <span className="text-xs sm:text-sm font-medium text-white/80">Start Reading</span>
            </motion.button>
            <motion.button
              onClick={() => onNavigate("deck-grid")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl py-4 px-3 sm:p-5",
                "flex flex-col items-center gap-2 text-center min-h-[72px]",
                "hover:bg-white/10 hover:border-white/20 transition-colors"
              )}
            >
              <Layers className="w-5 h-5 text-white/50" />
              <span className="text-xs sm:text-sm font-medium text-white/60">Browse Decks</span>
            </motion.button>
          </div>
          <AnimatePresence>
            {showHint && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center text-[11px] text-white/30 mt-1"
              >
                Tap buttons to navigate between views
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-medium">Recent Activity</p>
          <div className="space-y-2">
            {RECENT_ACTIVITY.map((item, i) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                custom={i}
                className={cn(
                  "bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl",
                  "flex items-center gap-3 p-3 sm:p-4"
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-900/30 border border-white/10">
                  <BookOpen className="w-4 h-4 text-white/40" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate">{item.label}</p>
                  <p className="text-xs text-white/30">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
