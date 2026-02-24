export type ViewId = "dashboard" | "deck-grid" | "deck-detail" | "reading-flow";

export interface NavState {
  currentView: ViewId;
  previousView: ViewId | null;
  selectedDeckId: string | null;
  transitionDirection: "forward" | "backward";
}

export const VIEW_ORDER: ViewId[] = ["dashboard", "deck-grid", "deck-detail", "reading-flow"];

export const VIEW_LABELS: Record<ViewId, string> = {
  dashboard: "Home",
  "deck-grid": "Decks",
  "deck-detail": "Detail",
  "reading-flow": "Reading",
};
