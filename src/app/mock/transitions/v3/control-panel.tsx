"use client";

import type { ContentTypeId, ExplorerAction, ExplorerState, MirrorDefinition, TransitionDefinition, ContentDefinition } from "./mirror-types";

interface ControlPanelProps {
  state: ExplorerState;
  dispatch: React.Dispatch<ExplorerAction>;
  mirrors: MirrorDefinition[];
  transitions: TransitionDefinition[];
  contents: ContentDefinition[];
}

export function BottomControls({ state, dispatch, mirrors, transitions, contents }: ControlPanelProps) {
  return (
    <div className="shrink-0 border-t border-white/5 px-3 py-2.5 flex flex-col gap-2 bg-black/20 backdrop-blur-sm">
      {/* Row 1: Mirror thumbnails */}
      <div className="flex items-center gap-2">
        <span className="text-purple-300/50 text-[9px] uppercase tracking-wider shrink-0">Mirror</span>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none min-w-0">
          {mirrors.map((mirror) => (
            <button
              key={mirror.id}
              onClick={() => dispatch({ type: "SELECT_MIRROR", mirrorId: mirror.id })}
              className={`shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                state.selectedMirrorId === mirror.id
                  ? "bg-amber-600/20 border-amber-500/50 shadow-[0_0_8px_rgba(201,169,78,0.2)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              title={mirror.name}
            >
              <svg viewBox="0 0 40 60" className="w-5 h-5">
                <path
                  d={mirror.thumbnailPath}
                  fill={state.selectedMirrorId === mirror.id ? "rgba(201,169,78,0.3)" : "rgba(255,255,255,0.15)"}
                  stroke={state.selectedMirrorId === mirror.id ? "rgba(201,169,78,0.7)" : "rgba(255,255,255,0.3)"}
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Transition + Content dropdowns */}
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <select
            value={state.selectedTransitionId}
            onChange={(e) => dispatch({ type: "SELECT_TRANSITION", transitionId: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg text-white/90 text-xs px-2 py-2 focus:border-amber-500/50 focus:outline-none appearance-none"
          >
            {transitions.map((t) => (
              <option key={t.id} value={t.id} className="bg-gray-900">
                {t.name} ({t.library})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <select
            value={state.nextContentId}
            onChange={(e) => dispatch({ type: "SELECT_NEXT_CONTENT", contentId: e.target.value as ContentTypeId })}
            className="w-full bg-white/5 border border-white/10 rounded-lg text-white/90 text-xs px-2 py-2 focus:border-amber-500/50 focus:outline-none appearance-none"
          >
            {contents.map((c) => (
              <option key={c.id} value={c.id} className="bg-gray-900">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: Trigger + Auto + Random */}
      <div className="flex gap-2">
        <button
          onClick={() => dispatch({ type: "START_TRANSITION" })}
          disabled={state.isTransitioning || state.currentContentId === state.nextContentId}
          className="flex-1 bg-gradient-to-r from-amber-700/60 to-amber-600/60 hover:from-amber-700/80 hover:to-amber-600/80 disabled:opacity-30 disabled:cursor-not-allowed text-amber-100 text-xs font-medium py-2.5 rounded-lg border border-amber-500/30 transition-all min-h-[44px]"
        >
          {state.isTransitioning ? "Transitioning..." : "\u25B6 Trigger"}
        </button>
        <button
          onClick={() => dispatch({ type: "TOGGLE_AUTOPLAY" })}
          className={`px-3 py-2.5 rounded-lg border text-xs transition-all min-h-[44px] ${
            state.autoPlay
              ? "bg-amber-600/20 border-amber-500/40 text-amber-200"
              : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
          }`}
        >
          {state.autoPlay ? "\u25C9 Auto" : "\u25CB Auto"}
        </button>
        <button
          onClick={() => dispatch({ type: "RANDOMIZE" })}
          className="px-3 py-2.5 rounded-lg border text-xs transition-all min-h-[44px] bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
        >
          Random
        </button>
      </div>
    </div>
  );
}
