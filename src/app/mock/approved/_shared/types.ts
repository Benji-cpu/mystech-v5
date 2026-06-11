// ─── View & Navigation Types ─────────────────────────────────────────────────

export type ViewId =
  | "dashboard"
  | "decks"
  | "deck-detail"
  | "card-detail"
  | "create-deck"
  | "generation"
  | "art-styles"
  | "art-style-detail"
  | "reading"
  | "settings";

export type CreatePhase = "input" | "style" | "generating" | "done";
export type ReadingPhase = "spread" | "drawing" | "revealing" | "interpreting" | "complete";

export type MoodId = "default" | "reading" | "creating" | "viewing" | "warm";

export interface ViewParams {
  deckId?: string;
  cardId?: string;
  styleId?: string;
  deckName?: string;
}

export interface AppState {
  currentView: ViewId;
  viewParams: ViewParams;
  history: { view: ViewId; params: ViewParams }[];
  hideNav: boolean;
  mood: MoodId;
}

export type AppAction =
  | { type: "NAVIGATE"; view: ViewId; params?: ViewParams }
  | { type: "GO_BACK" }
  | { type: "SET_HIDE_NAV"; hidden: boolean }
  | { type: "SET_MOOD"; mood: MoodId };

// ─── Mock Data Types ─────────────────────────────────────────────────────────

export interface MockFullCard {
  id: string;
  deckId: string;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string;
  cardNumber: number;
}

export interface MockDeck {
  id: string;
  name: string;
  description: string;
  artStyleId: string;
  coverUrl: string;
  cardCount: number;
  cards: MockFullCard[];
  createdAt: string;
}

export interface MockArtStyle {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: string;
  sampleImages: string[];
}

export interface MockUser {
  name: string;
  email: string;
  avatar: string;
  plan: "free" | "pro";
}

export interface MockUserStats {
  totalDecks: number;
  totalCards: number;
  totalReadings: number;
  creditsUsed: number;
  creditsTotal: number;
  plan: "free" | "pro";
}

export interface MockActivity {
  id: string;
  type: "reading" | "deck_created" | "card_added" | "style_shared";
  title: string;
  subtitle: string;
  timestamp: string;
  icon: "sparkles" | "layers" | "plus" | "palette";
}
