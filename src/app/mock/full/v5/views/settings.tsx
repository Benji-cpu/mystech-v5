"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Crown,
  Sparkles,
  Volume2,
  MonitorSmartphone,
  Info,
  ArrowUpRight,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { MOCK_USER, MOCK_STATS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";
import { inkGlass } from "../ink-theme";
import { InkFade, InkStagger, InkStaggerItem } from "../ink-transitions";

// ─── Toggle Switch ───────────────────────────────────────────────────────────

function InkToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full cursor-pointer shrink-0 transition-colors duration-200"
      style={{
        background: enabled
          ? "rgba(0, 229, 255, 0.25)"
          : "rgba(255, 255, 255, 0.06)",
        border: `1px solid ${enabled ? "rgba(0, 229, 255, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
      }}
      aria-label="Toggle"
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full"
        style={{
          background: enabled ? "#00e5ff" : "rgba(148, 163, 184, 0.5)",
          boxShadow: enabled ? "0 0 8px rgba(0, 229, 255, 0.4)" : "none",
        }}
        animate={{ left: enabled ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ─── Usage Meter ─────────────────────────────────────────────────────────────

function UsageMeter({
  label,
  icon: Icon,
  used,
  total,
  delay = 0,
}: {
  label: string;
  icon: typeof BookOpen;
  used: number;
  total: number;
  delay?: number;
}) {
  const pct = Math.min((used / total) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-300">{label}</span>
        </div>
        <span className="text-sm font-medium text-slate-400">
          {used}
          <span className="text-slate-600">/{total}</span>
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-white/[0.04]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #00e5ff, #8b5cf6)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 20,
            delay,
          }}
        />
      </div>
    </div>
  );
}

// ─── Settings View ───────────────────────────────────────────────────────────

interface SettingsViewProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
}

export default function SettingsView({ navigate }: SettingsViewProps) {
  const [particles, setParticles] = useState(true);
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const initials = MOCK_USER.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="px-4 py-6 pb-8 max-w-lg mx-auto space-y-6">
      {/* Profile Section */}
      <InkFade delay={0}>
        <div className={`${inkGlass} p-6 flex flex-col items-center gap-4`}>
          {/* Avatar */}
          <motion.div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(139, 92, 246, 0.1))",
              border: "2px solid rgba(0, 229, 255, 0.2)",
            }}
            animate={{
              boxShadow: [
                "0 0 12px rgba(0, 229, 255, 0.1), 0 0 24px rgba(0, 229, 255, 0.05)",
                "0 0 18px rgba(0, 229, 255, 0.2), 0 0 36px rgba(0, 229, 255, 0.08)",
                "0 0 12px rgba(0, 229, 255, 0.1), 0 0 24px rgba(0, 229, 255, 0.05)",
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
            <span className="text-xl font-bold text-cyan-400/80">
              {initials}
            </span>
          </motion.div>

          {/* Name & Email */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-semibold text-slate-100">
              {MOCK_USER.name}
            </h2>
            <div className="flex items-center gap-1.5 justify-center text-sm text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              {MOCK_USER.email}
            </div>
          </div>

          {/* Plan Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background:
                MOCK_USER.plan === "pro"
                  ? "rgba(212, 168, 67, 0.12)"
                  : "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${MOCK_USER.plan === "pro" ? "rgba(212, 168, 67, 0.25)" : "rgba(255, 255, 255, 0.08)"}`,
              color:
                MOCK_USER.plan === "pro" ? "#d4a843" : "rgb(148, 163, 184)",
            }}
          >
            {MOCK_USER.plan === "pro" ? (
              <Crown className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
            {MOCK_USER.plan === "pro" ? "Pro Plan" : "Free Plan"}
          </div>
        </div>
      </InkFade>

      {/* Usage Meters */}
      <InkFade delay={0.15}>
        <div className={`${inkGlass} p-5 space-y-5`}>
          <h3 className="text-sm font-medium text-slate-300 tracking-wide uppercase">
            Usage This Month
          </h3>
          <UsageMeter
            label="Cards Created"
            icon={Sparkles}
            used={7}
            total={10}
            delay={0.3}
          />
          <UsageMeter
            label="Readings"
            icon={BookOpen}
            used={3}
            total={5}
            delay={0.4}
          />
          <UsageMeter
            label="Credits"
            icon={CreditCard}
            used={MOCK_STATS.creditsUsed}
            total={MOCK_STATS.creditsTotal}
            delay={0.5}
          />
        </div>
      </InkFade>

      {/* Settings Toggles */}
      <InkFade delay={0.3}>
        <div className={`${inkGlass} overflow-hidden`}>
          <h3 className="text-sm font-medium text-slate-300 tracking-wide uppercase px-5 pt-5 pb-3">
            Preferences
          </h3>

          {/* Ambient Particles */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-300">
                Ambient Particles
              </span>
            </div>
            <InkToggle
              enabled={particles}
              onToggle={() => setParticles((p) => !p)}
            />
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-300">Sound Effects</span>
            </div>
            <InkToggle
              enabled={sound}
              onToggle={() => setSound((s) => !s)}
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-3">
              <MonitorSmartphone className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-300">Reduce Motion</span>
            </div>
            <InkToggle
              enabled={reducedMotion}
              onToggle={() => setReducedMotion((r) => !r)}
            />
          </div>
        </div>
      </InkFade>

      {/* Plan Section */}
      <InkFade delay={0.45}>
        <div className={`${inkGlass} p-5 space-y-4`}>
          <h3 className="text-sm font-medium text-slate-300 tracking-wide uppercase">
            Subscription
          </h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm text-slate-200 font-medium">
                {MOCK_USER.plan === "pro" ? "Pro Plan" : "Free Plan"}
              </p>
              <p className="text-xs text-slate-500">
                {MOCK_USER.plan === "pro"
                  ? "$4.99/month, renews March 1"
                  : "10 cards, 5 readings, 2 decks"}
              </p>
            </div>
            {MOCK_USER.plan === "free" && (
              <motion.button
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #d4a843 0%, #e8c066 50%, #d4a843 100%)",
                  color: "#020408",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Upgrade
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </div>
      </InkFade>

      {/* App Info */}
      <InkFade delay={0.55}>
        <div className="flex flex-col items-center gap-2 pt-2 pb-4">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Info className="w-3.5 h-3.5" />
            <span className="text-xs">v5.0.0-beta</span>
          </div>
          <p className="text-xs text-slate-700">Made with mystic energy</p>
        </div>
      </InkFade>
    </div>
  );
}
