"use client";

import type { AppState, AppAction, ViewId, MoodId } from "../_shared/types";

export const inkInitialState: AppState = {
  currentView: "dashboard",
  viewParams: {},
  history: [],
  hideNav: false,
  mood: "default",
};

const viewMoodMap: Partial<Record<ViewId, MoodId>> = {
  dashboard: "default",
  decks: "default",
  "deck-detail": "viewing",
  "card-detail": "viewing",
  "create-deck": "creating",
  generation: "creating",
  "art-styles": "viewing",
  "art-style-detail": "viewing",
  reading: "reading",
  settings: "default",
};

export function inkReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "NAVIGATE": {
      const newMood = viewMoodMap[action.view] ?? "default";
      const hideNav =
        action.view === "reading" || action.view === "generation";
      return {
        ...state,
        currentView: action.view,
        viewParams: action.params ?? {},
        history: [
          ...state.history,
          { view: state.currentView, params: state.viewParams },
        ],
        hideNav,
        mood: newMood,
      };
    }
    case "GO_BACK": {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      const newMood = viewMoodMap[prev.view] ?? "default";
      const hideNav = prev.view === "reading" || prev.view === "generation";
      return {
        ...state,
        currentView: prev.view,
        viewParams: prev.params,
        history: state.history.slice(0, -1),
        hideNav,
        mood: newMood,
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
