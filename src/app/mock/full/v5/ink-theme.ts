// Magnetic Ink — Color palette & glass morphism classes

export const INK = {
  // Base
  bg: "#020408",
  surface: "#0a0e14",
  surfaceLight: "#111820",

  // Accents
  cyan: "#00e5ff",
  violet: "#8b5cf6",
  gold: "#d4a843",

  // Text
  textPrimary: "#e2e8f0",
  textSecondary: "#94a3b8",
  textMuted: "#475569",

  // Glow
  cyanGlow: "rgba(0, 229, 255, 0.3)",
  violetGlow: "rgba(139, 92, 246, 0.3)",
  goldGlow: "rgba(212, 168, 67, 0.3)",
  cyanGlowSoft: "rgba(0, 229, 255, 0.1)",
  violetGlowSoft: "rgba(139, 92, 246, 0.1)",
  goldGlowSoft: "rgba(212, 168, 67, 0.1)",
} as const;

// Glass morphism card class
export const inkGlass =
  "bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl";

// Glass with cyan accent
export const inkGlassCyan =
  "bg-cyan-500/[0.03] backdrop-blur-xl border border-cyan-400/10 rounded-2xl";

// Glass with violet accent
export const inkGlassViolet =
  "bg-violet-500/[0.03] backdrop-blur-xl border border-violet-400/10 rounded-2xl";

// Hover glow presets (use in className)
export const inkHoverCyan =
  "transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]";

export const inkHoverViolet =
  "transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]";

export const inkHoverGold =
  "transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(212,168,67,0.15)]";

// Nav item styles
export const inkNavItem =
  "relative flex flex-col items-center justify-center gap-1 text-xs transition-colors duration-200";

export const inkNavActive = "text-cyan-400";
export const inkNavInactive = "text-slate-500 hover:text-slate-300";
