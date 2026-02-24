// Mirror Transition Explorer — Design Tokens & Theme

export const MIRROR_COLORS = {
  bg: "#0a0118",
  bgSubtle: "#110222",
  surface: "rgba(255, 255, 255, 0.05)",
  surfaceHover: "rgba(255, 255, 255, 0.08)",
  surfaceActive: "rgba(255, 255, 255, 0.12)",
  border: "rgba(255, 255, 255, 0.1)",
  borderActive: "rgba(201, 169, 78, 0.5)",
  gold: "#c9a94e",
  goldDim: "#8a7235",
  goldGlow: "rgba(201, 169, 78, 0.3)",
  text: "#e8e0f0",
  textMuted: "#9b8fb0",
  textDim: "#6b5f80",
  purple: "#7c3aed",
  purpleGlow: "rgba(124, 58, 237, 0.2)",
  // Mirror-specific
  obsidian: "#0d1117",
  mercury: "#c0c8d0",
  moonstone: "#d8cfe8",
  amethyst: "#6b21a8",
  iron: "#4a4458",
  silver: "#c4c9d4",
  brass: "#b8963e",
  coral: "#e88a8a",
  walnut: "#3d2b1f",
  copper: "#b87333",
  verdigris: "#43b3ae",
  stainedGlass: "#4a90d9",
} as const;

export const MIRROR_SPRINGS = {
  snappy: { stiffness: 400, damping: 30 },
  default: { stiffness: 300, damping: 30 },
  gentle: { stiffness: 200, damping: 25 },
  slow: { stiffness: 120, damping: 20 },
  bouncy: { stiffness: 300, damping: 15 },
} as const;

export const MIRROR_GLASS = {
  panel: "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl",
  panelHover: "hover:bg-white/8 hover:border-white/15",
  card: "bg-white/5 backdrop-blur-md border border-white/10 rounded-xl",
  button:
    "bg-white/10 backdrop-blur-sm border border-white/15 rounded-lg hover:bg-white/15 transition-colors",
  buttonActive:
    "bg-gradient-to-r from-amber-900/40 to-yellow-800/40 border-amber-600/50",
  input:
    "bg-white/5 border border-white/10 rounded-lg focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30",
} as const;

export const TRANSITION_DURATIONS = {
  fast: 600,
  default: 1000,
  slow: 1500,
  verySlow: 2500,
} as const;
