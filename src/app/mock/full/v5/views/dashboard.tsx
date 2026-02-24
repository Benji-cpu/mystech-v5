"use client";

import { motion } from "framer-motion";
import {
  Layers,
  CreditCard,
  BookOpen,
  Sparkles,
  Plus,
  ArrowRight,
  Crown,
  Palette,
  Zap,
} from "lucide-react";
import { MOCK_USER, MOCK_STATS, MOCK_ACTIVITY, MOCK_DECKS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { InkTextReveal } from "../ink-text-reveal";
import { InkStagger, InkStaggerItem, InkFade } from "../ink-transitions";
import { inkGlass } from "../ink-theme";

// ─── Activity Icon Map ───────────────────────────────────────────────────────

const activityIcons: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  layers: Layers,
  plus: Plus,
  palette: Palette,
};

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  accent = "cyan",
}: {
  icon: typeof Layers;
  value: string | number;
  label: string;
  accent?: "cyan" | "violet" | "gold";
}) {
  const accentColors = {
    cyan: { text: "text-cyan-400", glow: "rgba(0, 229, 255, 0.15)" },
    violet: { text: "text-violet-400", glow: "rgba(139, 92, 246, 0.15)" },
    gold: { text: "text-[#d4a843]", glow: "rgba(212, 168, 67, 0.15)" },
  };
  const c = accentColors[accent];

  return (
    <div className={`${inkGlass} p-4 flex flex-col items-center gap-2`}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: c.glow }}
      >
        <Icon className={`w-4.5 h-4.5 ${c.text}`} />
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${c.text}`}>
        {value}
      </p>
      <p className="text-xs text-slate-400 tracking-wide">{label}</p>
    </div>
  );
}

// ─── Dashboard View ──────────────────────────────────────────────────────────

interface DashboardViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
}

export default function DashboardView({ navigate }: DashboardViewProps) {
  const firstName = MOCK_USER.name.split(" ")[0];

  return (
    <div className="px-4 py-6 pb-8 max-w-2xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="space-y-2">
        <InkTextReveal
          text={`Welcome back, ${firstName}`}
          as="h1"
          className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight"
          glowColor="rgba(0, 229, 255, 0.12)"
          charDelay={0.025}
        />
        <InkFade delay={0.4}>
          <p className="text-sm text-slate-400">
            The ink stirs with new possibilities
          </p>
        </InkFade>
      </div>

      {/* Stats Grid */}
      <InkStagger className="grid grid-cols-2 md:grid-cols-4 gap-3" staggerDelay={0.08}>
        <InkStaggerItem>
          <StatCard
            icon={Layers}
            value={MOCK_STATS.totalDecks}
            label="Decks"
            accent="cyan"
          />
        </InkStaggerItem>
        <InkStaggerItem>
          <StatCard
            icon={Sparkles}
            value={MOCK_STATS.totalCards}
            label="Cards"
            accent="violet"
          />
        </InkStaggerItem>
        <InkStaggerItem>
          <StatCard
            icon={BookOpen}
            value={MOCK_STATS.totalReadings}
            label="Readings"
            accent="cyan"
          />
        </InkStaggerItem>
        <InkStaggerItem>
          <StatCard
            icon={Zap}
            value={`${MOCK_STATS.creditsUsed}/${MOCK_STATS.creditsTotal}`}
            label="Credits"
            accent="gold"
          />
        </InkStaggerItem>
      </InkStagger>

      {/* Quick Actions */}
      <InkFade delay={0.5}>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-300 tracking-wide uppercase">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => navigate("reading")}
              className={`${inkGlass} p-4 flex flex-col items-center gap-3 cursor-pointer group`}
              whileHover={{
                borderColor: "rgba(0, 229, 255, 0.2)",
                boxShadow: "0 0 24px rgba(0, 229, 255, 0.08)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
                New Reading
              </span>
            </motion.button>

            <motion.button
              onClick={() => navigate("create-deck")}
              className={`${inkGlass} p-4 flex flex-col items-center gap-3 cursor-pointer group`}
              whileHover={{
                borderColor: "rgba(139, 92, 246, 0.2)",
                boxShadow: "0 0 24px rgba(139, 92, 246, 0.08)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-500/10">
                <Plus className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-slate-200 group-hover:text-violet-300 transition-colors">
                Create Deck
              </span>
            </motion.button>
          </div>
        </div>
      </InkFade>

      {/* Recent Activity */}
      <InkFade delay={0.65}>
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-300 tracking-wide uppercase">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {MOCK_ACTIVITY.map((item: typeof MOCK_ACTIVITY[number], i: number) => {
              const Icon = activityIcons[item.icon] ?? Sparkles;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                    delay: 0.7 + i * 0.06,
                  }}
                  className={`${inkGlass} px-4 py-3 flex items-center gap-3`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/[0.04]">
                    <Icon className="w-4 h-4 text-cyan-400/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-600 whitespace-nowrap shrink-0">
                    {item.timestamp}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </InkFade>

      {/* Upgrade CTA (only for free plan) */}
      {MOCK_USER.plan === "free" && (
        <InkFade delay={0.85}>
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[#d4a843]/20 p-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(212, 168, 67, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)",
            }}
            animate={{
              boxShadow: [
                "0 0 20px rgba(212, 168, 67, 0.05)",
                "0 0 30px rgba(212, 168, 67, 0.12)",
                "0 0 20px rgba(212, 168, 67, 0.05)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#d4a843]/10 shrink-0">
                <Crown className="w-5 h-5 text-[#d4a843]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#d4a843] mb-1">
                  Unlock Pro
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Unlimited decks, advanced spreads, and 100 credits per month.
                  Elevate your oracle practice.
                </p>
              </div>
            </div>
            <motion.button
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium text-[#020408] cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #d4a843 0%, #e8c066 50%, #d4a843 100%)",
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("settings")}
            >
              Upgrade to Pro
            </motion.button>
          </motion.div>
        </InkFade>
      )}

      {/* Recent Decks */}
      <InkFade delay={0.95}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300 tracking-wide uppercase">
              Recent Decks
            </h2>
            <button
              onClick={() => navigate("decks")}
              className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {MOCK_DECKS.slice(0, 2).map((deck: typeof MOCK_DECKS[number], i: number) => (
              <motion.button
                key={deck.id}
                onClick={() => navigate("deck-detail", { deckId: deck.id })}
                className="shrink-0 w-[160px] cursor-pointer group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  delay: 1.0 + i * 0.08,
                }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="relative rounded-xl overflow-hidden border border-white/[0.06] aspect-[3/4]">
                  <img
                    src={deck.coverUrl}
                    alt={deck.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(2,4,8,0.85) 0%, rgba(2,4,8,0.3) 40%, transparent 100%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                      {deck.name}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {deck.cardCount} cards
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </InkFade>
    </div>
  );
}
