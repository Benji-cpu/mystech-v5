"use client";

import { useReducer } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import type { ViewId, ViewParams, MoodId, CreatePhase } from "../../_shared/types";
import { MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import { DREAM, SPRING } from "../dream-theme";

interface NavProps {
  navigate: (view: ViewId, params?: ViewParams) => void;
  goBack: () => void;
  setMood: (mood: MoodId) => void;
  setHideNav: (hidden: boolean) => void;
  currentView: ViewId;
  viewParams: ViewParams;
}

interface CreateState {
  phase: CreatePhase;
  theme: string;
  description: string;
  cardCount: number;
  styleId: string;
}

type CreateAction =
  | { type: "SET_THEME"; value: string }
  | { type: "SET_DESCRIPTION"; value: string }
  | { type: "SET_CARD_COUNT"; value: number }
  | { type: "SET_STYLE"; value: string }
  | { type: "NEXT_PHASE" }
  | { type: "PREV_PHASE" };

const createInitial: CreateState = {
  phase: "input",
  theme: "",
  description: "",
  cardCount: 8,
  styleId: "",
};

function createReducer(state: CreateState, action: CreateAction): CreateState {
  switch (action.type) {
    case "SET_THEME": return { ...state, theme: action.value };
    case "SET_DESCRIPTION": return { ...state, description: action.value };
    case "SET_CARD_COUNT": return { ...state, cardCount: action.value };
    case "SET_STYLE": return { ...state, styleId: action.value };
    case "NEXT_PHASE":
      if (state.phase === "input") return { ...state, phase: "style" };
      return state;
    case "PREV_PHASE":
      if (state.phase === "style") return { ...state, phase: "input" };
      return state;
    default: return state;
  }
}

const CARD_COUNTS = [6, 8, 10, 12];

export function CreateDeckView({ navigate }: NavProps) {
  const [state, dispatch] = useReducer(createReducer, createInitial);

  const handleGenerate = () => {
    navigate("generation");
  };

  return (
    <div className="h-full overflow-y-auto pb-24 sm:pl-[72px]">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className={`text-2xl text-[#e8e6f0] mb-1 ${DREAM.heading} font-serif`}
        >
          Create a Deck
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-[#8b87a0] mb-6"
        >
          {state.phase === "input" ? "Describe your dream vision" : "Choose an art style"}
        </motion.p>

        {/* Phase indicator */}
        <div className="flex items-center gap-2 mb-6">
          {["input", "style"].map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                state.phase === p
                  ? "bg-[#d4a843] text-[#0a0b1e]"
                  : i === 0 && state.phase === "style"
                    ? "bg-[#d4a843]/20 text-[#d4a843]"
                    : "bg-[#2a2b5a]/40 text-[#8b87a0]"
              }`}>
                {i === 0 && state.phase === "style" ? <Check size={12} /> : i + 1}
              </div>
              {i === 0 && <div className="w-8 h-px bg-[#2a2b5a]/60" />}
            </div>
          ))}
        </div>

        {/* ─── Input Phase ─── */}
        <motion.div
          animate={{
            height: state.phase === "input" ? "auto" : 0,
            opacity: state.phase === "input" ? 1 : 0,
          }}
          transition={SPRING}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            <div>
              <label className={`block text-xs text-[#c4ceff] mb-2 ${DREAM.label}`}>Theme</label>
              <input
                type="text"
                value={state.theme}
                onChange={(e) => dispatch({ type: "SET_THEME", value: e.target.value })}
                placeholder="e.g., Ocean depths, Inner child, Career crossroads..."
                className={`w-full ${DREAM.glass} rounded-xl px-4 py-3 text-sm text-[#e8e6f0] placeholder:text-[#8b87a0]/40 outline-none focus:border-[#d4a843]/40 transition-colors`}
              />
            </div>

            <div>
              <label className={`block text-xs text-[#c4ceff] mb-2 ${DREAM.label}`}>Description</label>
              <textarea
                value={state.description}
                onChange={(e) => dispatch({ type: "SET_DESCRIPTION", value: e.target.value })}
                placeholder="Describe the feeling, story, or question behind this deck..."
                rows={3}
                className={`w-full ${DREAM.glass} rounded-xl px-4 py-3 text-sm text-[#e8e6f0] placeholder:text-[#8b87a0]/40 outline-none focus:border-[#d4a843]/40 transition-colors resize-none`}
              />
            </div>

            <div>
              <label className={`block text-xs text-[#c4ceff] mb-2 ${DREAM.label}`}>Cards</label>
              <div className="flex gap-2">
                {CARD_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => dispatch({ type: "SET_CARD_COUNT", value: count })}
                    className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                      state.cardCount === count
                        ? "bg-[#d4a843] text-[#0a0b1e] font-semibold"
                        : `${DREAM.glass} text-[#8b87a0] ${DREAM.glassHover}`
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={() => dispatch({ type: "NEXT_PHASE" })}
              disabled={!state.theme.trim()}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                state.theme.trim()
                  ? `${DREAM.goldGradient} text-[#0a0b1e] ${DREAM.goldGlow}`
                  : "bg-[#2a2b5a]/40 text-[#8b87a0]/40 cursor-not-allowed"
              }`}
              whileHover={state.theme.trim() ? { scale: 1.02 } : undefined}
              whileTap={state.theme.trim() ? { scale: 0.98 } : undefined}
            >
              Choose Style <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* ─── Style Phase ─── */}
        <motion.div
          animate={{
            height: state.phase === "style" ? "auto" : 0,
            opacity: state.phase === "style" ? 1 : 0,
          }}
          transition={SPRING}
          className="overflow-hidden"
        >
          <div className="space-y-4">
            <button
              onClick={() => dispatch({ type: "PREV_PHASE" })}
              className="flex items-center gap-1 text-xs text-[#8b87a0] hover:text-[#c4ceff] transition-colors mb-2"
            >
              <ArrowLeft size={12} /> Back to details
            </button>

            <div className="grid grid-cols-3 gap-2">
              {MOCK_ART_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => dispatch({ type: "SET_STYLE", value: style.id })}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    state.styleId === style.id
                      ? "border-[#d4a843] shadow-[0_0_12px_rgba(212,168,67,0.3)]"
                      : "border-transparent"
                  }`}
                >
                  <div className={`aspect-square bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                    <span className="text-2xl opacity-60">{style.icon}</span>
                  </div>
                  <div className="p-2 bg-[#121330]/60">
                    <p className="text-[10px] text-[#e8e6f0] truncate text-center">{style.name}</p>
                  </div>
                </button>
              ))}
              {/* Custom slot */}
              <button className="rounded-xl border-2 border-dashed border-[#2a2b5a]/60 flex flex-col items-center justify-center gap-1 aspect-square hover:border-[#d4a843]/30 transition-colors">
                <Sparkles size={16} className="text-[#8b87a0]" />
                <span className="text-[10px] text-[#8b87a0]">Custom</span>
              </button>
            </div>

            <motion.button
              onClick={handleGenerate}
              disabled={!state.styleId}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                state.styleId
                  ? `${DREAM.goldGradient} text-[#0a0b1e] ${DREAM.goldGlow}`
                  : "bg-[#2a2b5a]/40 text-[#8b87a0]/40 cursor-not-allowed"
              }`}
              whileHover={state.styleId ? { scale: 1.02 } : undefined}
              whileTap={state.styleId ? { scale: 0.98 } : undefined}
            >
              <Sparkles size={16} /> Generate Deck
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
