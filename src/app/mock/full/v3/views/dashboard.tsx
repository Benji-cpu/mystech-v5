"use client";

import { motion } from "framer-motion";
import { lunar } from "../lunar-theme";
import { MOCK_USER, MOCK_STATS, MOCK_ACTIVITY } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams, MockActivity } from "../../_shared/types";

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

const statVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 28 },
  },
};

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

function IconSparkles({ size = 20 }: { size?: number }) {
  // 4-point star path
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
    </svg>
  );
}

function IconLayers({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconGrid({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconPlus({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPalette({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.042a1.8 1.8 0 0 1 1.8-1.8h2.032c3.1 0 5.395-2.35 5.395-5.4C22 6.9 17.5 2 12 2z" />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="11" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ActivityIcon({ icon }: { icon: MockActivity["icon"] }) {
  const map = {
    sparkles: <IconSparkles size={16} />,
    layers: <IconLayers size={16} />,
    plus: <IconPlus size={16} />,
    palette: <IconPalette size={16} />,
  };
  return map[icon];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <motion.div
      variants={statVariants}
      className="min-w-[140px] snap-center flex flex-col gap-3 p-4 rounded-2xl"
      style={{
        background: `${lunar.surface}99`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${lunar.border}66`,
        boxShadow: `0 8px 32px ${lunar.glow}0d`,
      }}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${lunar.glow}1a`, color: lunar.glow }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: lunar.foam }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: lunar.muted }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Credit Bar ───────────────────────────────────────────────────────────────

function CreditBar({
  used,
  total,
}: {
  used: number;
  total: number;
}) {
  const pct = Math.min((used / total) * 100, 100);

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl p-5 space-y-3"
      style={{
        background: `${lunar.surface}99`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${lunar.border}66`,
        boxShadow: `0 8px 32px ${lunar.glow}0d`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: lunar.pearl }}>
          Monthly Credits
        </span>
        <span className="text-sm" style={{ color: lunar.muted }}>
          {used} / {total} credits used
        </span>
      </div>

      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: `${lunar.border}80` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${lunar.tide} 0%, ${lunar.glow} 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{
            type: "spring",
            stiffness: 120,
            damping: 20,
            delay: 0.4,
          }}
        />
      </div>
    </motion.div>
  );
}

// ─── Quick Actions ────────────────────────────────────────────────────────────

function QuickActions({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="flex gap-3">
      {/* New Reading */}
      <motion.button
        onClick={() => onNavigate("reading")}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold"
        style={{
          background: `${lunar.glow}33`,
          border: `1px solid ${lunar.glow}66`,
          color: lunar.glow,
        }}
        whileHover={{
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <IconSparkles size={16} />
        New Reading
      </motion.button>

      {/* Create Deck */}
      <motion.button
        onClick={() => onNavigate("create-deck")}
        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold"
        style={{
          background: lunar.surface2,
          border: `1px solid ${lunar.border}`,
          color: lunar.pearl,
        }}
        whileHover={{
          scale: 1.02,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <IconPlus size={16} />
        Create Deck
      </motion.button>
    </motion.div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed() {
  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <h2
        className="text-lg font-serif"
        style={{ color: lunar.pearl }}
      >
        Recent Activity
      </h2>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: `${lunar.surface}99`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${lunar.border}66`,
          boxShadow: `0 8px 32px ${lunar.glow}0d`,
        }}
      >
        {MOCK_ACTIVITY.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              borderBottom:
                idx < MOCK_ACTIVITY.length - 1
                  ? `1px solid ${lunar.border}4d`
                  : "none",
            }}
          >
            {/* Icon circle */}
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: `${lunar.glow}1a`, color: lunar.glow }}
            >
              <ActivityIcon icon={item.icon} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: lunar.foam }}
              >
                {item.title}
              </p>
              <p className="text-xs truncate mt-0.5" style={{ color: lunar.muted }}>
                {item.subtitle}
              </p>
            </div>

            {/* Timestamp */}
            <p
              className="text-xs flex-shrink-0"
              style={{ color: lunar.muted }}
            >
              {item.timestamp}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Upgrade Banner ───────────────────────────────────────────────────────────

const tidalKeyframes = `
@keyframes tidal {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

function UpgradeBanner({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  return (
    <>
      <style>{tidalKeyframes}</style>
      <motion.div
        variants={itemVariants}
        className="rounded-2xl p-5 relative overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${lunar.surface}cc 0%, ${lunar.surface2}80 100%)`,
          border: `1px solid ${lunar.warm}4d`,
          boxShadow: `0 8px 32px ${lunar.warm}0d`,
        }}
        onClick={() => onNavigate("settings")}
        whileHover={{
          scale: 1.01,
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${lunar.warm}1a 0%, transparent 70%)`,
          }}
        />

        <div className="relative space-y-2">
          <h3
            className="font-serif text-lg"
            style={{ color: lunar.warm }}
          >
            Unlock the Full Moon
          </h3>
          <p className="text-sm" style={{ color: lunar.muted }}>
            Expand your practice with unlimited readings and decks.
          </p>

          {/* CTA button with tidal shimmer */}
          <div className="pt-2">
            <button
              className="py-2 px-5 rounded-lg text-sm font-semibold"
              style={{
                background: `linear-gradient(270deg, ${lunar.warm}, #f5d98a, ${lunar.warm}, #c9a64a)`,
                backgroundSize: "300% 300%",
                animation: "tidal 4s ease infinite",
                color: lunar.bg,
                border: "none",
              }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function LunarDashboard({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  const firstName = MOCK_USER.name.split(" ")[0];

  return (
    <motion.div
      className="w-full h-full overflow-y-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8 space-y-6 pb-8">

        {/* 1. Welcome Header */}
        <motion.div variants={itemVariants} className="pt-1">
          <h1
            className="font-serif text-2xl md:text-3xl"
            style={{ color: lunar.foam }}
          >
            The moon watches over your path, {firstName}.
          </h1>
          <p className="text-sm mt-1.5" style={{ color: lunar.muted }}>
            The tides have shifted since you were last here.
          </p>

          {/* Subtle wave divider */}
          <div className="flex items-center gap-3 mt-4">
            <div
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${lunar.border}80, transparent)`,
              }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: `${lunar.glow}60` }}
            />
            <div
              className="flex-1 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${lunar.border}80, transparent)`,
              }}
            />
          </div>
        </motion.div>

        {/* 2. Stat Cards — horizontal scroll mobile, grid desktop */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:overflow-visible">
            <StatCard
              icon={<IconLayers size={18} />}
              value={MOCK_STATS.totalDecks}
              label="Decks"
            />
            <StatCard
              icon={<IconGrid size={18} />}
              value={MOCK_STATS.totalCards}
              label="Cards"
            />
            <StatCard
              icon={<IconSparkles size={18} />}
              value={MOCK_STATS.totalReadings}
              label="Readings"
            />
          </div>
        </motion.div>

        {/* 3. Credit Usage Bar */}
        <CreditBar
          used={MOCK_STATS.creditsUsed}
          total={MOCK_STATS.creditsTotal}
        />

        {/* 4. Quick Actions */}
        <QuickActions onNavigate={onNavigate} />

        {/* 5. Recent Activity */}
        <ActivityFeed />

        {/* 6. Upgrade Banner — only for free users */}
        {MOCK_STATS.plan === "free" && (
          <UpgradeBanner onNavigate={onNavigate} />
        )}
      </div>
    </motion.div>
  );
}
