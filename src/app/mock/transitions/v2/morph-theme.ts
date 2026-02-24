export const morphTheme = {
  bg: "#0a0b1e",
  surface: "#121330",
  surfaceHover: "#1a1b45",
  accent: "#d4a843",
  accentDim: "rgba(212, 168, 67, 0.3)",
  secondary: "#c4ceff",
  text: "#e8e6f0",
  textMuted: "rgba(232, 230, 240, 0.5)",
  textDim: "rgba(232, 230, 240, 0.25)",
  border: "#2a2b5a",
  borderActive: "rgba(212, 168, 67, 0.5)",
  cardBg: "rgba(18, 19, 48, 0.9)",
  glow: "0 0 30px rgba(212, 168, 67, 0.15)",
} as const;

export type MorphType =
  | "gl-shader"
  | "fluid-distortion"
  | "particle-cloud"
  | "displacement"
  | "flubber-svg"
  | "chromatic-dissolve"
  | "flip-3d"
  | "ripple-wave";

export const MORPH_TYPES = [
  { id: "gl-shader" as const, label: "GL Shader", lib: "R3F" },
  { id: "fluid-distortion" as const, label: "Fluid", lib: "Fluid" },
  { id: "particle-cloud" as const, label: "Particles", lib: "R3F" },
  { id: "displacement" as const, label: "Displace", lib: "Canvas" },
  { id: "flubber-svg" as const, label: "SVG Morph", lib: "Flubber" },
  { id: "chromatic-dissolve" as const, label: "Chromatic", lib: "Canvas" },
  { id: "flip-3d" as const, label: "3D Flip", lib: "R3F" },
  { id: "ripple-wave" as const, label: "Ripple", lib: "R3F" },
] as const;

export type ContainerStyle =
  | "holographic-card"
  | "fluid-vessel"
  | "nebula-frame"
  | "crystal-prism"
  | "smoke-border"
  | "lightning-cage"
  | "enchanted-mirror"
  | "void-gateway";

export const CONTAINER_STYLES: { id: ContainerStyle; label: string }[] = [
  { id: "holographic-card", label: "Holographic" },
  { id: "fluid-vessel", label: "Fluid" },
  { id: "nebula-frame", label: "Nebula" },
  { id: "crystal-prism", label: "Prism" },
  { id: "smoke-border", label: "Smoke" },
  { id: "lightning-cage", label: "Lightning" },
  { id: "enchanted-mirror", label: "Mirror" },
  { id: "void-gateway", label: "Void" },
];

export type ShaderPreset =
  | "crosswarp"
  | "directional-warp"
  | "burn"
  | "pixelate"
  | "morph"
  | "wind";

export const SHADER_PRESETS: { id: ShaderPreset; label: string }[] = [
  { id: "crosswarp", label: "Crosswarp" },
  { id: "directional-warp", label: "Dir Warp" },
  { id: "burn", label: "Burn" },
  { id: "pixelate", label: "Pixelate" },
  { id: "morph", label: "Morph" },
  { id: "wind", label: "Wind" },
];

export type FlipAxis = "x" | "y" | "diagonal";

export const FLIP_AXES: { id: FlipAxis; label: string }[] = [
  { id: "x", label: "X Axis" },
  { id: "y", label: "Y Axis" },
  { id: "diagonal", label: "Diagonal" },
];

/** Morph types that need R3F Canvas */
export const R3F_MORPH_TYPES = new Set<MorphType>([
  "gl-shader",
  "fluid-distortion",
  "particle-cloud",
  "flip-3d",
  "ripple-wave",
]);
