// Mirror Transition Explorer — Central Registry

import type {
  ContentDefinition,
  MirrorRegistry,
  TransitionDefinition,
} from "./mirror-types";
import { MIRRORS } from "./mirrors";

export const TRANSITION_DEFINITIONS: TransitionDefinition[] = [
  {
    id: "turbulence-ripple",
    name: "Turbulence Ripple",
    library: "svg",
    description: "Animated feTurbulence + feDisplacementMap filter",
    duration: 1200,
    file: "svg-transitions",
  },
  {
    id: "spring-crossfade",
    name: "Spring Crossfade",
    library: "framer",
    description: "Spring-physics opacity + scale + blur",
    duration: 800,
    file: "framer-transitions",
  },
  {
    id: "liquid-clip-wipe",
    name: "Liquid Clip Wipe",
    library: "gsap",
    description: "Timeline-animated clip-path with sine-wave edges",
    duration: 1200,
    file: "gsap-transitions",
  },
  {
    id: "cascade-trail",
    name: "Cascade Trail",
    library: "react-spring",
    description: "8 horizontal strips with staggered spring dissolve",
    duration: 1000,
    file: "spring-transitions",
  },
  {
    id: "path-morph-mask",
    name: "Path Morph Mask",
    library: "svg",
    description: "Flubber interpolate morphing a clip mask shape",
    duration: 1500,
    file: "svg-transitions",
  },
  {
    id: "water-displacement",
    name: "Water Displacement",
    library: "webgl",
    description: "GLSL water shader rendered to mask",
    duration: 1500,
    file: "webgl-transitions",
  },
  {
    id: "gooey-merge",
    name: "Gooey Merge",
    library: "css",
    description: "blur + contrast filter creating gooey blob effect",
    duration: 800,
    file: "css-transitions",
  },
  {
    id: "fluid-sim",
    name: "Fluid Sim",
    library: "canvas",
    description: "Simplified Navier-Stokes fluid overlay",
    duration: 2000,
    file: "canvas-transitions",
  },
  {
    id: "simplex-dissolve",
    name: "Simplex Dissolve",
    library: "webgl",
    description: "Noise threshold with golden edge glow",
    duration: 1200,
    file: "webgl-transitions",
  },
  {
    id: "spiral-reveal",
    name: "Spiral Reveal",
    library: "svg",
    description: "Animated stroke-dashoffset spiral path mask",
    duration: 1500,
    file: "svg-transitions",
  },
  {
    id: "displacement-filter",
    name: "Displacement Filter",
    library: "pixi",
    description: "GPU 2D DisplacementFilter with noise texture",
    duration: 1200,
    file: "webgl-transitions",
  },
  {
    id: "smil-sweep",
    name: "SMIL Sweep",
    library: "svg",
    description: "Declarative <animate> rect sweep across mask",
    duration: 1000,
    file: "svg-transitions",
  },
  {
    id: "chromatic-split",
    name: "Chromatic Split",
    library: "css",
    description: "RGB channel offset + blur during crossfade",
    duration: 900,
    file: "css-transitions",
  },
  {
    id: "ink-drop",
    name: "Ink Drop",
    library: "canvas",
    description: "Expanding ink-in-water simulation from center",
    duration: 1500,
    file: "canvas-transitions",
  },
];

export const CONTENT_DEFINITIONS: ContentDefinition[] = [
  { id: "single-card", name: "Single Card", description: "Card image + title + meaning" },
  { id: "card-grid", name: "Card Grid", description: "2x3 mini card thumbnails" },
  { id: "deck-cover", name: "Deck Cover", description: "Cover image, name, card count" },
  { id: "three-card-spread", name: "3-Card Spread", description: "Past / Present / Future" },
  { id: "reading-text", name: "Reading Text", description: "Interpretation text" },
  { id: "art-style", name: "Art Style", description: "Style gradient + samples" },
  { id: "user-profile", name: "User Profile", description: "Avatar, name, stats" },
  { id: "activity-feed", name: "Activity Feed", description: "Recent activity list" },
  { id: "stats-dashboard", name: "Stats Dashboard", description: "2x2 stat grid" },
  { id: "card-detail", name: "Card Detail", description: "Large card with flip" },
  { id: "five-card-spread", name: "5-Card Spread", description: "Cross pattern spread" },
  { id: "deck-list", name: "Deck List", description: "Mini deck covers list" },
];

export const REGISTRY: MirrorRegistry = {
  mirrors: MIRRORS,
  transitions: TRANSITION_DEFINITIONS,
  contents: CONTENT_DEFINITIONS,
};
