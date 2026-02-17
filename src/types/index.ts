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
export type DeckType = 'standard' | 'living';
export type LivingDeckGenerationMode = 'manual' | 'auto';

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
export type SpreadType = 'single' | 'three_card' | 'five_card' | 'celtic_cross';
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
