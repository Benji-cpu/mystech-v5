"use client";

import { motion } from "framer-motion";
import { Sparkles, Layers, Plus, Palette, Eye, Crown, Zap, ArrowRight } from "lucide-react";
import type { ViewId, ViewParams } from "../../_shared/types";
import { MOCK_USER, MOCK_STATS, MOCK_ACTIVITY } from "../../_shared/mock-data-v1";

interface ViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const ACTIVITY_ICONS = {
  sparkles: Sparkles,
  layers: Layers,
  plus: Plus,
  palette: Palette,
} as const;

export function DashboardView({ navigate }: ViewProps) {
  return (
    <div className="h-full overflow-y-auto pb-24 sm:pb-8 sm:pl-[72px]">
      <motion.div
        className="max-w-3xl mx-auto p-4 sm:p-8 space-y-6"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Greeting */}
        <motion.div variants={fadeUp} className="space-y-1 pt-2">
          <p className="text-white/40 text-sm">{getGreeting()}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, <span className="text-[#c9a94e]">{MOCK_USER.name.split(" ")[0]}</span>
          </h1>
        </motion.div>

        {/* Stat orbs */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: "Decks", value: MOCK_STATS.totalDecks, icon: Layers },
            { label: "Cards", value: MOCK_STATS.totalCards, icon: Sparkles },
            { label: "Readings", value: MOCK_STATS.totalReadings, icon: Eye },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center space-y-2"
            >
              <stat.icon size={18} className="mx-auto text-[#c9a94e]/60" />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/40">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Usage bar */}
        <motion.div
          variants={fadeUp}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Monthly Credits</span>
            <span className="text-sm text-[#c9a94e]">
              {MOCK_STATS.creditsUsed}/{MOCK_STATS.creditsTotal}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#c9a94e] to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(MOCK_STATS.creditsUsed / MOCK_STATS.creditsTotal) * 100}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "New Reading", desc: "Draw your cards", icon: Sparkles, view: "reading" as ViewId },
              { label: "Create Deck", desc: "Forge new cards", icon: Plus, view: "create-deck" as ViewId },
              { label: "Browse Styles", desc: "Find your aesthetic", icon: Palette, view: "art-styles" as ViewId },
            ].map((action) => (
              <motion.button
                key={action.label}
                onClick={() => navigate(action.view)}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-left space-y-2 hover:bg-white/8 transition-colors group"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <action.icon size={20} className="text-[#c9a94e]/70 group-hover:text-[#c9a94e] transition-colors" />
                <p className="text-sm font-medium text-white">{action.label}</p>
                <p className="text-xs text-white/40">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={fadeUp} className="space-y-3">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">Recent Activity</h2>
          <div className="space-y-2">
            {MOCK_ACTIVITY.map((item) => {
              const Icon = ACTIVITY_ICONS[item.icon];
              return (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-[#c9a94e]/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white/80 truncate">{item.title}</p>
                    <p className="text-xs text-white/30 truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-white/20 shrink-0">{item.timestamp}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.button
          variants={fadeUp}
          onClick={() => navigate("settings")}
          className="w-full bg-gradient-to-r from-[#c9a94e]/10 to-amber-600/10 border border-[#c9a94e]/30 rounded-2xl p-4 flex items-center gap-4 hover:border-[#c9a94e]/50 transition-colors group"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="w-10 h-10 rounded-full bg-[#c9a94e]/10 flex items-center justify-center shrink-0">
            <Crown size={18} className="text-[#c9a94e]" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-medium text-[#c9a94e]">Upgrade to Pro</p>
            <p className="text-xs text-white/40">Unlock all spreads, 100 cards/mo, and more</p>
          </div>
          <ArrowRight size={16} className="text-[#c9a94e]/40 group-hover:text-[#c9a94e]/70 transition-colors shrink-0" />
        </motion.button>
      </motion.div>
    </div>
  );
}
