// ─── Lunar Tide Color Palette ─────────────────────────────────────────────────

export const lunar = {
  bg: "#060d1a",        // Deep midnight ocean
  surface: "#0c1829",   // Panel surfaces
  surface2: "#132240",  // Elevated / hover
  border: "#1e3460",    // Subtle indigo borders
  glow: "#7ab8e8",      // Moonlight blue — primary accent
  pearl: "#c8dce8",     // Pearl highlight
  silver: "#94a8c0",    // Silver text accent
  tide: "#3d7fb5",      // Mid-blue for progress/links
  foam: "#dce8f0",      // Primary text, headings
  muted: "#6888a8",     // Secondary text
  warm: "#e8c87a",      // Gold, used sparingly for upgrade CTAs
} as const;

// ─── Glass Morphism ───────────────────────────────────────────────────────────

export const lunarGlass =
  "bg-[#0c1829]/60 backdrop-blur-xl border border-[#1e3460]/40 rounded-2xl shadow-lg shadow-[#7ab8e8]/5";

export const lunarGlassHover =
  "hover:bg-[#132240]/70 hover:border-[#1e3460]/60 hover:shadow-[#7ab8e8]/10 transition-all duration-300";

// ─── Card Surface ─────────────────────────────────────────────────────────────

export const lunarCardSurface =
  "bg-[#0c1829]/80 backdrop-blur-md border border-[#1e3460]/50 rounded-xl shadow-md shadow-[#7ab8e8]/8";

// ─── Nav Styles ───────────────────────────────────────────────────────────────

export const lunarNavActive =
  "text-[#7ab8e8] bg-[#7ab8e8]/10 border-[#7ab8e8]/30";

export const lunarNavInactive =
  "text-[#6888a8] hover:text-[#94a8c0] hover:bg-[#0c1829]/40";
