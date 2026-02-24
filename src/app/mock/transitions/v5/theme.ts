// ─── Scrying Mirror Theme ─────────────────────────────────────────────────────

export const MIRROR_THEME = {
  bg: "#050012",
  gold: "#c9a94e",
  goldRgb: "201, 169, 78",
  violet: "#7b68ee",
  violetRgb: "123, 104, 238",
  deepPurple: "#1a0a3e",
  deepPurpleRgb: "26, 10, 62",
  silver: "#b8c0d0",
  bronze: "#cd7f32",
  copper: "#b87333",
  pearl: "#f0e6d3",
  obsidian: "#1a1a2e",
  stone: "#6b6b80",
  crystal: "#e0e8ff",
} as const;

// ─── Mirror Style Definitions ────────────────────────────────────────────────

export interface MirrorStyleDef {
  id: string;
  name: string;
  icon: string;
}

export const MIRROR_STYLES: MirrorStyleDef[] = [
  { id: "round-hand", name: "Round Hand Mirror", icon: "circle" },
  { id: "oval-vanity", name: "Oval Vanity", icon: "oval" },
  { id: "scrying-pool", name: "Scrying Pool", icon: "pool" },
  { id: "obsidian-slab", name: "Obsidian Slab", icon: "rect" },
  { id: "crystal-orb", name: "Crystal Orb", icon: "sphere" },
  { id: "gothic-arch", name: "Gothic Arch", icon: "arch" },
  { id: "ancient-bronze", name: "Ancient Bronze", icon: "bronze" },
  { id: "art-nouveau", name: "Art Nouveau", icon: "nouveau" },
  { id: "venetian", name: "Venetian", icon: "venetian" },
  { id: "crescent-moon", name: "Crescent Moon", icon: "moon" },
  { id: "hexagonal", name: "Hexagonal", icon: "hex" },
  { id: "diamond", name: "Diamond", icon: "diamond" },
  { id: "infinity-portal", name: "Infinity Portal", icon: "infinity" },
  { id: "tear-drop", name: "Tear Drop", icon: "tear" },
];

// ─── Transition Definitions ─────────────────────────────────────────────────

export interface TransitionDef {
  id: string;
  name: string;
  icon: string;
}

export const TRANSITIONS: TransitionDef[] = [
  { id: "water-ripple", name: "Water Ripple", icon: "ripple" },
  { id: "liquid-morph", name: "Liquid Morph", icon: "liquid" },
  { id: "ink-drop", name: "Ink Drop", icon: "ink" },
  { id: "mercury-pool", name: "Mercury Pool", icon: "mercury" },
  { id: "frost-melt", name: "Frost Melt", icon: "frost" },
  { id: "vortex-swirl", name: "Vortex Swirl", icon: "vortex" },
  { id: "rain-wash", name: "Rain Wash", icon: "rain" },
  { id: "bubble-rise", name: "Bubble Rise", icon: "bubble" },
  { id: "wave-crash", name: "Wave Crash", icon: "wave" },
  { id: "smoke-dissolve", name: "Smoke Dissolve", icon: "smoke" },
  { id: "crystal-shatter", name: "Crystal Shatter", icon: "shatter" },
  { id: "dream-fade", name: "Dream Fade", icon: "dream" },
  { id: "turbulence-warp", name: "Turbulence Warp", icon: "turbulence" },
  { id: "displacement-slide", name: "Displacement Slide", icon: "displace" },
];

// ─── Content Definitions ─────────────────────────────────────────────────────

export interface ContentDef {
  id: string;
  name: string;
  icon: string;
}

export const CONTENT_TYPES: ContentDef[] = [
  { id: "single-card", name: "Single Card", icon: "card" },
  { id: "three-spread", name: "Three-Card Spread", icon: "spread3" },
  { id: "five-spread", name: "Five-Card Spread", icon: "spread5" },
  { id: "deck-cover", name: "Deck Cover", icon: "deck" },
  { id: "reading-text", name: "Reading Text", icon: "text" },
  { id: "user-profile", name: "User Profile", icon: "user" },
  { id: "art-style", name: "Art Style Preview", icon: "palette" },
  { id: "activity-feed", name: "Activity Feed", icon: "activity" },
  { id: "card-grid", name: "Card Grid", icon: "grid" },
  { id: "guidance-quote", name: "Guidance Quote", icon: "quote" },
  { id: "deck-collection", name: "Deck Collection", icon: "collection" },
  { id: "spread-diagram", name: "Spread Diagram", icon: "diagram" },
];

// ─── Shared Constants ─────────────────────────────────────────────────────────

export const CONTENT_WIDTH_DESKTOP = 1024;
export const CONTENT_HEIGHT_DESKTOP = 1536;
export const CONTENT_WIDTH_MOBILE = 768;
export const CONTENT_HEIGHT_MOBILE = 1152;

export const TRANSITION_DURATION = 2.0; // seconds
