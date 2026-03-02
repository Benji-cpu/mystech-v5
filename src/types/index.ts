// Voice types
export type VoiceSpeed = '0.75' | '1.0' | '1.25' | '1.5';
export type VoiceProvider = 'google' | 'elevenlabs';
export type VoicePreferences = {
  enabled: boolean;
  autoplay: boolean;
  speed: VoiceSpeed;
  voiceId: string | null;
};

// Deck types
export type DeckStatus = 'draft' | 'generating' | 'completed';
export type DeckType = 'standard' | 'living' | 'chronicle';
export type ChronicleGenerationMode = 'manual' | 'auto';
/** @deprecated Use ChronicleGenerationMode instead */
export type LivingDeckGenerationMode = ChronicleGenerationMode;

export type Deck = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  theme: string | null;
  status: DeckStatus;
  deckType: DeckType;
  cardCount: number;
  isPublic: boolean;
  shareToken: string | null;
  coverImageUrl: string | null;
  artStyleId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DeckWithOwner = Deck & {
  ownerName: string | null;
  ownerImage: string | null;
  isAdopted?: boolean;
};

// Card types
export type CardImageStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type CardFeedbackType = 'loved' | 'dismissed';
export type CardType = 'general' | 'obstacle' | 'threshold';

export type CardOriginContext = {
  source: 'retreat_completion' | 'obstacle_detection' | 'chronicle' | 'deck_creation';
  pathId?: string;
  pathName?: string;
  retreatId?: string;
  retreatName?: string;
  waypointId?: string;
  waypointName?: string;
  detectedPattern?: string;
  readingIds?: string[];
  forgedAt?: string;
};

export type Card = {
  id: string;
  deckId: string;
  cardNumber: number;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imagePrompt: string | null;
  imageStatus: CardImageStatus;
  cardType: CardType;
  originContext: CardOriginContext | null;
  createdAt: Date;
};

// Art style types
export type ArtStyle = {
  id: string;
  name: string;
  description: string;
  stylePrompt: string;
  previewImages: string[];
  isPreset: boolean;
  createdBy: string | null;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ArtStyleShare = {
  id: string;
  styleId: string;
  sharedWithUserId: string;
  accepted: boolean | null;
  createdAt: Date;
};

// Reading types
export type SpreadType = 'single' | 'three_card' | 'five_card' | 'celtic_cross' | 'daily';
export type ReadingLength = 'brief' | 'standard' | 'deep';

export type ReadingFeedback = 'positive' | 'negative';

export type Reading = {
  id: string;
  userId: string;
  deckId: string;
  spreadType: SpreadType;
  question: string | null;
  interpretation: string | null;
  shareToken: string | null;
  feedback: ReadingFeedback | null;
  createdAt: Date;
};

export type ReadingCard = {
  id: string;
  readingId: string;
  position: number;
  positionName: string;
  cardId: string | null;
  personCardId: string | null;
};

// Reading with full card data (for API responses)
export type ReadingWithCards = Reading & {
  cards: (ReadingCard & { card: Card | null })[];
  deck: { title: string; coverImageUrl: string | null };
};

// User profile types
export type UserProfile = {
  id: string;
  name: string | null;
  displayName: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  role: string;
  createdAt: Date;
};

// User context profile (for personalized readings)
export type UserContextProfile = {
  userId: string;
  lifeContext: string | null;
  interests: unknown;
  readingPreferences: string | null;
  readingLength: ReadingLength;
  contextSummary: string | null;
  contextVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

// Billing types
export type PlanType = 'free' | 'pro' | 'admin';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

export type Subscription = {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};

// Usage tracking — credit-based model
export type UsageTracking = {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  creditsUsed: number;
};

export type UsageStatus = {
  plan: PlanType;
  credits: { used: number; limit: number; remaining: number };
  readings: { usedToday: number; limitPerDay: number };
  periodEnd: string;
  isLifetimeCredits: boolean;
};

// API response types
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Journey mode types
export type ConversationRole = 'user' | 'assistant' | 'system';

export type ConversationMessage = {
  id: string;
  deckId: string;
  role: ConversationRole;
  content: string;
  createdAt: Date;
};

export type Anchor = {
  theme: string;
  emotion: string;
  symbol: string;
};

export type DraftCard = {
  cardNumber: number;
  title: string;
  meaning: string;
  guidance: string;
  imagePrompt: string;
  removed?: boolean;
  previousVersion?: {
    title: string;
    meaning: string;
    guidance: string;
    imagePrompt: string;
  };
};

export type JourneyReadinessState = {
  anchorsFound: number;
  targetCards: number;
  isReady: boolean;
  readinessText: string;
};

export type JourneyPhase = 'chat' | 'review';

// Prompt admin types
export type PromptEntry = {
  key: string;
  name: string;
  description: string;
  category: string;
  defaultValue: string;
  isTemplate: boolean;
  templateParams?: string[];
  override: {
    id: string;
    content: string;
    isActive: boolean;
    isPublished: boolean;
    updatedAt: string;
  } | null;
};

export type DraftDeckWithPhase = Deck & {
  journeyPhase: JourneyPhase;
  resumeHref: string;
};

// Astrology types
export type AstrologyProfile = {
  userId: string;
  birthDate: Date;
  birthTimeKnown: boolean;
  birthHour: number | null;
  birthMinute: number | null;
  birthLatitude: string | null;
  birthLongitude: string | null;
  birthLocationName: string | null;
  sunSign: string;
  moonSign: string | null;
  risingSign: string | null;
  planetaryPositions: Record<string, string> | null;
  elementBalance: { fire: number; earth: number; air: number; water: number } | null;
  spiritualInterests: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ReadingAstrology = {
  readingId: string;
  moonPhase: string;
  moonSign: string | null;
  cardAssociations: {
    cardTitle: string;
    positionName: string;
    rulingSign: string;
    rulingPlanet: string;
    elementHarmony: "aligned" | "complementary" | "challenging";
    relevantPlacement: "sun" | "moon" | "rising" | "general";
    astroNote: string;
  }[] | null;
  createdAt: Date;
};

export type AstrologicalReadingContext = {
  sunSign: string;
  moonSign: string | null;
  risingSign: string | null;
  elementBalance: { fire: number; earth: number; air: number; water: number } | null;
  currentMoonPhase: string;
  currentMoonSign: string;
};

// Chronicle types
export type ChroniclePhase =
  | 'idle'
  | 'greeting'
  | 'dialogue'
  | 'reflecting'
  | 'card_forging'
  | 'card_reveal'
  | 'reading'
  | 'complete';

export type ChronicleEntryStatus = 'in_progress' | 'completed' | 'abandoned';

export type ChronicleConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type ChronicleEntry = {
  id: string;
  userId: string;
  deckId: string;
  cardId: string | null;
  entryDate: string; // 'YYYY-MM-DD'
  conversation: ChronicleConversationMessage[];
  mood: string | null;
  themes: string[];
  miniReading: string | null;
  status: ChronicleEntryStatus;
  createdAt: Date;
  completedAt: Date | null;
};

export type ChronicleSettings = {
  deckId: string;
  chronicleEnabled: boolean;
  generationMode: ChronicleGenerationMode;
  lastCardGeneratedAt: Date | null;
  streakCount: number;
  longestStreak: number;
  totalEntries: number;
  lastEntryDate: string | null; // 'YYYY-MM-DD'
  badgesEarned: ChronicleBadge[];
  interests: ChronicleInterests | null;
};

export type ChronicleInterests = {
  spiritual: string[];
  lifeDomains: string[];
};

export type ChronicleBadge = {
  id: string;
  earnedAt: string;
};

export type ChronicleKnowledge = {
  userId: string;
  themes: Record<string, { count: number; lastSeen: string }>;
  lifeAreas: Record<string, { count: number; lastSeen: string }>;
  recurringSymbols: { symbol: string; count: number; lastSeen: string }[];
  keyEvents: { event: string; date: string; themes: string[] }[];
  emotionalPatterns: { pattern: string; frequency: number; lastSeen: string }[];
  personalityNotes: string | null;
  interests: ChronicleInterests | null;
  summary: string | null;
  version: number;
};

export type ChronicleBadgeDefinition = {
  id: string;
  name: string;
  threshold: number; // streak days required
  lyraMessage: string;
};

// ── Paths / Journey types ──────────────────────────────────────────────

export type PathStatus = 'active' | 'completed' | 'paused';

export type Path = {
  id: string;
  name: string;
  description: string;
  themes: string[];
  symbolicVocabulary: string[];
  interpretiveLens: string;
  isPreset: boolean;
  createdBy: string | null;
  isPublic: boolean;
  shareToken: string | null;
  followerCount: number;
  iconKey: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Retreat = {
  id: string;
  pathId: string;
  name: string;
  description: string;
  theme: string;
  sortOrder: number;
  retreatLens: string;
  estimatedReadings: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Waypoint = {
  id: string;
  retreatId: string;
  name: string;
  description: string;
  sortOrder: number;
  suggestedIntention: string;
  waypointLens: string;
  requiredReadings: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPathProgress = {
  id: string;
  userId: string;
  pathId: string;
  status: PathStatus;
  currentRetreatId: string | null;
  currentWaypointId: string | null;
  startedAt: Date;
  completedAt: Date | null;
};

export type UserRetreatProgress = {
  id: string;
  userId: string;
  retreatId: string;
  pathProgressId: string;
  status: 'active' | 'completed';
  readingCount: number;
  startedAt: Date;
  completedAt: Date | null;
  artifactSummary: string | null;
  artifactThemes: string[];
  artifactImageUrl: string | null;
  thresholdCardId: string | null;
};

export type UserWaypointProgress = {
  id: string;
  userId: string;
  waypointId: string;
  retreatProgressId: string;
  status: 'active' | 'completed';
  readingCount: number;
  startedAt: Date;
  completedAt: Date | null;
};

export type ReadingJourneyContext = {
  readingId: string;
  pathId: string;
  retreatId: string;
  waypointId: string;
  pathLensSnapshot: string;
  retreatLensSnapshot: string;
  waypointLensSnapshot: string;
  waypointIntentionSnapshot: string;
  createdAt: Date;
};

export type PathWithRetreats = Path & {
  retreats: (Retreat & { waypoints: Waypoint[] })[];
};

export type JourneyPosition = {
  path: Path;
  retreat: Retreat;
  waypoint: Waypoint;
  pathProgress: UserPathProgress;
  retreatProgress: UserRetreatProgress;
  waypointProgress: UserWaypointProgress;
};

export type CardJourneyMemory = {
  cardTitle: string;
  retreatName: string;
  waypointName: string;
  question: string | null;
  readingDate: Date;
};

export type JourneyContextForPrompt = {
  pathName: string;
  pathLens: string;
  retreatName: string;
  retreatLens: string;
  waypointName: string;
  waypointLens: string;
  suggestedIntention: string;
  cardsRemember: CardJourneyMemory[];
};

// Activity feed types
export type CelestialEventType =
  | "new_moon" | "first_quarter" | "full_moon" | "last_quarter"
  | "spring_equinox" | "summer_solstice" | "autumn_equinox" | "winter_solstice"
  | "lunar_eclipse" | "solar_eclipse"
  | "retrograde_start" | "retrograde_end";

export type TransitAspect = "conjunction" | "opposition" | "trine" | "square" | "sextile";

export type ActivityItem = {
  id: string;          // composite: `${type}-${sourceId}`
  timestamp: Date;
} & (
  | { type: "deck_created"; deckId: string; deckTitle: string }
  | { type: "deck_completed"; deckId: string; deckTitle: string; coverImageUrl: string | null }
  | { type: "reading_performed"; readingId: string; spreadType: SpreadType; question: string | null; deckTitle: string }
  | { type: "chronicle_entry"; entryId: string; mood: string | null; themes: string[]; cardTitle: string | null }
  | { type: "badge_earned"; badgeId: string; badgeName: string; badgeEmoji: string }
  | { type: "astrology_setup"; sunSign: string }
  | { type: "deck_adopted"; deckId: string; deckTitle: string; ownerName: string | null }
  | { type: "celestial_event"; eventType: CelestialEventType; title: string; description: string; zodiacSign?: string; planet?: string }
  | { type: "personal_transit"; transitPlanet: string; natalPlanet: string; aspect: TransitAspect; title: string; description: string; significance: "major" | "minor" }
);

export type ActivityItemWithTemporal = ActivityItem & { isFuture: boolean };

export type ChronicleDashboardStatus = {
  hasChronicle: boolean;
  completedToday: boolean;
  todayCard: Card | null;
  streakCount: number;
  totalCards: number;
  badges: ChronicleBadge[];
  deckId: string | null;
};
