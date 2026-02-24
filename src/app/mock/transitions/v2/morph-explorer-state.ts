import type { MorphType, ContainerStyle, ShaderPreset, FlipAxis } from "./morph-theme";

export type ContentStateIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const CONTENT_STATE_COUNT = 8;

export interface ExplorerState {
  container: ContainerStyle;
  currentType: MorphType;
  currentContentState: ContentStateIndex;
  previousContentState: ContentStateIndex;
  autoCycle: boolean;
  shaderPreset: ShaderPreset;
  flipAxis: FlipAxis;
  isTransitioning: boolean;
}

export type ExplorerAction =
  | { type: "SELECT_CONTAINER"; payload: ContainerStyle }
  | { type: "SELECT_TYPE"; payload: MorphType }
  | { type: "NEXT_STATE" }
  | { type: "PREV_STATE" }
  | { type: "SET_STATE"; payload: ContentStateIndex }
  | { type: "TOGGLE_AUTO_CYCLE" }
  | { type: "SET_SHADER_PRESET"; payload: ShaderPreset }
  | { type: "SET_FLIP_AXIS"; payload: FlipAxis }
  | { type: "TRANSITION_COMPLETE" };

export const initialExplorerState: ExplorerState = {
  container: "holographic-card",
  currentType: "gl-shader",
  currentContentState: 0,
  previousContentState: 0,
  autoCycle: false,
  shaderPreset: "crosswarp",
  flipAxis: "y",
  isTransitioning: false,
};

function nextState(current: ContentStateIndex): ContentStateIndex {
  return ((current + 1) % CONTENT_STATE_COUNT) as ContentStateIndex;
}

function prevState(current: ContentStateIndex): ContentStateIndex {
  return ((current + CONTENT_STATE_COUNT - 1) % CONTENT_STATE_COUNT) as ContentStateIndex;
}

export function explorerReducer(
  state: ExplorerState,
  action: ExplorerAction
): ExplorerState {
  switch (action.type) {
    case "SELECT_CONTAINER":
      return { ...state, container: action.payload };
    case "SELECT_TYPE":
      return {
        ...state,
        currentType: action.payload,
        previousContentState: state.currentContentState,
        isTransitioning: false,
      };
    case "NEXT_STATE": {
      if (state.isTransitioning) return state;
      const next = nextState(state.currentContentState);
      return {
        ...state,
        previousContentState: state.currentContentState,
        currentContentState: next,
        isTransitioning: true,
      };
    }
    case "PREV_STATE": {
      if (state.isTransitioning) return state;
      const prev = prevState(state.currentContentState);
      return {
        ...state,
        previousContentState: state.currentContentState,
        currentContentState: prev,
        isTransitioning: true,
      };
    }
    case "SET_STATE": {
      if (action.payload === state.currentContentState) return state;
      return {
        ...state,
        previousContentState: state.currentContentState,
        currentContentState: action.payload,
        isTransitioning: true,
      };
    }
    case "TOGGLE_AUTO_CYCLE":
      return { ...state, autoCycle: !state.autoCycle };
    case "SET_SHADER_PRESET":
      return { ...state, shaderPreset: action.payload };
    case "SET_FLIP_AXIS":
      return { ...state, flipAxis: action.payload };
    case "TRANSITION_COMPLETE":
      return { ...state, isTransitioning: false };
    default:
      return state;
  }
}
