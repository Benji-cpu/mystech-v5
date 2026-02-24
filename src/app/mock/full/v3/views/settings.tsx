"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { lunar } from "../lunar-theme";
import { MOCK_USER, MOCK_STATS } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams } from "../../_shared/types";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// ─── Tidal Keyframes ──────────────────────────────────────────────────────────

const tidalKeyframes = `
@keyframes tidal {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

// ─── Glass Panel ──────────────────────────────────────────────────────────────

function GlassPanel({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`p-5 rounded-2xl ${className}`}
      style={{
        background: `${lunar.surface}99`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${lunar.border}66`,
        boxShadow: `0 8px 32px ${lunar.glow}0d`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Usage Bar Item ───────────────────────────────────────────────────────────

function UsageBar({
  label,
  used,
  total,
  delay = 0,
}: {
  label: string;
  used: number;
  total: number;
  delay?: number;
}) {
  const pct = Math.min((used / total) * 100, 100);
  const isNearCapacity = pct >= 80;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: lunar.silver }}>
          {label}
        </span>
        <span className="text-sm font-medium" style={{ color: lunar.foam }}>
          {used} / {total}
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: lunar.surface2 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isNearCapacity
              ? `linear-gradient(90deg, ${lunar.warm}cc 0%, ${lunar.warm} 100%)`
              : `linear-gradient(90deg, ${lunar.tide} 0%, ${lunar.glow} 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            delay,
          }}
        />
      </div>
    </div>
  );
}

// ─── Profile Section ─────────────────────────────────────────────────────────

function ProfileSection() {
  const initials = getInitials(MOCK_USER.name);
  const isPro = MOCK_USER.plan === "pro";

  return (
    <motion.div variants={itemVariants}>
      <GlassPanel>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center font-serif text-xl select-none"
            style={{
              background: `${lunar.glow}26`,
              border: `1.5px solid ${lunar.glow}4d`,
              color: lunar.glow,
            }}
          >
            {initials}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <p
              className="font-serif text-xl leading-tight truncate"
              style={{ color: lunar.foam }}
            >
              {MOCK_USER.name}
            </p>
            <p
              className="text-sm mt-0.5 truncate"
              style={{ color: lunar.muted }}
            >
              {MOCK_USER.email}
            </p>

            {/* Plan badge */}
            <div className="mt-2">
              {isPro ? (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: `${lunar.glow}26`,
                    border: `1px solid ${lunar.glow}4d`,
                    color: lunar.glow,
                  }}
                >
                  Pro Plan
                </span>
              ) : (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: lunar.surface2,
                    border: `1px solid ${lunar.border}`,
                    color: lunar.muted,
                  }}
                >
                  Free Plan
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

// ─── Usage Section ────────────────────────────────────────────────────────────

function UsageSection() {
  return (
    <motion.div variants={itemVariants} className="mt-4">
      <GlassPanel>
        <h2
          className="font-serif text-base mb-4"
          style={{ color: lunar.pearl }}
        >
          Usage This Month
        </h2>

        <div className="space-y-4">
          <UsageBar
            label="Decks"
            used={MOCK_STATS.totalDecks}
            total={2}
            delay={0.15}
          />
          <UsageBar
            label="Readings"
            used={MOCK_STATS.totalReadings}
            total={5}
            delay={0.25}
          />
          <UsageBar
            label="Credits"
            used={MOCK_STATS.creditsUsed}
            total={MOCK_STATS.creditsTotal}
            delay={0.35}
          />
        </div>
      </GlassPanel>
    </motion.div>
  );
}

// ─── Upgrade CTA ─────────────────────────────────────────────────────────────

const proFeatures = [
  "Unlimited decks",
  "50 readings/mo",
  "All spread types",
  "Priority support",
];

function UpgradeCTA() {
  return (
    <>
      <style>{tidalKeyframes}</style>
      <motion.div variants={itemVariants} className="mt-4">
        <div
          className="p-5 rounded-2xl"
          style={{
            background: `${lunar.surface}99`,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1px solid ${lunar.warm}33`,
            boxShadow: `0 8px 32px ${lunar.warm}0d`,
          }}
        >
          {/* Ambient warm glow top-right */}
          <div className="relative overflow-hidden rounded-xl">
            <div
              className="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${lunar.warm}1a 0%, transparent 70%)`,
              }}
            />

            <div className="relative space-y-4">
              <h2
                className="font-serif text-lg"
                style={{ color: lunar.warm }}
              >
                Upgrade to Pro
              </h2>

              {/* Feature list */}
              <ul className="space-y-2">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span
                      className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
                      style={{ color: lunar.glow }}
                    >
                      <IconCheck size={14} />
                    </span>
                    <span className="text-sm" style={{ color: lunar.silver }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                className="w-full py-3 rounded-xl text-sm font-medium"
                style={{
                  background: `linear-gradient(270deg, ${lunar.warm}, #f5d98a, ${lunar.warm}, #c9a64a)`,
                  backgroundSize: "300% 300%",
                  animation: "tidal 4s ease infinite",
                  color: lunar.bg,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Upgrade Now — $4.99 / mo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  return (
    <motion.div variants={itemVariants} className="mt-4">
      <GlassPanel>
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: lunar.pearl }}
            >
              Appearance
            </p>
            <p className="text-xs mt-0.5" style={{ color: lunar.muted }}>
              Dark Mode
            </p>
          </div>

          {/* Toggle pill */}
          <button
            onClick={() => setIsDark((prev) => !prev)}
            className="relative flex-shrink-0 rounded-full"
            style={{
              width: 48,
              height: 24,
              background: isDark ? lunar.glow : lunar.surface2,
              border: `1px solid ${isDark ? `${lunar.glow}80` : `${lunar.border}`}`,
              cursor: "pointer",
              transition: "background 0.25s ease, border-color 0.25s ease",
            }}
            aria-label="Toggle dark mode"
            aria-pressed={isDark}
          >
            {/* Sliding dot */}
            <motion.div
              className="absolute top-0.5 rounded-full"
              style={{
                width: 20,
                height: 20,
                background: "#ffffff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
              animate={{ x: isDark ? 24 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          </button>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────

export function LunarSettings({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  const isPro = MOCK_USER.plan === "pro";

  return (
    <div className="w-full h-full overflow-y-auto">
      <motion.div
        className="px-4 py-6 md:px-8 md:py-8 max-w-lg mx-auto pb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page heading */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1
            className="font-serif text-2xl"
            style={{ color: lunar.foam }}
          >
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: lunar.muted }}>
            Manage your profile and subscription.
          </p>
        </motion.div>

        {/* 1. Profile */}
        <ProfileSection />

        {/* 2. Usage */}
        <UsageSection />

        {/* 3. Upgrade CTA — free users only */}
        {!isPro && <UpgradeCTA />}

        {/* 4. Theme toggle */}
        <ThemeToggle />
      </motion.div>
    </div>
  );
}
