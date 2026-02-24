import type { ComponentType } from "react";

// ─── Mirror Frames ──────────────────────────────────────────────────────────

export type MirrorId =
  | "baroque"
  | "art-deco"
  | "gothic-arch"
  | "victorian-oval"
  | "art-nouveau"
  | "rococo"
  | "crystal-ball"
  | "scrying-pool"
  | "rune-circle"
  | "floating-portal"
  | "obsidian-mirror"
  | "tarot-card-frame";

export interface MirrorFrameProps {
  children: React.ReactNode;
  className?: string;
}

export interface MirrorMeta {
  id: MirrorId;
  name: string;
  category: "ornate" | "mystical";
  shape: "circle" | "oval" | "rectangle" | "arch" | "card" | "ring" | "irregular";
  description: string;
}

export const MIRRORS: MirrorMeta[] = [
  { id: "baroque", name: "Baroque", category: "ornate", shape: "rectangle", description: "Gilded baroque frame with scrollwork" },
  { id: "art-deco", name: "Art Deco", category: "ornate", shape: "rectangle", description: "Geometric Art Deco lines" },
  { id: "gothic-arch", name: "Gothic Arch", category: "ornate", shape: "arch", description: "Pointed gothic arch window" },
  { id: "victorian-oval", name: "Victorian Oval", category: "ornate", shape: "oval", description: "Ornate Victorian oval frame" },
  { id: "art-nouveau", name: "Art Nouveau", category: "ornate", shape: "irregular", description: "Flowing organic Art Nouveau" },
  { id: "rococo", name: "Rococo", category: "ornate", shape: "rectangle", description: "Ornamental rococo flourishes" },
  { id: "crystal-ball", name: "Crystal Ball", category: "mystical", shape: "circle", description: "Glowing crystal orb" },
  { id: "scrying-pool", name: "Scrying Pool", category: "mystical", shape: "circle", description: "Top-down water pool" },
  { id: "rune-circle", name: "Rune Circle", category: "mystical", shape: "circle", description: "Rotating rune glyphs" },
  { id: "floating-portal", name: "Floating Portal", category: "mystical", shape: "ring", description: "Floating portal ring" },
  { id: "obsidian-mirror", name: "Obsidian Mirror", category: "mystical", shape: "irregular", description: "Dark reflective obsidian" },
  { id: "tarot-card-frame", name: "Tarot Card", category: "mystical", shape: "card", description: "Tarot card shape frame" },
];

export type MirrorRegistry = Record<MirrorId, ComponentType<MirrorFrameProps>>;

// ─── Transitions ────────────────────────────────────────────────────────────

export type TransitionId =
  | "displacement-wave"
  | "fluid-distortion"
  | "shader-fluid"
  | "shader-ripple"
  | "shader-wave"
  | "blur-dissolve"
  | "swirl"
  | "radial-mask-wipe"
  | "circle-reveal"
  | "smoke-dissolve"
  | "wobble-morph"
  | "ink-in-water"
  | "boundary-morph"
  | "filter-storm";

export interface TransitionProps {
  transitionKey: number;
  outgoing: React.ReactNode;
  incoming: React.ReactNode;
  onComplete: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export type TransitionLibrary = "Framer Motion" | "GSAP" | "React Spring" | "R3F" | "CSS" | "Canvas" | "SVG" | "flubber";

export interface TransitionMeta {
  id: TransitionId;
  name: string;
  library: TransitionLibrary;
  description: string;
  isR3F: boolean;
}

export const TRANSITIONS: TransitionMeta[] = [
  { id: "displacement-wave", name: "Displacement Wave", library: "SVG", description: "feTurbulence warp distortion", isR3F: false },
  { id: "fluid-distortion", name: "Fluid Distortion", library: "R3F", description: "WebGL fluid simulation overlay", isR3F: true },
  { id: "shader-fluid", name: "Shader Fluid", library: "R3F", description: "useFluid hook distortion", isR3F: true },
  { id: "shader-ripple", name: "Shader Ripple", library: "R3F", description: "useRipple concentric waves", isR3F: true },
  { id: "shader-wave", name: "Shader Wave", library: "R3F", description: "useWave flowing distortion", isR3F: true },
  { id: "blur-dissolve", name: "Blur Dissolve", library: "Framer Motion", description: "Blur + opacity + scale spring", isR3F: false },
  { id: "swirl", name: "Swirl", library: "Framer Motion", description: "Rotate + scale + blur vortex", isR3F: false },
  { id: "radial-mask-wipe", name: "Radial Mask Wipe", library: "CSS", description: "Radial gradient mask animation", isR3F: false },
  { id: "circle-reveal", name: "Circle Reveal", library: "CSS", description: "Expanding clip-path circle", isR3F: false },
  { id: "smoke-dissolve", name: "Smoke Dissolve", library: "Canvas", description: "Particle scatter with GSAP", isR3F: false },
  { id: "wobble-morph", name: "Wobble Morph", library: "React Spring", description: "Low-friction bounce springs", isR3F: false },
  { id: "ink-in-water", name: "Ink in Water", library: "Canvas", description: "Ink drop blobs with noise", isR3F: false },
  { id: "boundary-morph", name: "Boundary Morph", library: "flubber", description: "SVG clipPath path morphing", isR3F: false },
  { id: "filter-storm", name: "Filter Storm", library: "CSS", description: "hue-rotate + saturate keyframes", isR3F: false },
];

export type TransitionRegistry = Record<TransitionId, ComponentType<TransitionProps>>;

// ─── Content Views ──────────────────────────────────────────────────────────

export type ContentId =
  | "single-card"
  | "deck-overview"
  | "reading-text"
  | "card-spread"
  | "user-profile"
  | "art-style-preview"
  | "activity-feed"
  | "stats-dashboard"
  | "card-gallery"
  | "deck-collection";

export interface ContentViewProps {
  className?: string;
}

export interface ContentMeta {
  id: ContentId;
  name: string;
  description: string;
}

export const CONTENTS: ContentMeta[] = [
  { id: "single-card", name: "Single Card", description: "Card image + title + meaning" },
  { id: "deck-overview", name: "Deck Overview", description: "Cover + name + card count" },
  { id: "reading-text", name: "Reading Text", description: "Streaming interpretation" },
  { id: "card-spread", name: "Card Spread", description: "3-card Past/Present/Future" },
  { id: "user-profile", name: "User Profile", description: "Avatar + stats + plan" },
  { id: "art-style-preview", name: "Art Style", description: "Gradient + sample images" },
  { id: "activity-feed", name: "Activity Feed", description: "Recent actions list" },
  { id: "stats-dashboard", name: "Stats Dashboard", description: "Usage meters + counts" },
  { id: "card-gallery", name: "Card Gallery", description: "Grid of card thumbnails" },
  { id: "deck-collection", name: "Deck Collection", description: "All decks in mini-grid" },
];

export type ContentRegistry = Record<ContentId, ComponentType<ContentViewProps>>;

// ─── Explorer State ─────────────────────────────────────────────────────────

export type ControlTab = "mirror" | "transition" | "content";

export interface ExplorerState {
  activeMirror: MirrorId;
  activeTransition: TransitionId;
  activeContent: ContentId;
  previousContent: ContentId | null;
  transitionKey: number;
  isTransitioning: boolean;
  controlsOpen: boolean;
  activeControlTab: ControlTab;
}

export type ExplorerAction =
  | { type: "SELECT_MIRROR"; id: MirrorId }
  | { type: "SELECT_TRANSITION"; id: TransitionId }
  | { type: "SELECT_CONTENT"; id: ContentId }
  | { type: "TRIGGER_TRANSITION" }
  | { type: "TRANSITION_COMPLETE" }
  | { type: "TOGGLE_CONTROLS" }
  | { type: "SET_CONTROL_TAB"; tab: ControlTab }
  | { type: "RANDOM_ALL" };
