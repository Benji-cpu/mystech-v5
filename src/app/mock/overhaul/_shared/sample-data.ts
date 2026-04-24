// Shared sample data for all style variants.
// Every variant pulls from here so visual differences are purely stylistic.

export const SAMPLE = {
  user: { name: "Benji" },
  meta: {
    weekday: "Tuesday",
    date: "April 22",
    moonPhase: "Waning Gibbous",
    moonSign: "Moon in Scorpio",
    streak: 12,
  },
  greeting: {
    headline: "Good evening, Benji.",
    whisper: "The week turns inward. The deck asks for quieter attention today.",
  },
  primaryPractice: {
    eyebrow: "Today's practice",
    title: "Draw your chronicle card",
    description: "A single card from your living deck. Five minutes of quiet to begin.",
    deckSize: 54,
    cta: "Begin",
  },
  nextWaypoint: {
    pathName: "The Threshold",
    waypointName: "Sitting with stillness",
    position: "Waypoint 4 of 7",
    duration: "8 min",
  },
  recent: [
    { id: "r1", title: "A quiet return", date: "2 days ago", spread: "Single card" },
    { id: "r2", title: "What the week is asking", date: "5 days ago", spread: "Three card" },
    { id: "r3", title: "Threshold", date: "Last week", spread: "Single card" },
  ],
  // Reading ceremony — three-card spread revealed
  reading: {
    spread: "Past · Present · Emergent",
    deckName: "Chronicle of Benji",
    cards: [
      {
        id: "c1",
        position: "Past",
        title: "The Unfinished Letter",
        hue: "rust",
        symbol: "✦",
        excerpt: "Something you began and never sent still shapes the room.",
      },
      {
        id: "c2",
        position: "Present",
        title: "The Stone in the Pocket",
        hue: "deep",
        symbol: "◯",
        excerpt: "A reminder you keep close. It is both weight and anchor.",
      },
      {
        id: "c3",
        position: "Emergent",
        title: "The Open Window",
        hue: "pale",
        symbol: "△",
        excerpt: "An arrival you cannot yet name. Keep the latch unbolted.",
      },
    ],
    interpretation:
      "These three cards trace a thread you've been pulling quietly for weeks. The unfinished letter is a version of yourself still speaking in your peripheral vision — not a regret, more a companion. The stone in your pocket is what the week has made familiar: a practice that feels mundane but is, in fact, doing the work. The open window is the small permission you haven't given yourself yet. It asks nothing urgent, only that you stop closing it.",
  },
  // Decks library
  decks: [
    {
      id: "d1",
      title: "Chronicle of Benji",
      subtitle: "Living deck",
      cardCount: 54,
      hue: "indigo",
      tag: "Chronicle",
    },
    {
      id: "d2",
      title: "The Unbound Heart",
      subtitle: "Finished",
      cardCount: 7,
      hue: "rose",
      tag: null,
    },
    {
      id: "d3",
      title: "Clarity in Open Paths",
      subtitle: "Finished",
      cardCount: 12,
      hue: "moss",
      tag: null,
    },
    {
      id: "d4",
      title: "Sacred Sensuality Blossoms",
      subtitle: "Finished",
      cardCount: 9,
      hue: "rust",
      tag: null,
    },
    {
      id: "d5",
      title: "Morning Practice",
      subtitle: "Draft",
      cardCount: 3,
      hue: "pale",
      tag: "Draft",
    },
    {
      id: "d6",
      title: "The Long Walk",
      subtitle: "Living deck",
      cardCount: 22,
      hue: "deep",
      tag: null,
    },
  ] as const,
  // Card detail
  cardDetail: {
    deckName: "Chronicle of Benji",
    position: "28 of 54",
    title: "The Stone in the Pocket",
    subtitle: "A keepsake that knows you.",
    meaning:
      "This card is a small, dense thing. Not heavy enough to notice, not light enough to forget. It appears when the ordinary object in your life is quietly holding a meaning — a worn key, a folded receipt, the ring you never wear but never remove. Let it stay there. The card is not asking you to do anything except name what it is.",
    keywords: ["ritual", "weight", "belonging", "quiet continuity"],
    drawnDate: "April 14, 2026",
  },
  nav: [
    { label: "Home", key: "home" },
    { label: "Paths", key: "paths" },
    { label: "Decks", key: "decks" },
    { label: "Feedback", key: "feedback" },
  ],
};

export type Sample = typeof SAMPLE;
