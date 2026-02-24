import type { ViewId, AppState, AppAction, MoodId } from "../_shared/types";

// ─── Mood map per view ───────────────────────────────────────────────────────

export const VIEW_MOOD: Record<ViewId, MoodId> = {
  dashboard: "default",
  decks: "viewing",
  "deck-detail": "viewing",
  "card-detail": "warm",
  "create-deck": "creating",
  generation: "creating",
  "art-styles": "viewing",
  "art-style-detail": "viewing",
  reading: "reading",
  settings: "default",
};

// ─── Views that hide nav ─────────────────────────────────────────────────────

export const NAV_HIDDEN_VIEWS: ViewId[] = ["reading", "generation"];

// ─── Reducer ─────────────────────────────────────────────────────────────────

export const initialState: AppState = {
  currentView: "dashboard",
  viewParams: {},
  history: [],
  hideNav: false,
  mood: "default",
};

export function dreamReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE": {
      const newView = action.view;
      const newParams = action.params ?? {};
      return {
        ...state,
        currentView: newView,
        viewParams: newParams,
        history: [
          ...state.history,
          { view: state.currentView, params: state.viewParams },
        ],
        hideNav: NAV_HIDDEN_VIEWS.includes(newView),
        mood: VIEW_MOOD[newView],
      };
    }
    case "GO_BACK": {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        ...state,
        currentView: prev.view,
        viewParams: prev.params,
        history: state.history.slice(0, -1),
        hideNav: NAV_HIDDEN_VIEWS.includes(prev.view),
        mood: VIEW_MOOD[prev.view],
      };
    }
    case "SET_HIDE_NAV":
      return { ...state, hideNav: action.hidden };
    case "SET_MOOD":
      return { ...state, mood: action.mood };
    default:
      return state;
  }
}
