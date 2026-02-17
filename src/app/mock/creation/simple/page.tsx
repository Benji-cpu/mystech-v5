"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Hash,
  Palette,
  Crown,
  Droplets,
  Star,
  Leaf,
  Hexagon,
  Skull,
  Flower2,
  Sun,
} from "lucide-react";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MockCardFront } from "@/components/mock/mock-card";
import { MOCK_CARDS, type MockCard } from "@/components/mock/mock-data";
import { ART_STYLE_PRESETS, ART_STYLE_GRADIENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── TYPES ─────────────────────────────────────────────────────────────────────

type Phase = "theme" | "count" | "style" | "generating" | "complete";

interface State {
  phase: Phase;
  title: string;
  description: string;
  cardCount: number;
  isCustomCount: boolean;
  customCountInput: string;
  artStyleId: string;
  generatedCount: number;
  cards: MockCard[];
}

type Action =
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "SET_CARD_COUNT"; count: number }
  | { type: "SET_CUSTOM_COUNT_MODE"; enabled: boolean }
  | { type: "SET_CUSTOM_COUNT_INPUT"; input: string }
  | { type: "SET_ART_STYLE"; styleId: string }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "START_GENERATING"; cards: MockCard[] }
  | { type: "INCREMENT_GENERATED" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────

const INPUT_PHASES: Phase[] = ["theme", "count", "style"];
const CARD_COUNT_PRESETS = [
  { value: 3, label: "3", subtitle: "Trinity" },
  { value: 7, label: "7", subtitle: "Chakras" },
  { value: 12, label: "12", subtitle: "Zodiac" },
  { value: 22, label: "22", subtitle: "Major Arcana" },
];

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

const STYLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown, Droplets, Star, Leaf, Hexagon, Skull, Flower2, Sun,
};

const PHASE_SUBTITLES: Record<Phase, string> = {
  theme: "What story will your cards tell?",
  count: "How many cards feel right?",
  style: "Choose a visual language",
  generating: "Your deck is taking shape",
  complete: "",
};

// ─── REDUCER ───────────────────────────────────────────────────────────────────

const initialState: State = {
  phase: "theme",
  title: "",
  description: "",
  cardCount: 7,
  isCustomCount: false,
  customCountInput: "",
  artStyleId: "tarot-classic",
  generatedCount: 0,
  cards: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "SET_DESCRIPTION":
      return { ...state, description: action.description };
    case "SET_CARD_COUNT":
      return { ...state, cardCount: action.count, isCustomCount: false, customCountInput: "" };
    case "SET_CUSTOM_COUNT_MODE":
      return { ...state, isCustomCount: action.enabled };
    case "SET_CUSTOM_COUNT_INPUT": {
      const parsed = parseInt(action.input, 10);
      return {
        ...state,
        customCountInput: action.input,
        cardCount: !isNaN(parsed) && parsed >= 1 && parsed <= 30 ? parsed : state.cardCount,
      };
    }
    case "SET_ART_STYLE":
      return { ...state, artStyleId: action.styleId };
    case "NEXT_STEP": {
      const idx = INPUT_PHASES.indexOf(state.phase);
      if (idx < INPUT_PHASES.length - 1) {
        return { ...state, phase: INPUT_PHASES[idx + 1] };
      }
      return state;
    }
    case "PREV_STEP": {
      const idx = INPUT_PHASES.indexOf(state.phase);
      if (idx > 0) {
        return { ...state, phase: INPUT_PHASES[idx - 1] };
      }
      return state;
    }
    case "START_GENERATING":
      return { ...state, phase: "generating", generatedCount: 0, cards: action.cards };
    case "INCREMENT_GENERATED":
      return { ...state, generatedCount: state.generatedCount + 1 };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

// ─── MAIN CONTENT ──────────────────────────────────────────────────────────────

function SimpleCreationContent() {
  const { setMood, setMoodPreset } = useMockImmersive();
  const [state, dispatch] = useReducer(reducer, initialState);
  const customInputRef = useRef<HTMLInputElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const rippleRafRef = useRef<number>(0);

  const { phase } = state;
  const isInputPhase = INPUT_PHASES.includes(phase);
  const inputIndex = INPUT_PHASES.indexOf(phase);
  const displayedCards = state.cards.slice(0, state.generatedCount);

  // ─── VALIDATION ────────────────────────────────────────────────────────────

  const canAdvance =
    phase === "theme"
      ? state.title.trim().length > 0 && state.description.trim().length > 0
      : true;

  // ─── MOOD REACTIONS ────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase === "theme" || phase === "count") {
      setMoodPreset("default");
    } else if (phase === "style") {
      setMoodPreset("reading-setup");
    } else if (phase === "complete") {
      setMoodPreset("completion");
    }
  }, [phase, setMoodPreset]);

  useEffect(() => {
    if (phase === "generating" && state.generatedCount > 0) {
      const progress = state.generatedCount / state.cardCount;
      const hue = Math.floor(285 + progress * (50 - 285));
      setMood({ primaryHue: hue, sparkleColor: "#c9a94e" });
    }
  }, [phase, state.generatedCount, state.cardCount, setMood]);

  // ─── GENERATION INTERVAL ──────────────────────────────────────────────────

  useEffect(() => {
    if (phase === "generating" && state.cards.length > 0 && state.generatedCount < state.cardCount) {
      const interval = setInterval(() => {
        dispatch({ type: "INCREMENT_GENERATED" });
      }, 800);
      return () => clearInterval(interval);
    }
    if (phase === "generating" && state.generatedCount === state.cardCount) {
      const timeout = setTimeout(() => dispatch({ type: "COMPLETE" }), 1000);
      return () => clearTimeout(timeout);
    }
  }, [phase, state.generatedCount, state.cardCount, state.cards.length]);

  // ─── CUSTOM COUNT AUTO-FOCUS ──────────────────────────────────────────────

  useEffect(() => {
    if (state.isCustomCount && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [state.isCustomCount]);

  // ─── GLASS RIPPLE TRANSITION ──────────────────────────────────────────────

  const startRippleAndGenerate = useCallback(() => {
    // Build card pool
    const pool: MockCard[] = [];
    for (let i = 0; i < state.cardCount; i++) {
      pool.push(MOCK_CARDS[i % MOCK_CARDS.length]);
    }

    // Animate SVG displacement filter
    if (displacementRef.current) {
      let frame = 0;
      const totalFrames = 60;
      const animate = () => {
        frame++;
        const progress = frame / totalFrames;
        // Parabola: 0 → 40 → 0
        const scale = 40 * Math.sin(progress * Math.PI);
        displacementRef.current?.setAttribute("scale", String(scale));
        if (frame < totalFrames) {
          rippleRafRef.current = requestAnimationFrame(animate);
        } else {
          displacementRef.current?.setAttribute("scale", "0");
        }
      };
      rippleRafRef.current = requestAnimationFrame(animate);
    }

    // Dispatch after small delay so ripple is visible
    setTimeout(() => {
      dispatch({ type: "START_GENERATING", cards: pool });
    }, 500);
  }, [state.cardCount]);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rippleRafRef.current) cancelAnimationFrame(rippleRafRef.current);
    };
  }, []);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (phase === "style") {
      startRippleAndGenerate();
    } else {
      dispatch({ type: "NEXT_STEP" });
    }
  };

  // ─── STEP ICON ────────────────────────────────────────────────────────────

  const StepIcon = phase === "theme" ? Sparkles : phase === "count" ? Hash : Palette;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Hidden SVG filter for glass ripple */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-ripple">
            <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="3" seed="2" result="noise" />
            <feDisplacementMap ref={displacementRef} in="SourceGraphic" in2="noise" scale="0" />
          </filter>
        </defs>
      </svg>

      {/* ─── ZONE 1: HEADER ─────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 pt-3 sm:pt-6 pb-1 sm:pb-2">
        <Link
          href="/mock/creation"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors mb-3 sm:mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="text-center">
          {phase === "complete" ? (
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a94e] to-[#ffd700]"
              style={{ textShadow: "0 0 30px rgba(201,169,78,0.5)" }}
            >
              Your deck is ready
            </motion.h1>
          ) : phase === "generating" ? (
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Forging card {state.generatedCount} of {state.cardCount}...
            </h1>
          ) : (
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Create Your Deck
            </h1>
          )}

          {/* Subtitle — crossfade per phase */}
          <div className="h-6 sm:h-7 relative mt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={phase === "complete" ? "complete-sub" : phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="text-sm sm:text-base text-white/60 absolute inset-x-0"
              >
                {phase === "complete"
                  ? `${state.title || "My Oracle Deck"} · ${state.cardCount} cards`
                  : PHASE_SUBTITLES[phase]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── ZONE 2: CENTRAL ────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col px-3 sm:px-6">
        {/* Sub-region A: Input Glass Card — always mounted, collapses during generating/complete */}
        <motion.div
          layout
          animate={{
            flex: isInputPhase ? 1 : 0,
            opacity: isInputPhase ? 1 : 0,
            scale: isInputPhase ? 1 : 0.95,
          }}
          transition={SPRING}
          className="flex items-center justify-center overflow-hidden min-h-0"
          style={
            phase === "generating" || phase === "complete"
              ? { filter: "url(#glass-ripple)" }
              : undefined
          }
        >
          <div className="w-full max-w-lg">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-purple-900/20 overflow-hidden relative">
              {/* Shared step icon */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                <motion.div
                  layoutId="step-icon"
                  transition={SPRING}
                  className="inline-flex items-center gap-2 text-[#c9a94e] mb-1"
                >
                  <StepIcon className="w-4 h-4" />
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phase}
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.2 }}
                      className="text-xs font-medium tracking-wider uppercase"
                    >
                      {phase === "theme" ? "Theme" : phase === "count" ? "Card Count" : "Art Style"}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Content area — all sections stacked, absolute positioned */}
              <div className="relative" style={{ minHeight: 280 }}>
                {/* Theme section */}
                <motion.div
                  className="absolute inset-0 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-center"
                  animate={{
                    opacity: phase === "theme" ? 1 : 0,
                    scale: phase === "theme" ? 1 : 0.96,
                    filter: phase === "theme" ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={SPRING}
                  style={{ pointerEvents: phase === "theme" ? "auto" : "none" }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Deck Name
                      </label>
                      <input
                        type="text"
                        value={state.title}
                        onChange={(e) => dispatch({ type: "SET_TITLE", title: e.target.value })}
                        placeholder="Grandmother's Garden"
                        maxLength={100}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a94e]/50 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Description
                      </label>
                      <textarea
                        value={state.description}
                        onChange={(e) => dispatch({ type: "SET_DESCRIPTION", description: e.target.value })}
                        placeholder={"A deck inspired by the wisdom\nof plants, seasons, and the\nquiet magic of growing things"}
                        maxLength={1000}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#c9a94e]/50 transition-shadow resize-none"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Count section */}
                <motion.div
                  className="absolute inset-0 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-center"
                  animate={{
                    opacity: phase === "count" ? 1 : 0,
                    scale: phase === "count" ? 1 : 0.96,
                    filter: phase === "count" ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={SPRING}
                  style={{ pointerEvents: phase === "count" ? "auto" : "none" }}
                >
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {CARD_COUNT_PRESETS.map((preset) => (
                        <motion.button
                          key={preset.value}
                          onClick={() => dispatch({ type: "SET_CARD_COUNT", count: preset.value })}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "px-3 py-3 sm:py-4 rounded-xl text-center transition-all",
                            state.cardCount === preset.value && !state.isCustomCount
                              ? "bg-[#c9a94e]/20 border-2 border-[#c9a94e] text-[#c9a94e] shadow-[0_0_20px_rgba(201,169,78,0.3)]"
                              : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20"
                          )}
                        >
                          <span className="text-lg sm:text-xl font-bold block">{preset.label}</span>
                          <span className="text-xs text-white/40">{preset.subtitle}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Custom toggle */}
                    <div className="flex items-center justify-center">
                      {!state.isCustomCount ? (
                        <button
                          onClick={() => dispatch({ type: "SET_CUSTOM_COUNT_MODE", enabled: true })}
                          className="text-sm text-white/50 hover:text-[#c9a94e] transition-colors"
                        >
                          or enter a custom number
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={SPRING}
                          className="flex items-center gap-3"
                        >
                          <input
                            ref={customInputRef}
                            type="number"
                            min={1}
                            max={30}
                            value={state.customCountInput}
                            onChange={(e) => dispatch({ type: "SET_CUSTOM_COUNT_INPUT", input: e.target.value })}
                            placeholder="1–30"
                            className="w-20 bg-white/5 border border-[#c9a94e]/50 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-[#c9a94e]/50"
                          />
                          <span className="text-sm text-white/40">cards</span>
                          <button
                            onClick={() => dispatch({ type: "SET_CUSTOM_COUNT_MODE", enabled: false })}
                            className="text-xs text-white/40 hover:text-white/60 transition-colors"
                          >
                            cancel
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Style section */}
                <motion.div
                  className="absolute inset-0 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-center"
                  animate={{
                    opacity: phase === "style" ? 1 : 0,
                    scale: phase === "style" ? 1 : 0.96,
                    filter: phase === "style" ? "blur(0px)" : "blur(8px)",
                  }}
                  transition={SPRING}
                  style={{ pointerEvents: phase === "style" ? "auto" : "none" }}
                >
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {ART_STYLE_PRESETS.map((style) => {
                      const gradientData = ART_STYLE_GRADIENTS[style.id];
                      const IconComponent = gradientData ? STYLE_ICONS[gradientData.icon] : Star;
                      const isSelected = state.artStyleId === style.id;

                      return (
                        <motion.button
                          key={style.id}
                          onClick={() => dispatch({ type: "SET_ART_STYLE", styleId: style.id })}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 rounded-xl p-2 sm:p-3 transition-all",
                            isSelected
                              ? "ring-2 ring-[#c9a94e] ring-offset-2 ring-offset-black/50 shadow-[0_0_20px_rgba(201,169,78,0.3)]"
                              : "ring-1 ring-white/10 hover:ring-white/30"
                          )}
                        >
                          <div
                            className={cn(
                              "w-full aspect-square rounded-lg bg-gradient-to-br flex items-center justify-center",
                              gradientData?.gradient
                            )}
                          >
                            {IconComponent && (
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
                            )}
                          </div>
                          <span className="text-[10px] sm:text-xs text-white/60 leading-tight text-center line-clamp-1">
                            {style.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sub-region B: Card Grid — always mounted, grows during generating/complete */}
        <motion.div
          layout
          animate={{
            flex: !isInputPhase ? 1 : 0,
            opacity: !isInputPhase ? 1 : 0,
          }}
          transition={SPRING}
          className="overflow-hidden min-h-0 flex flex-col"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 pb-4">
              <AnimatePresence>
                {displayedCards.map((card, index) => (
                  <motion.div
                    key={`${card.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: index * 0.05,
                    }}
                    whileHover={phase === "complete" ? { scale: 1.05, y: -10 } : {}}
                    className={cn(
                      "flex justify-center",
                      phase === "complete" && "cursor-pointer"
                    )}
                  >
                    <MockCardFront card={card} size="sm" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── ZONE 3: FOOTER / NAV ──────────────────────────────────────────── */}
      <motion.div
        layout
        animate={{
          opacity: phase === "generating" ? 0 : 1,
          height: phase === "generating" ? 0 : "auto",
        }}
        transition={SPRING}
        className="shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 overflow-hidden"
      >
        {/* Input phase navigation */}
        {isInputPhase && (
          <div className="max-w-lg mx-auto">
            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {INPUT_PHASES.map((p, i) => (
                <motion.div
                  key={p}
                  animate={{
                    scale: i === inputIndex ? 1.3 : 1,
                    backgroundColor:
                      i < inputIndex
                        ? "#c9a94e"
                        : i === inputIndex
                          ? "#c9a94e"
                          : "rgba(255,255,255,0.2)",
                  }}
                  transition={SPRING}
                  className="w-2 h-2 rounded-full"
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              {/* Back button — hidden on first step */}
              <motion.div
                animate={{
                  width: inputIndex > 0 ? "auto" : 0,
                  opacity: inputIndex > 0 ? 1 : 0,
                }}
                transition={SPRING}
                className="overflow-hidden"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => dispatch({ type: "PREV_STEP" })}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-white/60 bg-white/5 border border-white/10 hover:text-white/90 hover:border-white/20 transition-colors whitespace-nowrap"
                >
                  Back
                </motion.button>
              </motion.div>

              {/* Next / Create button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!canAdvance}
                className={cn(
                  "flex-1 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all",
                  canAdvance
                    ? "bg-gradient-to-r from-[#c9a94e] to-[#d4b44e] text-black shadow-[0_0_30px_rgba(201,169,78,0.3)] hover:shadow-[0_0_40px_rgba(201,169,78,0.5)]"
                    : "bg-white/5 text-white/30 cursor-not-allowed"
                )}
              >
                {phase === "style" ? "Bring It to Life" : "Continue"}
              </motion.button>
            </div>
          </div>
        )}

        {/* Complete phase actions */}
        {phase === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING, delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-md bg-gradient-to-r from-[#c9a94e] to-[#d4b44e] text-black text-sm sm:text-base font-semibold rounded-xl px-6 py-2.5 sm:py-3 shadow-[0_0_30px_rgba(201,169,78,0.3)] hover:shadow-[0_0_40px_rgba(201,169,78,0.5)] transition-all"
            >
              View Deck
            </motion.button>
            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="text-white/60 hover:text-white/90 transition-colors text-xs sm:text-sm"
            >
              Create Another
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function SimpleCreationPage() {
  return (
    <MockImmersiveShell>
      <SimpleCreationContent />
    </MockImmersiveShell>
  );
}
