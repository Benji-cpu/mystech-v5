"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Layers,
  BookOpen,
  Plus,
  Palette,
  Eye,
  Crown,
  Zap,
  ArrowRight,
} from "lucide-react";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_USER, MOCK_STATS, MOCK_ACTIVITY } from "../../_shared/mock-data-v1";

// ─── View Props ──────────────────────────────────────────────────────────────

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  layers: Layers,
  plus: Plus,
  palette: Palette,
};

const STAT_ITEMS = [
  {
    label: "Decks",
    value: MOCK_STATS.totalDecks,
    Icon: Layers,
  },
  {
    label: "Cards",
    value: MOCK_STATS.totalCards,
    Icon: BookOpen,
  },
  {
    label: "Readings",
    value: MOCK_STATS.totalReadings,
    Icon: Sparkles,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardView({ navigate }: ViewProps) {
  const creditPct = Math.round(
    (MOCK_STATS.creditsUsed / MOCK_STATS.creditsTotal) * 100
  );

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ── Welcome Header ────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <h1
            className="text-2xl sm:text-3xl text-[#f0e6d2] tracking-wide"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            Welcome back, {MOCK_USER.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-[#b8a88a] mt-1">
            Your grimoire awaits your hand
          </p>

          {/* Ornamental divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3d3020]/50 to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-[#c9a94e]/30 border border-[#c9a94e]/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#3d3020]/50 to-transparent" />
          </div>
        </motion.div>

        {/* ── Stat Cards ────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:gap-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {STAT_ITEMS.map((stat) => (
            <div
              key={stat.label}
              className="min-w-[140px] flex-shrink-0 sm:min-w-0 bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl shadow-lg shadow-[#c9a94e]/5 p-4"
            >
              <stat.Icon className="w-5 h-5 text-[#c9a94e] mb-3" />
              <p className="text-2xl font-bold text-[#c9a94e]">{stat.value}</p>
              <p className="text-xs text-[#b8a88a] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Credit Bar ────────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl shadow-lg shadow-[#c9a94e]/5 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#f0e6d2]">Credits</span>
            <span className="text-xs text-[#b8a88a]">
              {MOCK_STATS.creditsUsed} of {MOCK_STATS.creditsTotal} used
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#241c14] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#e0c65c]"
              initial={{ width: 0 }}
              animate={{ width: `${creditPct}%` }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: 0.4,
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#f0e6d2] px-2 py-0.5 border border-[#c9a94e]/30 rounded-full bg-[#c9a94e]/5">
              Free Plan
            </span>
          </div>
        </motion.div>

        {/* ── Quick Actions ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <button
            onClick={() => navigate("reading")}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#8b7340] text-[#0f0b08] font-semibold py-3 px-6 rounded-xl transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <Eye className="w-4 h-4" />
            Begin Reading
          </button>

          <button
            onClick={() => navigate("create-deck")}
            className="w-full flex items-center justify-center gap-2 border border-[#8b7340]/50 text-[#c9a94e] py-3 px-6 rounded-xl transition-all hover:bg-[#c9a94e]/10 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create Deck
          </button>
        </motion.div>

        {/* ── Activity Feed ─────────────────────────────────────────── */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2
            className="text-lg text-[#f0e6d2]"
            style={{ fontFamily: "var(--font-manuscript), serif" }}
          >
            Recent Activity
          </h2>

          <div className="bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl shadow-lg shadow-[#c9a94e]/5 divide-y divide-[#3d3020]/30">
            {MOCK_ACTIVITY.map((item) => {
              const ActivityIcon = ICON_MAP[item.icon] || Sparkles;
              return (
                <div key={item.id} className="flex items-start gap-3 p-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#c9a94e] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0e6d2]">{item.title}</p>
                    <p className="text-xs text-[#b8a88a] mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] text-[#b8a88a] whitespace-nowrap mt-0.5">
                    {item.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Upgrade Banner ────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="bg-gradient-to-r from-[#8b2020]/20 via-[#c9a94e]/10 to-[#8b2020]/20 border border-[#c9a94e]/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-[#c9a94e]/40 transition-colors"
          onClick={() => navigate("settings")}
        >
          <Crown className="w-6 h-6 text-[#c9a94e] shrink-0" />
          <div className="flex-1 min-w-0">
            <h3
              className="text-base text-[#f0e6d2]"
              style={{ fontFamily: "var(--font-manuscript), serif" }}
            >
              Unlock the Full Grimoire
            </h3>
            <p className="text-xs text-[#b8a88a] mt-0.5">
              Unlimited decks, all spreads, and 100 monthly credits with Pro
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#c9a94e]/60 shrink-0" />
        </motion.div>
      </motion.div>
    </div>
  );
}
