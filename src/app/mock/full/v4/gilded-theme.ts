// Color palette for the Gilded Manuscript theme
export const THEME = {
  bg: "#0f0b08",           // Deepest background (aged leather)
  surface: "#1a1510",      // Panels, cards
  surface2: "#241c14",     // Elevated surfaces, hover
  border: "#3d3020",       // Subtle warm borders
  gold: "#c9a94e",         // Primary accent (the leaf)
  goldBright: "#e0c65c",   // Hover highlights
  goldDim: "#8b7340",      // Muted borders
  parchment: "#f0e6d2",    // Primary text
  parchmentDim: "#b8a88a", // Secondary text
  crimson: "#8b2020",      // Illuminated initial caps
} as const;

// Glass morphism class string
export const GLASS =
  "bg-[#1a1510]/70 backdrop-blur-xl border border-[#3d3020]/50 rounded-2xl shadow-lg shadow-[#c9a94e]/5";

// Gold gradient button class
export const GOLD_BUTTON =
  "bg-gradient-to-r from-[#8b7340] via-[#c9a94e] to-[#8b7340] text-[#0f0b08] font-semibold";

// Gold outline button
export const GOLD_OUTLINE =
  "border border-[#8b7340]/50 text-[#c9a94e] hover:bg-[#c9a94e]/10";
