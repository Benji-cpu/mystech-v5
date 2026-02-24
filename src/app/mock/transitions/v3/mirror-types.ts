// Mirror Transition Explorer — TypeScript Interfaces

import type { CSSProperties, ReactNode, RefObject } from "react";

// ─── Mirror Definitions ─────────────────────────────────────────────────────

export interface MirrorDefinition {
  id: string;
  name: string;
  shape: string;
  treatment: string;
  clipPath: string; // SVG path d="" for content clipping (400x600 viewBox)
  frameSvg: string; // Decorative SVG markup string overlaid on frame
  outerStyle: CSSProperties;
  aspectRatio: number; // width / height
  thumbnailPath: string; // Simplified SVG path for selector preview
}

// ─── Transition Definitions ─────────────────────────────────────────────────

export type TransitionLibrary =
  | "css"
  | "framer"
  | "gsap"
  | "react-spring"
  | "svg"
  | "canvas"
  | "webgl"
  | "pixi";

export interface TransitionDefinition {
  id: string;
  name: string;
  library: TransitionLibrary;
  description: string;
  duration: number; // ms
  file: string; // which transition file it lives in
}

export interface TransitionProps {
  containerRef: RefObject<HTMLDivElement | null>;
  oldContent: ReactNode;
  newContent: ReactNode;
  isActive: boolean;
  onComplete: () => void;
  dimensions: { width: number; height: number };
}

// ─── Content Definitions ────────────────────────────────────────────────────

export type ContentTypeId =
  | "single-card"
  | "card-grid"
  | "deck-cover"
  | "three-card-spread"
  | "reading-text"
  | "art-style"
  | "user-profile"
  | "activity-feed"
  | "stats-dashboard"
  | "card-detail"
  | "five-card-spread"
  | "deck-list";

export interface ContentDefinition {
  id: ContentTypeId;
  name: string;
  description: string;
}

export interface ContentRendererProps {
  width: number;
  height: number;
}

// ─── Explorer State ─────────────────────────────────────────────────────────

export interface ExplorerState {
  selectedMirrorId: string;
  selectedTransitionId: string;
  currentContentId: ContentTypeId;
  nextContentId: ContentTypeId;
  isTransitioning: boolean;
  autoPlay: boolean;
}

export type ExplorerAction =
  | { type: "SELECT_MIRROR"; mirrorId: string }
  | { type: "SELECT_TRANSITION"; transitionId: string }
  | { type: "SELECT_NEXT_CONTENT"; contentId: ContentTypeId }
  | { type: "START_TRANSITION" }
  | { type: "COMPLETE_TRANSITION" }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "RANDOMIZE" };

// ─── Registry ───────────────────────────────────────────────────────────────

export interface MirrorRegistry {
  mirrors: MirrorDefinition[];
  transitions: TransitionDefinition[];
  contents: ContentDefinition[];
}
