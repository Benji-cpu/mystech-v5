"use client";

import { motion } from "framer-motion";
import { MOCK_STATS, MOCK_ACTIVITY } from "@/app/mock/full/_shared/mock-data-v1";
import { GlassPanel } from "./shared/glass-panel";
import { GoldButton } from "./shared/gold-button";
import type { ViewId } from "@/app/mock/full/_shared/types";

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "The stars whisper at this hour";
  if (hour < 12) return "The morning light reveals new paths";
  if (hour < 17) return "The afternoon sun illuminates your journey";
  if (hour < 21) return "The twilight holds mysteries untold";
  return "The stars align at this hour";
}

const ACTIVITY_ICONS: Record<string, string> = {
  sparkles: "\u2728",
  layers: "\u{1F4DA}",
  plus: "\u2795",
  palette: "\u{1F3A8}",
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

interface DashboardFloorProps {
  onNavigate: (view: ViewId) => void;
}

export function DashboardFloor({ onNavigate }: DashboardFloorProps) {
  const stats = [
    { label: "Decks", value: MOCK_STATS.totalDecks, icon: "\u{1F4DA}" },
    { label: "Cards", value: MOCK_STATS.totalCards, icon: "\u2728" },
    { label: "Readings", value: MOCK_STATS.totalReadings, icon: "\u{1F52E}" },
    { label: "Credits", value: `${MOCK_STATS.creditsUsed}/${MOCK_STATS.creditsTotal}`, icon: "\u{1F48E}" },
  ];

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        className="max-w-4xl mx-auto space-y-6"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        {/* Greeting */}
        <motion.div variants={fadeUp} className="space-y-1">
          <p className="text-[#c9a94e] text-xs sm:text-sm font-medium tracking-wider uppercase">
            {getTimeGreeting()}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90">
            Welcome back, Luna
          </h1>
        </motion.div>

        {/* Stats Row */}
        <motion.div variants={fadeUp} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {stats.map((stat) => (
            <GlassPanel
              key={stat.label}
              className="shrink-0 flex-1 min-w-[80px] p-3 sm:p-4 text-center"
            >
              <span className="text-lg sm:text-xl block mb-1">{stat.icon}</span>
              <p className="text-lg sm:text-xl font-bold text-white/90">{stat.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </GlassPanel>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
          <GlassPanel
            onClick={() => onNavigate("reading")}
            className="p-4 sm:p-6 group hover:border-[#c9a94e]/30 transition-colors cursor-pointer"
          >
            <div className="text-2xl sm:text-3xl mb-2">{"\u2728"}</div>
            <h3 className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-[#c9a94e] transition-colors">
              New Reading
            </h3>
            <p className="text-xs text-white/40 mt-1 hidden sm:block">Draw cards and receive guidance</p>
          </GlassPanel>

          <GlassPanel
            onClick={() => onNavigate("create-deck")}
            className="p-4 sm:p-6 group hover:border-[#c9a94e]/30 transition-colors cursor-pointer"
          >
            <div className="text-2xl sm:text-3xl mb-2">{"\u{1F3B4}"}</div>
            <h3 className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-[#c9a94e] transition-colors">
              Create Deck
            </h3>
            <p className="text-xs text-white/40 mt-1 hidden sm:block">Design a new oracle deck</p>
          </GlassPanel>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp}>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
            Recent Activity
          </h2>
          <GlassPanel className="divide-y divide-white/5">
            {MOCK_ACTIVITY.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.08, type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-3 p-3 sm:p-4"
              >
                <span className="text-lg shrink-0">{ACTIVITY_ICONS[activity.icon] || "\u2728"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/80 truncate">{activity.title}</p>
                  <p className="text-xs text-white/40 truncate">{activity.subtitle}</p>
                </div>
                <span className="text-xs text-white/30 shrink-0 hidden sm:block">{activity.timestamp}</span>
              </motion.div>
            ))}
          </GlassPanel>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-2xl">
            {/* Animated gold border shimmer */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a94e]/20 to-transparent skew-x-12 w-1/2"
              />
            </div>
            <GlassPanel className="p-4 sm:p-6 border-[#c9a94e]/20 relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#c9a94e]">
                    Unlock Pro
                  </h3>
                  <p className="text-xs text-white/40 mt-1">
                    50 credits/mo, all spreads, unlimited decks
                  </p>
                </div>
                <GoldButton onClick={() => onNavigate("settings")} className="text-xs sm:text-sm px-4 py-2">
                  Upgrade
                </GoldButton>
              </div>
            </GlassPanel>
          </div>
        </motion.div>

        {/* Bottom spacer for tab bar */}
        <div className="h-20" />
      </motion.div>
    </div>
  );
}
