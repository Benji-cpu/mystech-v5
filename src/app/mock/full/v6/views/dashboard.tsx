"use client";

import { motion } from "framer-motion";
import { MOCK_DECKS, MOCK_STATS, MOCK_USER, MOCK_ACTIVITY } from "../../_shared/mock-data-v1";
import type { ViewId, ViewParams, MockActivity } from "../../_shared/types";

// ─── Theme ───────────────────────────────────────────────────────────────────

const T = {
  bg: "#0a0118",
  surface: "#110220",
  surface2: "#1a0530",
  border: "rgba(201,169,78,0.15)",
  gold: "#c9a94e",
  goldBright: "#e8c84e",
  goldDim: "#8a7535",
  text: "#e8e0d4",
  textMuted: "#9e957e",
} as const;

// ─── Animation variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 28 },
  },
};

// ─── Inline SVG icons ───────────────────────────────────────────────────────

function IconLayers({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconGrid({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconSparkles({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 19l.75 2.25L8 22l-2.25.75L5 25" />
      <path d="M5 19l.75-2.25" />
      <circle cx="19" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="5" cy="19" r="0.75" fill="currentColor" stroke="none" />
      <path d="M17 17l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z" />
    </svg>
  );
}

function IconPlus({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPalette({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.042a1.8 1.8 0 0 1 1.8-1.8h2.032c3.1 0 5.395-2.35 5.395-5.4C22 6.9 17.5 2 12 2z" />
    </svg>
  );
}

function ActivityIcon({ icon }: { icon: MockActivity["icon"] }) {
  const iconMap = {
    sparkles: <IconSparkles size={16} />,
    layers: <IconLayers size={16} />,
    plus: <IconPlus size={16} />,
    palette: <IconPalette size={16} />,
  };
  return iconMap[icon];
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  delay,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={statVariants}
      custom={delay}
      className="flex-shrink-0 w-[140px] sm:w-auto sm:flex-1 rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(201,169,78,0.10)",
        boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
      }}
      whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 25 } }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(201,169,78,0.15)", color: T.gold }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: T.text }}>
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: T.textMuted }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

function CreditBar({ used, total, plan }: { used: number; total: number; plan: string }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(201,169,78,0.10)",
        boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: T.text }}>
          Credits Used
        </span>
        <span className="text-sm font-semibold" style={{ color: T.gold }}>
          {used} / {total}
        </span>
      </div>
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: T.surface2 }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.4 }}
        />
      </div>
      <p className="text-xs mt-2 uppercase tracking-widest" style={{ color: T.goldDim }}>
        {plan} plan
      </p>
    </motion.div>
  );
}

function QuickActions({
  onNavigate,
}: {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="flex gap-3">
      <motion.button
        onClick={() => onNavigate("reading")}
        className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold"
        style={{
          background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
          color: T.bg,
          boxShadow: `0 4px 20px rgba(201,169,78,0.35)`,
        }}
        whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } }}
        whileTap={{ scale: 0.97 }}
      >
        New Reading
      </motion.button>
      <motion.button
        onClick={() => onNavigate("create-deck")}
        className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold"
        style={{
          background: "transparent",
          color: T.gold,
          border: `1.5px solid rgba(201,169,78,0.50)`,
        }}
        whileHover={{
          scale: 1.02,
          borderColor: T.gold,
          transition: { type: "spring", stiffness: 400, damping: 25 },
        }}
        whileTap={{ scale: 0.97 }}
      >
        Create Deck
      </motion.button>
    </motion.div>
  );
}

function ActivityFeed() {
  return (
    <motion.div variants={itemVariants}>
      <h2
        className="text-sm font-semibold uppercase tracking-widest mb-3"
        style={{ color: T.textMuted }}
      >
        Recent Activity
      </h2>
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(201,169,78,0.10)",
          boxShadow: "0 8px 32px rgba(201,169,78,0.05)",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {MOCK_ACTIVITY.map((item, idx) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              borderBottom:
                idx < MOCK_ACTIVITY.length - 1
                  ? "1px solid rgba(201,169,78,0.08)"
                  : "none",
            }}
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(201,169,78,0.12)", color: T.gold }}
            >
              <ActivityIcon icon={item.icon} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: T.text }}>
                {item.title}
              </p>
              <p className="text-xs truncate" style={{ color: T.goldDim }}>
                {item.subtitle}
              </p>
            </div>

            {/* Timestamp */}
            <p className="text-xs flex-shrink-0" style={{ color: T.textMuted }}>
              {item.timestamp}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function UpgradeBanner() {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background:
          `linear-gradient(135deg, rgba(201,169,78,0.18) 0%, rgba(232,200,78,0.10) 50%, transparent 100%)`,
        border: "1px solid rgba(201,169,78,0.20)",
      }}
    >
      {/* Ambient glow spot */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,78,0.15) 0%, transparent 70%)",
        }}
      />
      <div className="relative">
        <h3 className="font-serif text-lg font-bold mb-1" style={{ color: T.text }}>
          Unlock Pro
        </h3>
        <p className="text-xs mb-4" style={{ color: T.textMuted }}>
          100 cards &middot; 50 readings &middot; all spreads
        </p>
        <motion.button
          className="py-2 px-5 rounded-lg text-sm font-semibold"
          style={{
            background: `linear-gradient(135deg, ${T.gold} 0%, ${T.goldBright} 100%)`,
            color: T.bg,
            boxShadow: `0 4px 16px rgba(201,169,78,0.35)`,
          }}
          whileHover={{ scale: 1.04, transition: { type: "spring", stiffness: 400, damping: 25 } }}
          whileTap={{ scale: 0.97 }}
        >
          Upgrade
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── MarionetteDashboard ────────────────────────────────────────────────────

interface MarionetteDashboardProps {
  onNavigate: (view: ViewId, params?: ViewParams) => void;
}

export function MarionetteDashboard({ onNavigate }: MarionetteDashboardProps) {
  const firstName = MOCK_USER.name.split(" ")[0];

  return (
    <motion.div
      className="w-full h-full overflow-y-auto"
      style={{ color: T.text }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-8">

        {/* 1. Welcome Section */}
        <motion.div variants={itemVariants} className="pt-2">
          <p className="text-sm" style={{ color: T.textMuted }}>
            Welcome back,
          </p>
          <h1 className="font-serif text-3xl font-bold leading-tight mt-0.5" style={{ color: T.text }}>
            {firstName}
          </h1>
        </motion.div>

        {/* 2. Stat Cards -- horizontal scroll mobile, row desktop */}
        <motion.div variants={itemVariants}>
          <div className="flex gap-3 overflow-x-auto pb-1 sm:overflow-x-visible sm:grid sm:grid-cols-3 snap-x snap-mandatory">
            <motion.div variants={containerVariants} className="contents">
              <motion.div variants={statVariants} className="snap-start flex-shrink-0 w-[140px] sm:w-auto">
                <StatCard
                  icon={<IconLayers size={18} />}
                  value={MOCK_STATS.totalDecks}
                  label="Decks"
                  delay={0}
                />
              </motion.div>
              <motion.div variants={statVariants} className="snap-start flex-shrink-0 w-[140px] sm:w-auto">
                <StatCard
                  icon={<IconGrid size={18} />}
                  value={MOCK_STATS.totalCards}
                  label="Cards"
                  delay={1}
                />
              </motion.div>
              <motion.div variants={statVariants} className="snap-start flex-shrink-0 w-[140px] sm:w-auto">
                <StatCard
                  icon={<IconSparkles size={18} />}
                  value={MOCK_STATS.totalReadings}
                  label="Readings"
                  delay={2}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* 3. Credit Usage Bar */}
        <CreditBar
          used={MOCK_STATS.creditsUsed}
          total={MOCK_STATS.creditsTotal}
          plan={MOCK_STATS.plan}
        />

        {/* 4. Quick Actions */}
        <QuickActions onNavigate={onNavigate} />

        {/* 5. Recent Activity */}
        <ActivityFeed />

        {/* 6. Upgrade CTA */}
        <UpgradeBanner />
      </div>
    </motion.div>
  );
}
