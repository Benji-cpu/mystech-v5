import type { AppState, AppAction, MoodId, ViewId } from "../_shared/types";

// ─── Initial State ────────────────────────────────────────────────────────────

export const lunarInitialState: AppState = {
  currentView: "dashboard",
  viewParams: {},
  history: [],
  hideNav: false,
  mood: "default",
};

// ─── View → Mood Mapping ──────────────────────────────────────────────────────

const viewMoodMap: Partial<Record<ViewId, MoodId>> = {
  reading: "reading",
  "create-deck": "creating",
  generation: "creating",
  "deck-detail": "viewing",
  "card-detail": "viewing",
  dashboard: "default",
  settings: "default",
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function lunarReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE": {
      const newMood = viewMoodMap[action.view] ?? "default";
      const hideNav = action.view === "reading" || action.view === "generation";
      return {
        ...state,
        history: [
          ...state.history,
          { view: state.currentView, params: state.viewParams },
        ],
        currentView: action.view,
        viewParams: action.params ?? {},
        mood: newMood,
        hideNav,
      };
    }
    case "GO_BACK": {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      const newMood = viewMoodMap[prev.view] ?? "default";
      const hideNav = prev.view === "reading" || prev.view === "generation";
      return {
        ...state,
        history: state.history.slice(0, -1),
        currentView: prev.view,
        viewParams: prev.params,
        mood: newMood,
        hideNav,
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
