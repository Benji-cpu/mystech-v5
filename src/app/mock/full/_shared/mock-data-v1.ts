import type { MockDeck, MockFullCard, MockArtStyle, MockUser, MockUserStats, MockActivity } from "./types";

// ─── Card Images ─────────────────────────────────────────────────────────────
// 12 AI-generated images at /public/mock/cards/

const IMG = {
  dreamer: "/mock/cards/the-dreamer.png",
  alchemist: "/mock/cards/the-alchemist.png",
  wanderer: "/mock/cards/the-wanderer.png",
  mirror: "/mock/cards/the-mirror.png",
  flame: "/mock/cards/the-flame.png",
  guardian: "/mock/cards/the-guardian.png",
  weaver: "/mock/cards/the-weaver.png",
  oracle: "/mock/cards/the-oracle.png",
  storm: "/mock/cards/the-storm.png",
  garden: "/mock/cards/the-garden.png",
  bridge: "/mock/cards/the-bridge.png",
  compass: "/mock/cards/the-compass.png",
} as const;

// ─── Decks ───────────────────────────────────────────────────────────────────

function makeCard(
  id: string,
  deckId: string,
  title: string,
  meaning: string,
  guidance: string,
  imageUrl: string,
  cardNumber: number,
): MockFullCard {
  return { id, deckId, title, meaning, guidance, imageUrl, cardNumber };
}

const soulGardenCards: MockFullCard[] = [
  makeCard("sg-1", "souls-garden", "The Seed", "Potential, new beginnings, hidden promise", "Something is stirring beneath the surface. Trust the slow, invisible work happening within you. What you plant now will bloom in its own time.", IMG.garden, 1),
  makeCard("sg-2", "souls-garden", "The Root", "Foundation, stability, deep nourishment", "Ground yourself in what sustains you. Your roots run deeper than you realize, drawing strength from experiences you may have forgotten.", IMG.bridge, 2),
  makeCard("sg-3", "souls-garden", "The Bloom", "Fulfillment, expression, radiant beauty", "You are coming into your fullest expression. Let yourself be seen in all your color and complexity. This is your season to shine.", IMG.dreamer, 3),
  makeCard("sg-4", "souls-garden", "The Thorn", "Protection, boundaries, necessary pain", "Not all growth is gentle. The thorn protects the rose. Honor the parts of you that have learned to defend what matters most.", IMG.guardian, 4),
  makeCard("sg-5", "souls-garden", "The Vine", "Connection, growth, reaching outward", "You are reaching toward something new. Follow the light, even if the path winds. Growth rarely moves in straight lines.", IMG.weaver, 5),
  makeCard("sg-6", "souls-garden", "The Mulch", "Decay, transformation, fertile endings", "What falls away becomes nourishment for what comes next. Release with gratitude. Every ending feeds a new beginning.", IMG.alchemist, 6),
  makeCard("sg-7", "souls-garden", "The Rain", "Cleansing, renewal, emotional release", "Let the tears come. They water the garden of your becoming. After the rain, everything is clearer and more alive.", IMG.storm, 7),
  makeCard("sg-8", "souls-garden", "The Sunlight", "Warmth, clarity, life-giving energy", "Step into the light that has been waiting for you. Warmth and clarity are available when you turn your face toward them.", IMG.flame, 8),
  makeCard("sg-9", "souls-garden", "The Butterfly", "Metamorphosis, freedom, emergence", "The cocoon was never your home — it was your workshop. You have done the inner work. Now spread your wings.", IMG.wanderer, 9),
  makeCard("sg-10", "souls-garden", "The Gardener", "Stewardship, patience, tending with love", "You are both the garden and the gardener. Tend yourself with the same care you offer others. Patience is an act of love.", IMG.oracle, 10),
];

const midnightArcanaCards: MockFullCard[] = [
  makeCard("ma-1", "midnight-arcana", "The Veil", "Mystery, the unknown, hidden truths", "Not everything is meant to be understood right now. Sit with the mystery. The veil lifts when you stop trying to tear it away.", IMG.oracle, 1),
  makeCard("ma-2", "midnight-arcana", "The Shadow", "Repression, the unconscious, integration", "What you deny in yourself grows stronger in the dark. Turn and face your shadow — it has gifts for you.", IMG.mirror, 2),
  makeCard("ma-3", "midnight-arcana", "The Raven", "Messages, intelligence, transformation", "Pay attention to the signs around you. The universe is speaking through synchronicities. A message is trying to reach you.", IMG.storm, 3),
  makeCard("ma-4", "midnight-arcana", "The Crypt", "Buried memories, ancestral wisdom, depth", "Go deeper. Beneath the surface lies treasure that your ancestors stored for you. The past is not dead — it is composting.", IMG.bridge, 4),
  makeCard("ma-5", "midnight-arcana", "The Chalice", "Emotional depth, sacred container, offering", "Your heart is a chalice. What you choose to fill it with defines your experience. Pour out what no longer serves you.", IMG.alchemist, 5),
  makeCard("ma-6", "midnight-arcana", "The Obsidian Mirror", "Truth, clarity through darkness, reflection", "The darkest mirror shows the clearest reflection. Look at yourself honestly, without flinching. Radical truth is radical freedom.", IMG.mirror, 6),
  makeCard("ma-7", "midnight-arcana", "The Moth", "Attraction, devotion, following the light", "Like the moth to flame, you are drawn to what transforms you. Trust the pull, even when it frightens you.", IMG.flame, 7),
  makeCard("ma-8", "midnight-arcana", "The Eclipse", "Temporary darkness, alignment, breakthrough", "This shadow is temporary. The light has not gone — it is being aligned. When the eclipse passes, you will see everything differently.", IMG.guardian, 8),
];

const cosmicThreadsCards: MockFullCard[] = [
  makeCard("ct-1", "cosmic-threads", "The Star Map", "Destiny, navigation, cosmic guidance", "Your path is written in the stars, but you must learn to read the sky. Look up. The guidance you seek is already above you.", IMG.compass, 1),
  makeCard("ct-2", "cosmic-threads", "The Nebula", "Potential, creation, vast possibility", "You are a cloud of infinite potential, slowly coalescing into something magnificent. Don't rush the process of becoming.", IMG.dreamer, 2),
  makeCard("ct-3", "cosmic-threads", "The Binary Stars", "Partnership, balance, mutual orbit", "Two forces dance around each other, each one shaping the other's path. Your closest relationships are teaching you about gravity and grace.", IMG.weaver, 3),
  makeCard("ct-4", "cosmic-threads", "The Comet", "Sudden change, rare opportunity, brilliance", "Something fast and bright is crossing your sky. This may not come again. Be ready to wish upon it — or become it.", IMG.flame, 4),
  makeCard("ct-5", "cosmic-threads", "The Dark Matter", "Invisible forces, unseen influence, trust", "Most of the universe is invisible, yet it holds everything together. Trust the forces you cannot see that are supporting your journey.", IMG.guardian, 5),
  makeCard("ct-6", "cosmic-threads", "The Constellation", "Pattern, meaning, connection across distance", "Step back far enough and the scattered points of your life form a picture. The pattern was always there — you just needed perspective.", IMG.bridge, 6),
  makeCard("ct-7", "cosmic-threads", "The Void", "Space, potential, pregnant emptiness", "The void is not nothing — it is everything waiting to happen. In the space between thoughts, between heartbeats, creation begins.", IMG.oracle, 7),
  makeCard("ct-8", "cosmic-threads", "The Supernova", "Explosion, transformation, releasing light", "Some transformations are quiet. This one is not. Let yourself explode into new form. Your destruction is someone else's dawn.", IMG.storm, 8),
  makeCard("ct-9", "cosmic-threads", "The Orbit", "Cycles, return, coming home", "You have been here before, but you are not the same. Each orbit brings you closer to center. Spirals are not circles.", IMG.wanderer, 9),
  makeCard("ct-10", "cosmic-threads", "The Wormhole", "Shortcut, quantum leap, non-linear growth", "Not all journeys are linear. Sometimes the universe offers a shortcut through the fabric of reality. Are you brave enough to take it?", IMG.alchemist, 10),
  makeCard("ct-11", "cosmic-threads", "The Pulsar", "Rhythm, signal, steady beacon", "In the vast darkness, a steady pulse of light. You are that beacon for someone. Keep shining with reliable, rhythmic grace.", IMG.compass, 11),
  makeCard("ct-12", "cosmic-threads", "The Galaxy", "Wholeness, magnificence, the big picture", "You are not a single star — you are an entire galaxy. Billions of experiences, memories, and dreams swirling in magnificent order.", IMG.garden, 12),
];

const watercolorWhispersCards: MockFullCard[] = [
  makeCard("ww-1", "watercolor-whispers", "The Tide", "Emotion, ebb and flow, natural rhythm", "Your emotions are tidal — they rise and fall with forces beyond your control. Stop fighting the current and learn to float.", IMG.storm, 1),
  makeCard("ww-2", "watercolor-whispers", "The Mist", "Intuition, uncertainty, gentle knowing", "The path ahead is veiled, but your feet know the way. Trust the wisdom that lives below thought. Clarity will come gently.", IMG.dreamer, 2),
  makeCard("ww-3", "watercolor-whispers", "The Palette", "Choice, creativity, mixing new colors", "You hold all the colors. The canvas of your life awaits your choices. Mix boldly — the most beautiful shades come from unexpected combinations.", IMG.alchemist, 3),
  makeCard("ww-4", "watercolor-whispers", "The Reflection Pool", "Inner mirror, stillness, deep seeing", "Be still. In the quiet surface of your inner pool, you will see what turbulence hides. The truth is always there, waiting for calm.", IMG.mirror, 4),
  makeCard("ww-5", "watercolor-whispers", "The Brushstroke", "Action, expression, bold movement", "One bold stroke changes everything. Stop planning and start painting. The canvas needs your courage, not your perfection.", IMG.flame, 5),
  makeCard("ww-6", "watercolor-whispers", "The Wash", "Release, letting go, dissolving boundaries", "Let the colors run. Let the edges blur. Not everything needs to be contained. Some of your most beautiful moments came from letting go of control.", IMG.garden, 6),
];

export const MOCK_DECKS: MockDeck[] = [
  {
    id: "souls-garden",
    name: "Soul's Garden",
    description: "A deck rooted in growth, nature, and the patience of tending one's inner landscape.",
    artStyleId: "botanical",
    coverUrl: IMG.garden,
    cardCount: 10,
    cards: soulGardenCards,
    createdAt: "2025-12-15",
  },
  {
    id: "midnight-arcana",
    name: "Midnight Arcana",
    description: "Shadow work and transformation — diving into the dark to find hidden treasures.",
    artStyleId: "dark-gothic",
    coverUrl: IMG.mirror,
    cardCount: 8,
    cards: midnightArcanaCards,
    createdAt: "2026-01-03",
  },
  {
    id: "cosmic-threads",
    name: "Cosmic Threads",
    description: "Connection, destiny, and the vast patterns that link us across time and space.",
    artStyleId: "celestial",
    coverUrl: IMG.compass,
    cardCount: 12,
    cards: cosmicThreadsCards,
    createdAt: "2026-01-20",
  },
  {
    id: "watercolor-whispers",
    name: "Watercolor Whispers",
    description: "Intuition, emotion, and the fluid beauty of following your inner knowing.",
    artStyleId: "watercolor-dream",
    coverUrl: IMG.dreamer,
    cardCount: 6,
    cards: watercolorWhispersCards,
    createdAt: "2026-02-08",
  },
];

// ─── Art Styles ──────────────────────────────────────────────────────────────

export const MOCK_ART_STYLES: MockArtStyle[] = [
  {
    id: "tarot-classic",
    name: "Tarot Classic",
    description: "Traditional tarot imagery with gilded gold borders and rich symbolism.",
    gradient: "from-amber-900 via-yellow-700 to-amber-800",
    icon: "Crown",
    sampleImages: [IMG.oracle, IMG.guardian, IMG.alchemist, IMG.compass],
  },
  {
    id: "watercolor-dream",
    name: "Watercolor Dream",
    description: "Soft watercolor washes with delicate, flowing brushstrokes.",
    gradient: "from-pink-300 via-purple-200 to-blue-300",
    icon: "Droplets",
    sampleImages: [IMG.dreamer, IMG.garden, IMG.mirror, IMG.storm],
  },
  {
    id: "celestial",
    name: "Celestial",
    description: "Cosmic deep space imagery with nebulae, stars, and celestial bodies.",
    gradient: "from-indigo-900 via-violet-800 to-blue-900",
    icon: "Star",
    sampleImages: [IMG.compass, IMG.wanderer, IMG.bridge, IMG.flame],
  },
  {
    id: "botanical",
    name: "Botanical",
    description: "Detailed botanical illustrations with intricate plant and flower motifs.",
    gradient: "from-green-800 via-emerald-600 to-green-700",
    icon: "Leaf",
    sampleImages: [IMG.garden, IMG.weaver, IMG.dreamer, IMG.bridge],
  },
  {
    id: "abstract-mystic",
    name: "Abstract Mystic",
    description: "Sacred geometry patterns with abstract spiritual symbolism.",
    gradient: "from-purple-900 via-fuchsia-800 to-purple-700",
    icon: "Hexagon",
    sampleImages: [IMG.alchemist, IMG.oracle, IMG.flame, IMG.weaver],
  },
  {
    id: "dark-gothic",
    name: "Dark Gothic",
    description: "Dramatic gothic art with deep shadows and chiaroscuro lighting.",
    gradient: "from-gray-900 via-red-950 to-gray-900",
    icon: "Skull",
    sampleImages: [IMG.mirror, IMG.storm, IMG.guardian, IMG.oracle],
  },
  {
    id: "art-nouveau",
    name: "Art Nouveau",
    description: "Flowing organic lines and decorative natural forms in the Art Nouveau tradition.",
    gradient: "from-teal-800 via-amber-700 to-teal-700",
    icon: "Flower2",
    sampleImages: [IMG.weaver, IMG.dreamer, IMG.garden, IMG.bridge],
  },
  {
    id: "ethereal-light",
    name: "Ethereal Light",
    description: "Soft glowing art with pastel luminescence and dreamlike atmosphere.",
    gradient: "from-sky-200 via-rose-200 to-violet-200",
    icon: "Sun",
    sampleImages: [IMG.dreamer, IMG.compass, IMG.flame, IMG.wanderer],
  },
];

// ─── User & Stats ────────────────────────────────────────────────────────────

export const MOCK_USER: MockUser = {
  name: "Luna Starweaver",
  email: "luna@starweaver.com",
  avatar: "",
  plan: "free",
};

export const MOCK_STATS: MockUserStats = {
  totalDecks: 4,
  totalCards: 36,
  totalReadings: 12,
  creditsUsed: 7,
  creditsTotal: 11,
  plan: "free",
};

// ─── Recent Activity ─────────────────────────────────────────────────────────

export const MOCK_ACTIVITY: MockActivity[] = [
  {
    id: "act-1",
    type: "reading",
    title: "Three Card Reading",
    subtitle: "Using Cosmic Threads deck",
    timestamp: "2 hours ago",
    icon: "sparkles",
  },
  {
    id: "act-2",
    type: "deck_created",
    title: "Created Watercolor Whispers",
    subtitle: "6 cards, Watercolor Dream style",
    timestamp: "3 days ago",
    icon: "layers",
  },
  {
    id: "act-3",
    type: "card_added",
    title: "Added 3 cards to Soul's Garden",
    subtitle: "The Rain, The Sunlight, The Butterfly",
    timestamp: "1 week ago",
    icon: "plus",
  },
  {
    id: "act-4",
    type: "style_shared",
    title: "Shared Celestial style",
    subtitle: "Shared with a friend via link",
    timestamp: "2 weeks ago",
    icon: "palette",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDeckById(id: string): MockDeck | undefined {
  return MOCK_DECKS.find((d) => d.id === id);
}

export function getCardById(id: string): MockFullCard | undefined {
  for (const deck of MOCK_DECKS) {
    const card = deck.cards.find((c) => c.id === id);
    if (card) return card;
  }
  return undefined;
}

export function getStyleById(id: string): MockArtStyle | undefined {
  return MOCK_ART_STYLES.find((s) => s.id === id);
}

/** Get all cards across all decks (for reading pool) */
export function getAllCards(): MockFullCard[] {
  return MOCK_DECKS.flatMap((d) => d.cards);
}

/** Mock reading interpretation for streaming text */
export const MOCK_READING_INTERPRETATION = `The cards have woven a tapestry of meaning across the three positions.

**The Seed** (Past) — Your journey began with something small, a quiet stirring in the soil of your soul. This card speaks to the moment you first felt the pull toward change, even before you had words for it. The seed was planted long ago by hands you may not remember.

**The Shadow** (Present) — Right now, a shadow is passing across something familiar, revealing its hidden depths. What you thought you knew about yourself is being eclipsed by a deeper truth. This is uncomfortable but sacred — the shadow shows us what the light alone cannot reveal.

**The Star Map** (Future) — Your path is written in the stars, but you must learn to read the sky. The guidance you seek is already above you. Trust in the cosmic pattern that is unfolding — each point of light is a step on your journey home.

Together, these three cards tell the story of an awakening — from the first seed of possibility, through the revealing darkness of self-discovery, into the luminous guidance of the stars. Trust the process.`;

/** Shuffle helper */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
