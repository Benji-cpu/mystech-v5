/** Fake data for mock pages — no API calls needed */

export interface MockCard {
  id: string;
  title: string;
  meaning: string;
  imageUrl: string;
}

export interface MockSpread {
  name: string;
  count: number;
  positions: { label: string; x: number; y: number; rotation?: number }[];
}

export interface MockTheme {
  id: string;
  label: string;
  color: string;
}

export interface MockMessage {
  role: "user" | "assistant";
  content: string;
  themes?: string[];
}

// ─── Cards ───────────────────────────────────────────────────────────────────

export const MOCK_CARDS: MockCard[] = [
  { id: "1", title: "The Dreamer", meaning: "New beginnings, imagination, potential", imageUrl: "/mock/cards/the-dreamer.png" },
  { id: "2", title: "The Alchemist", meaning: "Transformation, mastery, creation", imageUrl: "/mock/cards/the-alchemist.png" },
  { id: "3", title: "The Wanderer", meaning: "Journey, exploration, freedom", imageUrl: "/mock/cards/the-wanderer.png" },
  { id: "4", title: "The Mirror", meaning: "Reflection, truth, self-knowledge", imageUrl: "/mock/cards/the-mirror.png" },
  { id: "5", title: "The Flame", meaning: "Passion, courage, transformation", imageUrl: "/mock/cards/the-flame.png" },
  { id: "6", title: "The Guardian", meaning: "Protection, strength, boundaries", imageUrl: "/mock/cards/the-guardian.png" },
  { id: "7", title: "The Weaver", meaning: "Connection, patterns, destiny", imageUrl: "/mock/cards/the-weaver.png" },
  { id: "8", title: "The Oracle", meaning: "Wisdom, vision, inner knowing", imageUrl: "/mock/cards/the-oracle.png" },
  { id: "9", title: "The Storm", meaning: "Disruption, change, cleansing", imageUrl: "/mock/cards/the-storm.png" },
  { id: "10", title: "The Garden", meaning: "Growth, nurturing, patience", imageUrl: "/mock/cards/the-garden.png" },
  { id: "11", title: "The Bridge", meaning: "Transition, crossing, connection", imageUrl: "/mock/cards/the-bridge.png" },
  { id: "12", title: "The Compass", meaning: "Direction, purpose, alignment", imageUrl: "/mock/cards/the-compass.png" },
];

// ─── Spreads ─────────────────────────────────────────────────────────────────

export const MOCK_SPREADS: MockSpread[] = [
  {
    name: "Single Card",
    count: 1,
    positions: [{ label: "Focus", x: 50, y: 50 }],
  },
  {
    name: "Three Card",
    count: 3,
    positions: [
      { label: "Past", x: 20, y: 50 },
      { label: "Present", x: 50, y: 50 },
      { label: "Future", x: 80, y: 50 },
    ],
  },
  {
    name: "Five Card Cross",
    count: 5,
    positions: [
      { label: "Past", x: 15, y: 50 },
      { label: "Challenge", x: 50, y: 20 },
      { label: "Present", x: 50, y: 50 },
      { label: "Guidance", x: 50, y: 80 },
      { label: "Future", x: 85, y: 50 },
    ],
  },
  {
    name: "Celtic Cross",
    count: 10,
    positions: [
      { label: "Present", x: 30, y: 50 },
      { label: "Challenge", x: 30, y: 50, rotation: 90 },
      { label: "Foundation", x: 30, y: 80 },
      { label: "Recent Past", x: 12, y: 50 },
      { label: "Crown", x: 30, y: 20 },
      { label: "Near Future", x: 48, y: 50 },
      { label: "Self", x: 75, y: 80 },
      { label: "Environment", x: 75, y: 60 },
      { label: "Hopes", x: 75, y: 40 },
      { label: "Outcome", x: 75, y: 20 },
    ],
  },
];

// ─── Themes ──────────────────────────────────────────────────────────────────

export const MOCK_THEMES: MockTheme[] = [
  { id: "resilience", label: "Resilience", color: "#c9a94e" },
  { id: "creativity", label: "Creativity", color: "#7c4dff" },
  { id: "transformation", label: "Transformation", color: "#ff6b6b" },
  { id: "connection", label: "Connection", color: "#4ecdc4" },
  { id: "wisdom", label: "Inner Wisdom", color: "#45b7d1" },
  { id: "courage", label: "Courage", color: "#f7a072" },
  { id: "growth", label: "Growth", color: "#96ceb4" },
  { id: "healing", label: "Healing", color: "#dda0dd" },
];

// ─── Conversation ────────────────────────────────────────────────────────────

export const MOCK_CONVERSATION: MockMessage[] = [
  {
    role: "assistant",
    content: "Welcome, seeker. I am here to help you create a deck that reflects the deeper patterns of your life. Tell me — what has been weighing on your heart lately?",
  },
  {
    role: "user",
    content: "I've been going through a major career change. Left my corporate job to pursue art full-time. It's terrifying but also exhilarating.",
  },
  {
    role: "assistant",
    content: "Ah, the leap into the unknown — one of the most courageous acts a soul can take. I sense threads of both fear and liberation woven through this transition. The part of you that built safety in the corporate world is grieving, while your creative spirit is finally breathing freely.",
    themes: ["resilience", "courage"],
  },
  {
    role: "user",
    content: "That's exactly it. Some days I feel like I'm flying, other days I wonder if I've made a huge mistake.",
  },
  {
    role: "assistant",
    content: "This duality is not a weakness — it is the very engine of transformation. The alchemists knew that gold is forged only through fire. Your doubt is the crucible, and your art is what emerges refined.",
    themes: ["transformation"],
  },
  {
    role: "user",
    content: "I also recently reconnected with a childhood friend who's going through something similar. It feels like the universe brought us together.",
  },
  {
    role: "assistant",
    content: "The threads of connection reveal themselves when we are most open to receiving them. This reunion is no accident — it is a mirror showing you that you are not alone on this path. These shared journeys weave the strongest bonds.",
    themes: ["connection", "wisdom"],
  },
  {
    role: "user",
    content: "I've been painting a lot about nature and cycles — seasons changing, gardens growing, storms passing.",
  },
  {
    role: "assistant",
    content: "Your art speaks of deep knowing. The garden, the storm, the turning of seasons — these are the oldest oracles. Through your paintings, you are already reading the cards of the natural world. Your deck is revealing itself.",
    themes: ["creativity", "growth"],
  },
];

// ─── Fake interpretation ─────────────────────────────────────────────────────

export const MOCK_INTERPRETATION = `The cards have spoken, weaving a narrative of profound transformation.

**The Dreamer** in your past position speaks to the seed of imagination that was always within you — the quiet knowing that your creative spirit needed more room to breathe. This card honors the courage it took to acknowledge that truth.

**The Alchemist** at the center of your reading confirms that you are in the midst of a powerful transformation. Like the ancient practitioners who turned lead into gold, you are transmuting the security of your old life into something far more precious — authentic self-expression.

**The Wanderer** looking toward your future suggests that this journey has only just begun. There are unexplored territories ahead, both in your art and in your understanding of yourself. Embrace the unknown with the same courage that brought you this far.

Together, these three cards form a triad of creative rebirth. The universe is not asking you to choose between security and passion — it is showing you that true security comes from living in alignment with your deepest gifts.`;
