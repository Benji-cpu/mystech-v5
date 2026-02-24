// Lyra v4 — Design tokens: springs, anchor chip colors, sizing constants

// ── Spring Presets ──────────────────────────────────────────────────────

export const SPRINGS = {
  /** Default zone transition spring */
  zone: { type: "spring" as const, stiffness: 300, damping: 30 },
  /** Snappy UI interactions */
  snappy: { type: "spring" as const, stiffness: 400, damping: 25 },
  /** Gentle content entrance */
  gentle: { type: "spring" as const, stiffness: 200, damping: 25 },
  /** Card flip */
  flip: { type: "spring" as const, stiffness: 300, damping: 25 },
  /** Anchor star birth burst */
  burst: { type: "spring" as const, stiffness: 500, damping: 20 },
} as const;

// ── Anchor Chip Theme Colors ────────────────────────────────────────────

export const ANCHOR_CHIP_COLORS: Record<
  string,
  { bg: string; border: string; dot: string; text: string }
> = {
  courage: {
    bg: "rgba(249, 115, 22, 0.08)",
    border: "rgba(249, 115, 22, 0.25)",
    dot: "#f97316",
    text: "rgba(251, 146, 60, 0.9)",
  },
  wisdom: {
    bg: "rgba(6, 182, 212, 0.08)",
    border: "rgba(6, 182, 212, 0.25)",
    dot: "#06b6d4",
    text: "rgba(34, 211, 238, 0.9)",
  },
  healing: {
    bg: "rgba(129, 140, 248, 0.08)",
    border: "rgba(129, 140, 248, 0.25)",
    dot: "#818cf8",
    text: "rgba(165, 180, 252, 0.9)",
  },
  resilience: {
    bg: "rgba(52, 211, 153, 0.08)",
    border: "rgba(52, 211, 153, 0.25)",
    dot: "#34d399",
    text: "rgba(110, 231, 183, 0.9)",
  },
  creativity: {
    bg: "rgba(236, 72, 153, 0.08)",
    border: "rgba(236, 72, 153, 0.25)",
    dot: "#ec4899",
    text: "rgba(244, 114, 182, 0.9)",
  },
  transformation: {
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
    dot: "#f59e0b",
    text: "rgba(252, 211, 77, 0.9)",
  },
};

// ── Default chip color for unknown themes ───────────────────────────────

export const DEFAULT_CHIP_COLOR = {
  bg: "rgba(201, 169, 78, 0.06)",
  border: "rgba(201, 169, 78, 0.2)",
  dot: "#c9a94e",
  text: "rgba(201, 169, 78, 0.9)",
};

// ── Constellation Sizing ────────────────────────────────────────────────

export const CONSTELLATION_SIZES = {
  /** Full display (birth_sky after selection) */
  full: "max-w-[min(85vw,400px)]",
  /** Compact display (gathering, complete phases) */
  compact: "max-w-[min(50vw,200px)]",
} as const;
