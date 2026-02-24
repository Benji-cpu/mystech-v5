export type TechniqueId =
  | "spring-property"
  | "layout-teleport"
  | "clip-path-sculpt"
  | "shatter-reconstitute"
  | "canvas-particles"
  | "perspective-fold"
  | "displacement-wave";

export interface StageTransition {
  key: string;
  onMidpoint: () => void;
}

export interface TechniqueProps {
  morphed: boolean;
  onMorphComplete?: () => void;
  stageTransition?: StageTransition | null;
  children?: React.ReactNode;
}

export interface TechniqueMeta {
  id: TechniqueId;
  name: string;
  library: string;
  description: string;
  moodPreset: string;
}

export const TECHNIQUES: TechniqueMeta[] = [
  {
    id: "spring-property",
    name: "Spring Property",
    library: "Framer Motion",
    description: "CSS property interpolation via spring physics",
    moodPreset: "default",
  },
  {
    id: "layout-teleport",
    name: "Layout Teleport",
    library: "Framer Motion",
    description: "layoutId shared element transitions",
    moodPreset: "card-draw",
  },
  {
    id: "clip-path-sculpt",
    name: "Clip-Path Sculpt",
    library: "CSS",
    description: "Polygon clip-path vertex transitions",
    moodPreset: "default",
  },
  {
    id: "shatter-reconstitute",
    name: "Shatter & Reform",
    library: "GSAP",
    description: "Grid fragment scatter and reconvergence",
    moodPreset: "forging",
  },
  {
    id: "canvas-particles",
    name: "Canvas Particles",
    library: "Canvas 2D",
    description: "500+ gold particle stream along bezier curves",
    moodPreset: "golden",
  },
  {
    id: "perspective-fold",
    name: "Perspective Fold",
    library: "CSS 3D",
    description: "Origami fold/unfold with real perspective depth",
    moodPreset: "midnight",
  },
  {
    id: "displacement-wave",
    name: "Displacement Wave",
    library: "SVG Filter + GSAP",
    description: "feTurbulence heat haze distortion morph",
    moodPreset: "card-draw",
  },
];

export interface MorphExplorerState {
  activeTechnique: TechniqueId;
  activeStage: import("./stages").StageId;
  pendingStage: import("./stages").StageId | null;
  morphed: boolean;
  transitioning: boolean;
}

export type MorphExplorerAction =
  | { type: "SELECT_TECHNIQUE"; id: TechniqueId }
  | { type: "SELECT_STAGE"; id: import("./stages").StageId }
  | { type: "TOGGLE_MORPH" }
  | { type: "STAGE_MIDPOINT" }
  | { type: "TRANSITION_COMPLETE" };
