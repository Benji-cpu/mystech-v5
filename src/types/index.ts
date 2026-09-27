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
export type DeckType = 'standard' | 'chronicle';
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

// Card types
export type CardImageStatus = 'pending' | 'generating' | 'completed' | 'failed' | 'none';
export type CardFeedbackType = 'loved' | 'dismissed';
export type CardType = 'general' | 'obstacle' | 'threshold';

export const ORIGIN_SOURCE = {
  RETREAT_COMPLETION: 'retreat_completion',
  OBSTACLE_DETECTION: 'obstacle_detection',
  CHRONICLE_EMERGENCE: 'chronicle_emergence',
  DECK_CREATION: 'deck_creation',
} as const;
export type OriginSource = typeof ORIGIN_SOURCE[keyof typeof ORIGIN_SOURCE];

export type CardOriginContext = {
  source: OriginSource;
  circleId?: string;
  circleName?: string;
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
  imageBlurData: string | null;
  imagePrompt: string | null;
  imageStatus: CardImageStatus;
  cardType: CardType;
  originContext: CardOriginContext | null;
  createdAt: Date;
};

/** Minimal shape for CardDetailModal */
export type CardDetailData = Pick<Card, 'id' | 'title' | 'meaning' | 'guidance' | 'imageUrl' | 'imagePrompt' | 'imageStatus' | 'cardType' | 'originContext'> & {
  imageBlurData?: string | null;
};

// Studio parameter types
export type StyleParameters = {
  seed?: number;
  cfgScale?: number;
  sampler?: string;
  stabilityPreset?: string;
  negativePrompt?: string;
};

export type CardOverrideParameters = {
  seed?: number;
  cfgScale?: number;
  sampler?: string;
  negativePrompt?: string;
  initImageUrl?: string;
  initImageStrength?: number;
};

export type StyleCategory = 'classical' | 'modern' | 'cultural' | 'illustration' | 'photography' | 'period' | 'nature';

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
  parameters: StyleParameters | null;
  referenceImageUrls: string[] | null;
  extractedDescription: string | null;
  category: StyleCategory | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CardOverride = {
  id: string;
  cardId: string;
  imagePrompt: string | null;
  parameters: CardOverrideParameters | null;
  createdAt: Date;
  updatedAt: Date;
};

// Reading types
export type SpreadType = 'single' | 'three_card' | 'five_card' | 'celtic_cross' | 'daily' | 'quick';
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
  retreatCardId: string | null;
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
export type ApiErrorCode =
  | "USAGE_LIMIT_EXCEEDED"
  | "PLAN_RESTRICTION"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION";

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: ApiErrorCode };

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// Chronicle knowledge anchor
export type Anchor = {
  theme: string;
  emotion: string;
  symbol: string;
};

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

// Chronicle types
export type ChroniclePhase =
  | 'idle'
  | 'emergence_reveal'
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

// ── Onboarding milestone types ──────────────────────────────────────────

export type OnboardingMilestone =
  // Stage 0
  | 'initiation_complete'
  // Stage 1: Getting oriented
  | 'nav_tutorial_seen'
  | 'dashboard_tour_seen'
  | 'first_deck_explored'
  // Stage 2: Deepening
  | 'second_reading_complete'
  | 'spread_types_introduced'
  | 'studio_introduced'
  // Stage 3: Daily Practice
  | 'chronicle_introduced'
  | 'first_chronicle_entry'
  | 'streak_concept_seen'
  // Stage 4-5: Going deeper
  | 'sharing_introduced'
  | 'pro_features_introduced';

export type OnboardingStage = 0 | 1 | 2 | 3 | 4 | 5;

// Activity feed types
export type ActivityItem = {
  id: string;          // composite: `${type}-${sourceId}`
  timestamp: Date;
} & (
  | { type: "deck_created"; deckId: string; deckTitle: string }
  | { type: "deck_completed"; deckId: string; deckTitle: string; coverImageUrl: string | null }
  | { type: "reading_performed"; readingId: string; spreadType: SpreadType; question: string | null; deckTitle: string }
  | { type: "chronicle_entry"; entryId: string; mood: string | null; themes: string[]; cardTitle: string | null }
  | { type: "badge_earned"; badgeId: string; badgeName: string; badgeEmoji: string }
);

export type ActivityItemWithTemporal = ActivityItem & { isFuture: boolean };

// Emergence event types
export type EmergenceEventType = 'obstacle' | 'threshold';
export type EmergenceEventStatus = 'pending' | 'generating' | 'ready' | 'delivered' | 'dismissed';

export type EmergenceEvent = {
  id: string;
  userId: string;
  deckId: string;
  eventType: EmergenceEventType;
  status: EmergenceEventStatus;
  detectedPattern: string;
  patternFrequency: number;
  relevantExcerpts: string[];
  cardId: string | null;
  lyraMessage: string | null;
  aiEvidence: string | null;
  confidence: number | null;
  createdAt: Date;
  deliveredAt: Date | null;
};

export type ChronicleDashboardStatus = {
  hasChronicle: boolean;
  completedToday: boolean;
  todayCard: Card | null;
  streakCount: number;
  totalCards: number;
  badges: ChronicleBadge[];
  deckId: string | null;
};
