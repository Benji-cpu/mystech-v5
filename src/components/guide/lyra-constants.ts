// All deterministic Lyra text — no AI calls needed

export const LYRA_GREETINGS = {
  firstVisit: [
    "Welcome. I'm Lyra — I'll be your guide through the cards.",
    "Hello. I've been waiting for you. I'm Lyra — let's begin.",
    "Welcome, seeker. I'm Lyra, and I'll be walking alongside you here.",
  ],
  hasDecksNoReadings: [
    "Your cards are waiting. Shall we see what they have to say?",
    "You've created something beautiful. Ready to let the cards speak?",
    "The deck is ready. When you are, so am I.",
  ],
  hasRecentReading: [
    "I've been reflecting on your last reading. There's more to explore when you're ready.",
    "The cards have settled since we last spoke. What draws you back today?",
    "Welcome back. Sometimes the most important insights arrive after the reading.",
  ],
  returningUser: {
    morning: [
      "A new day — the cards have had time to settle.",
      "Good morning. Fresh light often brings fresh clarity.",
      "The morning hours are good for new questions.",
    ],
    afternoon: [
      "The afternoon light reveals different angles.",
      "A good time for reflection. The day's momentum carries wisdom.",
      "Welcome back. The cards are here when you need them.",
    ],
    evening: [
      "The evening hours are good for reflection.",
      "As the day winds down, the cards speak more clearly.",
      "The quiet hours bring the deepest insights.",
    ],
  },
} as const;

export const CARD_REVEAL_NARRATION: Record<string, string> = {
  // Three-card spread
  Past: "Looking back... **{title}**. This is where the thread begins.",
  Present: "Here and now... **{title}**.",
  Future: "What's ahead... **{title}**.",
  // Five-card / Celtic Cross positions
  Situation: "At the center of it all... **{title}**.",
  Challenge: "What stands before you... **{title}**.",
  Foundation: "Beneath the surface... **{title}**.",
  "Recent Past": "What you're carrying... **{title}**.",
  "Near Future": "What's forming... **{title}**.",
  Self: "How you see yourself... **{title}**.",
  Environment: "The world around you... **{title}**.",
  "Hopes/Fears": "What pulls at you... **{title}**.",
  Outcome: "Where this all leads... **{title}**.",
  // Single card
  Insight: "The cards have chosen... **{title}**.",
  // Five-card additional
  Above: "What guides you from above... **{title}**.",
  Below: "What grounds you below... **{title}**.",
  Left: "What you're leaving behind... **{title}**.",
  Right: "What you're moving toward... **{title}**.",
  Center: "At the heart of the matter... **{title}**.",
};

export const CARD_REVEAL_FALLBACK = "**{title}**.";
export const CARD_REVEAL_INITIAL = "Let's see what the cards want to say...";

export const LYRA_EMPTY_STATES = {
  noReadings:
    "No readings yet. When you're ready, I'll be here to guide you through the cards.",
  noDecks:
    "Your collection awaits its first deck. Let's create one that speaks to where you are right now.",
} as const;

export const LYRA_UPGRADE_MESSAGES: Record<
  "credits" | "readings" | "spreads",
  { title: string; description: string }
> = {
  credits: {
    title: "A moment to pause",
    description:
      "We've reached the edge of what your current plan allows. If you'd like to continue creating, upgrading gives us more room to work together.",
  },
  readings: {
    title: "Let the insights settle",
    description:
      "You've had a full day of readings. Sometimes it's good to let the insights land before seeking more. Come back tomorrow, or upgrade for more space.",
  },
  spreads: {
    title: "Going deeper",
    description:
      "That spread reaches further — it's available on the Pro plan. In the meantime, a three-card reading can still reveal a great deal.",
  },
} as const;

// READING FLOW STEPS
export const LYRA_READING_FLOW = {
  deckSelector: {
    title: "Choose your deck",
    subtitle: "Which deck calls to you right now?",
    emptyMessage:
      "You'll need a completed deck before we can begin. Let's create one together.",
    emptyAction: "Create Your First Deck",
  },
  spreadSelector: {
    title: "Choose your spread",
    subtitle: "How deep shall we look?",
  },
  intentionInput: {
    title: "Set your intention",
    subtitle:
      "What question sits with you? Speak it clearly, or leave it open and let the cards lead.",
  },
  drawButton: "Draw the Cards",
  drawingButton: "The cards are turning...",
} as const;

// READING DETAIL
export const LYRA_READING_DETAIL = {
  feedbackPrompt: "Did this reading land?",
  newReading: "Draw Again",
} as const;

// DECK CREATION
export const LYRA_DECK_CREATION = {
  pageSubtitle: "How would you like to begin?",
  quickCreate:
    "Describe your vision and I'll shape the cards. Fast and focused.",
  guidedJourney:
    "We'll talk first. I'll ask questions, and the deck will emerge from the conversation.",
} as const;

// SIMPLE CREATE FORM
export const LYRA_SIMPLE_CREATE = {
  pageTitle: "Quick Create",
  pageSubtitle: "Shape a deck from your imagination.",
  visionHelper: "This shapes your deck's theme, card meanings, and imagery.",
  submitButton: "Bring It to Life",
  generatingButton: "Shaping the cards...",
  creditPreview: (count: number) =>
    `This will use ${count} card credits and ${count} image credits.`,
} as const;

export const LYRA_QUICK_CREATE_PROMPTS = [
  "A deck inspired by my grandmother's garden...",
  "Navigating a career crossroads...",
  "The phases of healing after loss...",
  "Lessons from the ocean and tides...",
  "The colors and moods of my childhood home...",
  "Finding courage during a life transition...",
  "The wisdom of seasonal changes...",
  "A journey through my favorite myths...",
  "The quiet strength in everyday rituals...",
  "What the stars have been telling me lately...",
] as const;

// FORGING EXPERIENCE (post-submit ceremony)
export const LYRA_FORGING_MESSAGES = [
  "Weaving your vision into the cards...",
  "The symbols are taking shape...",
  "Naming what wants to be named...",
  "Drawing the threads together...",
  "Almost there...",
] as const;

// GENERATION PROGRESS
export const LYRA_GENERATION = {
  inProgress: "Painting your cards...",
  almostDone: "Nearly there...",
  failed: (count: number) =>
    `${count} card${count !== 1 ? "s" : ""} didn't come through. We can try again.`,
  retryButton: "Try Again",
} as const;

// DRAFT REVIEW
export const LYRA_DRAFT_REVIEW = {
  title: "Review Your Cards",
  finalizeButton: (count: number) => `Finalize (${count} cards)`,
  replaceButton: (count: number) => `Replace Removed (${count})`,
} as const;

// LOADING STATES
export const LYRA_LOADING = {
  readings: "Gathering your readings...",
  newReading: "Preparing the space...",
  decks: "Finding your decks...",
  deckDetail: "Opening the deck...",
  paths: "Tracing the journey ahead...",
} as const;

// DASHBOARD
export const LYRA_DASHBOARD = {
  quickActions: {
    createDeck: "Begin a new deck from your experiences.",
    startReading: "Draw cards and see what surfaces.",
  },
  upgradeCta: {
    title: "There's more to explore",
    description:
      "Upgrading gives us more room — deeper spreads, more readings, and the full oracle experience.",
  },
} as const;

// PATHS
export const LYRA_PATHS = {
  subtitle:
    "Each path is a journey of deepening. Choose the one that calls to you.",
} as const;

// CELESTIAL PROFILE SETUP
export const LYRA_CELESTIAL = {
  intro:
    "Your birth sky is as unique as you are. Let me help you map it \u2014 each detail you share unlocks a deeper layer of your readings.",
  sunExplain:
    "When were you born? Your birth date reveals your Sun sign \u2014 the core of who you are, your identity and life purpose.",
  moonExplain:
    "Do you know your birth time? It reveals your Moon sign \u2014 your emotional inner world and deepest instincts. Check a birth certificate if you\u2019re unsure.",
  moonSkip:
    "That\u2019s perfectly fine. Your Sun sign alone will enrich your readings.",
  risingExplain:
    "Where were you born? Your Rising sign shapes how you present to the world \u2014 it needs both your time and place to calculate.",
  reveal:
    "Your birth sky is mapped. I\u2019ll weave these celestial threads into your readings from now on.",
  partialNudge: {
    noTime: "Add your birth time to discover your Moon sign",
    noLocation: "Add your birth location to reveal your Rising sign",
  },
} as const;

export const LYRA_ONBOARDING_MESSAGES = [
  "Hello. I'm Lyra — think of me as your companion in the cards.",
  "This app is a little different. The cards you'll draw aren't generic — they're made from your own life, your experiences, your symbols.",
  "We'll start by creating your first deck together. There's no rush — think of it as a conversation.",
] as const;

/**
 * Get a narration string for a card reveal, substituting the card title.
 */
export function getCardNarration(
  positionName: string,
  cardTitle: string
): string {
  const template =
    CARD_REVEAL_NARRATION[positionName] ?? CARD_REVEAL_FALLBACK;
  return template.replace("{title}", cardTitle);
}

/**
 * Pick a stable daily greeting based on user context.
 * Uses the date as a seed so the same message shows all day.
 */
export function pickGreeting(context: {
  deckCount: number;
  readingCount: number;
}): string {
  const seed = new Date().toDateString();
  const hash = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  if (context.deckCount === 0) {
    const arr = LYRA_GREETINGS.firstVisit;
    return arr[hash % arr.length];
  }

  if (context.readingCount === 0) {
    const arr = LYRA_GREETINGS.hasDecksNoReadings;
    return arr[hash % arr.length];
  }

  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const arr = LYRA_GREETINGS.returningUser[timeOfDay];
  return arr[hash % arr.length];
}

const CELESTIAL_GREETING_TEMPLATES = [
  "The {moonPhase} drifts through {moonSign} today\u2026",
  "Under tonight's {moonPhase} in {moonSign}\u2026",
  "{moonPhase} light filters through {moonSign}\u2026",
  "The moon wears {moonSign}'s colors tonight\u2026",
] as const;

/**
 * Pick a Lyra-voiced intro line that acknowledges today's celestial context.
 * Falls back to pickGreeting when no celestial data is available.
 */
export function pickCelestialGreeting(context: {
  deckCount: number;
  readingCount: number;
  moonPhase?: string;
  moonSign?: string;
}): string {
  if (!context.moonPhase || !context.moonSign) {
    return pickGreeting(context);
  }

  // First-visit and no-reading users still get their specific greetings
  if (context.deckCount === 0 || context.readingCount === 0) {
    return pickGreeting(context);
  }

  const seed = new Date().toDateString();
  const hash = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );

  const template = CELESTIAL_GREETING_TEMPLATES[hash % CELESTIAL_GREETING_TEMPLATES.length];
  return template
    .replace("{moonPhase}", context.moonPhase)
    .replace("{moonSign}", context.moonSign);
}
