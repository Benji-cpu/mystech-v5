// Dream Journal — Design tokens and theme constants

export const DREAM = {
  // Core palette
  bg: "#0a0b1e",
  surface: "#121330",
  accent: "#d4a843",        // warm honey gold
  accentLight: "#e8c96a",
  secondary: "#c4ceff",      // moonlight blue
  secondaryDim: "#8b93b8",
  text: "#e8e6f0",
  textDim: "#8b87a0",
  border: "#2a2b5a",
  borderLight: "#3d3e72",

  // Glass morphism
  glass: "bg-[#121330]/60 backdrop-blur-xl border border-[#2a2b5a]/40",
  glassHover: "hover:bg-[#121330]/80 hover:border-[#3d3e72]/60",
  glassBright: "bg-[#121330]/80 backdrop-blur-xl border border-[#3d3e72]/60",

  // Gradients
  goldGradient: "bg-gradient-to-r from-[#d4a843] to-[#e8c96a]",
  moonGradient: "bg-gradient-to-br from-[#c4ceff]/20 to-[#8b93b8]/10",
  bgGradient: "bg-gradient-to-b from-[#0a0b1e] to-[#0f1028]",

  // Shadows
  goldGlow: "shadow-[0_0_20px_rgba(212,168,67,0.3)]",
  moonGlow: "shadow-[0_0_20px_rgba(196,206,255,0.15)]",

  // Typography
  heading: "font-serif tracking-tight",
  body: "font-sans",
  label: "text-xs uppercase tracking-widest",
} as const;

// Reusable spring config
export const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };
export const SPRING_GENTLE = { type: "spring" as const, stiffness: 200, damping: 25 };
export const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };
