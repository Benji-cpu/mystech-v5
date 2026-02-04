// Deck types
export type DeckStatus = 'draft' | 'generating' | 'completed';

export type Deck = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  theme: string | null;
  status: DeckStatus;
  cardCount: number;
  isPublic: boolean;
  coverImageUrl: string | null;
  artStyleId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Card types
export type CardImageStatus = 'pending' | 'generating' | 'completed' | 'failed';

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

// Person card types
export type PersonCard = {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  description: string;
  photoUrl: string | null;
  photoBlobKey: string | null;
  meaning: string;
  guidance: string;
  createdAt: Date;
  updatedAt: Date;
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

export type Reading = {
  id: string;
  userId: string;
  deckId: string;
  spreadType: SpreadType;
  question: string | null;
  interpretation: string | null;
  shareToken: string | null;
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

// Billing types
export type PlanType = 'free' | 'pro';
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

// Usage tracking
export type UsageTracking = {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  cardsCreated: number;
  readingsPerformed: number;
  imagesGenerated: number;
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
