"use client";

import {
  useReducer,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import {
  MOCK_CARDS,
  MOCK_CONVERSATION,
  type MockCard,
} from "@/components/mock/mock-data";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Moment = "dashboard" | "reading" | "journey" | "celebration";
type LyraCanvasState = "dormant" | "attentive" | "speaking";

interface Anchor {
  id: string;
  name: string;
  theme: string;
}

interface IntegratedState {
  currentMoment: Moment;
  // Dashboard
  dashGreetingComplete: boolean;
  // Reading
  readingPhase: "intro" | "card_narration" | "interpretation";
  revealedCards: number;
  narrationIndex: number;
  // Journey
  journeyVisibleMessages: number;
  journeyAnchors: Anchor[];
  // Celebration
  celebrationEntered: boolean;
}

type Action =
  | { type: "NEXT_MOMENT" }
  | { type: "GO_TO_MOMENT"; moment: Moment }
  | { type: "GREETING_COMPLETE" }
  | { type: "REVEAL_NEXT_CARD" }
  | { type: "SET_NARRATION_INDEX"; index: number }
  | { type: "SET_READING_PHASE"; phase: IntegratedState["readingPhase"] }
  | { type: "ADVANCE_JOURNEY" }
  | { type: "ADD_ANCHOR"; anchor: Anchor }
  | { type: "CELEBRATION_ENTERED" };

const MOMENTS: Moment[] = ["dashboard", "reading", "journey", "celebration"];

const MOMENT_LABELS: Record<Moment, string> = {
  dashboard: "Dashboard",
  reading: "Reading",
  journey: "Journey",
  celebration: "Celebration",
};

function reducer(state: IntegratedState, action: Action): IntegratedState {
  switch (action.type) {
    case "NEXT_MOMENT": {
      const idx = MOMENTS.indexOf(state.currentMoment);
      const next = MOMENTS[(idx + 1) % MOMENTS.length];
      return { ...getInitialState(), currentMoment: next };
    }
    case "GO_TO_MOMENT":
      return { ...getInitialState(), currentMoment: action.moment };
    case "GREETING_COMPLETE":
      return { ...state, dashGreetingComplete: true };
    case "REVEAL_NEXT_CARD":
      return { ...state, revealedCards: state.revealedCards + 1 };
    case "SET_NARRATION_INDEX":
      return { ...state, narrationIndex: action.index };
    case "SET_READING_PHASE":
      return { ...state, readingPhase: action.phase };
    case "ADVANCE_JOURNEY":
      return {
        ...state,
        journeyVisibleMessages: Math.min(
          state.journeyVisibleMessages + 1,
          6
        ),
      };
    case "ADD_ANCHOR":
      return {
        ...state,
        journeyAnchors: [...state.journeyAnchors, action.anchor],
      };
    case "CELEBRATION_ENTERED":
      return { ...state, celebrationEntered: true };
    default:
      return state;
  }
}

function getInitialState(): IntegratedState {
  return {
    currentMoment: "dashboard",
    dashGreetingComplete: false,
    readingPhase: "intro",
    revealedCards: 0,
    narrationIndex: 0,
    journeyVisibleMessages: 0,
    journeyAnchors: [],
    celebrationEntered: false,
  };
}

// ─── Pseudo-noise for organic breathing ──────────────────────────────────────

function pseudoNoise(t: number, seed: number): number {
  return (
    Math.sin(t * 1.0 + seed) * 0.5 +
    Math.sin(t * 2.3 + seed * 1.7) * 0.25 +
    Math.sin(t * 0.7 + seed * 3.1) * 0.25
  );
}

// ─── Anchor chip colors ───────────────────────────────────────────────────────

const ANCHOR_COLORS: Record<
  string,
  { bg: string; border: string; dot: string; text: string }
> = {
  courage: {
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.25)",
    dot: "#f97316",
    text: "rgba(251,146,60,0.9)",
  },
  wisdom: {
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.25)",
    dot: "#06b6d4",
    text: "rgba(34,211,238,0.9)",
  },
  healing: {
    bg: "rgba(129,140,248,0.08)",
    border: "rgba(129,140,248,0.25)",
    dot: "#818cf8",
    text: "rgba(165,180,252,0.9)",
  },
  resilience: {
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.25)",
    dot: "#34d399",
    text: "rgba(110,231,183,0.9)",
  },
  creativity: {
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.25)",
    dot: "#ec4899",
    text: "rgba(244,114,182,0.9)",
  },
  transformation: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    dot: "#f59e0b",
    text: "rgba(252,211,77,0.9)",
  },
  connection: {
    bg: "rgba(78,205,196,0.08)",
    border: "rgba(78,205,196,0.25)",
    dot: "#4ecdc4",
    text: "rgba(94,234,212,0.9)",
  },
  growth: {
    bg: "rgba(150,206,180,0.08)",
    border: "rgba(150,206,180,0.25)",
    dot: "#96ceb4",
    text: "rgba(167,243,208,0.9)",
  },
};

const DEFAULT_CHIP_COLOR = {
  bg: "rgba(201,169,78,0.06)",
  border: "rgba(201,169,78,0.2)",
  dot: "#c9a94e",
  text: "rgba(201,169,78,0.9)",
};

// ─── Lyra Canvas sigil ────────────────────────────────────────────────────────

const LYRA_STARS_DATA = [
  { x: 0.5, y: 0.15, radius: 1 },
  { x: 0.38, y: 0.42, radius: 0.8 },
  { x: 0.62, y: 0.42, radius: 0.8 },
  { x: 0.32, y: 0.7, radius: 0.65 },
  { x: 0.68, y: 0.7, radius: 0.65 },
];

const LYRA_LINES_DATA: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
  [2, 4],
];

interface LyraCanvasProps {
  state: LyraCanvasState;
  size?: number;
  className?: string;
}

const LYRA_STAR_SEEDS = [0.3, 3.0, 5.7, 8.4, 11.1];

function LyraCanvas({ state, size = 80, className }: LyraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      try {
      timeRef.current += 0.016;
      const t = timeRef.current;
      ctx.clearRect(0, 0, size, size);

      const breathSpeed =
        state === "dormant" ? 0.3 : state === "attentive" ? 0.6 : 0.9;
      const breathAmp =
        state === "dormant" ? 1.5 : state === "attentive" ? 2.5 : 4;
      const baseOpacity =
        state === "dormant" ? 0.4 : state === "attentive" ? 0.8 : 1.0;

      const animated = LYRA_STARS_DATA.map((star, i) => {
        const noise = pseudoNoise(t * breathSpeed, LYRA_STAR_SEEDS[i]);
        const ox = noise * breathAmp * 0.3;
        const oy =
          pseudoNoise(t * breathSpeed + 1.5, LYRA_STAR_SEEDS[i]) * breathAmp;
        return {
          x: star.x * size + ox,
          y: star.y * size + oy,
          radius: star.radius * (size / 25),
          opacity: baseOpacity,
        };
      });

      // Lines with string vibration
      LYRA_LINES_DATA.forEach(([fromIdx, toIdx], lineIdx) => {
        const from = animated[fromIdx];
        const to = animated[toIdx];
        if (!from || !to) return;

        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const px = -dy / len;
        const py = dx / len;

        const vibAmp =
          state === "speaking" ? 2.5 : state === "attentive" ? 1.2 : 0.4;
        const vibSpeed = state === "speaking" ? 3 : 1.5;
        const vib = Math.sin(t * vibSpeed + lineIdx * 1.3) * vibAmp;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(mx + px * vib, my + py * vib, to.x, to.y);
        ctx.strokeStyle = `rgba(201,169,78,${baseOpacity * 0.4})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Stars with glow
      animated.forEach((star, i) => {
        const pulse =
          state === "speaking"
            ? 1 + Math.sin(t * 3 + i * 0.5) * 0.3
            : 1;
        const r = star.radius * pulse;

        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          r * 4
        );
        gradient.addColorStop(
          0,
          `rgba(201,169,78,${star.opacity * 0.35})`
        );
        gradient.addColorStop(1, "rgba(201,169,78,0)");
        ctx.beginPath();
        ctx.arc(star.x, star.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,78,${star.opacity})`;
        ctx.fill();

        if (i === 0) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,240,${star.opacity * 0.8})`;
          ctx.fill();
        }
      });

      } catch {
        // Canvas draw failed — stop animation gracefully
        return;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={cn("pointer-events-none", className)}
    />
  );
}

// ─── Lyra Typewriter ─────────────────────────────────────────────────────────

interface LyraTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

function LyraTypewriter({
  text,
  speed = 20,
  onComplete,
  className,
}: LyraTypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((c) => !c);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplayText("");
    setIsTyping(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayText(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        setTimeout(() => {
          onCompleteRef.current?.();
        }, 400);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-amber-200/90 italic font-serif",
        className
      )}
    >
      {displayText}
      <span
        className={cn(
          "inline-block w-[2px] h-[1em] ml-0.5 bg-amber-300/80 align-middle",
          showCursor && isTyping ? "opacity-100" : "opacity-0"
        )}
      />
    </p>
  );
}

// ─── Moment Layer ────────────────────────────────────────────────────────────

function MomentLayer({
  isActive,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto px-4 sm:px-6"
      animate={{
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.97,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        pointerEvents: isActive ? "auto" : "none",
        zIndex: isActive ? 10 : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Moment 1: Dashboard Greeting ────────────────────────────────────────────

interface MomentProps {
  state: IntegratedState;
  dispatch: React.Dispatch<Action>;
}

function DashboardMoment({ state, dispatch }: MomentProps) {
  const lyraState: LyraCanvasState = state.dashGreetingComplete
    ? "attentive"
    : "speaking";

  const statsVariants = {
    initial: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const statItem = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 28 },
    },
  };

  return (
    <div className="py-4 pb-6 flex flex-col gap-5">
      {/* Context label */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-white/30">
          Dashboard — Lyra greeting touchpoint
        </span>
      </div>

      {/* Mock stats row */}
      <motion.div
        className="grid grid-cols-3 gap-2.5"
        variants={statsVariants}
        initial="initial"
        animate="animate"
      >
        {[
          { label: "Decks", value: "4" },
          { label: "Readings", value: "12" },
          { label: "Stars", value: "43" },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            variants={statItem}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center"
          >
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[10px] text-white/40 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Mock recent activity row */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">
          Recent Activity
        </p>
        {["The Dreamer Deck", "Three-Card Reading", "The Alchemist Deck"].map(
          (item) => (
            <div
              key={item}
              className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a94e]/50" />
              <p className="text-xs text-white/50">{item}</p>
            </div>
          )
        )}
      </div>

      {/* Lyra section */}
      <motion.div
        className="flex items-start gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.3 }}
      >
        {/* Sigil */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <LyraCanvas state={lyraState} size={64} />
          <span className="text-[9px] text-amber-300/50 tracking-wider">
            LYRA
          </span>
        </div>

        {/* Speech bubble */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: 0.5,
          }}
          className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tl-sm p-4"
        >
          <LyraTypewriter
            text="Good evening, Seeker. The stars have been restless since your last visit. Shall we see what they have to say?"
            speed={18}
            onComplete={() => dispatch({ type: "GREETING_COMPLETE" })}
          />
        </motion.div>
      </motion.div>

      {/* Quick action buttons after greeting */}
      <AnimatePresence>
        {state.dashGreetingComplete && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {["Start Reading", "Browse Decks"].map((label, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: i * 0.08,
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  i === 0
                    ? "bg-[#c9a94e]/15 border border-[#c9a94e]/30 text-[#c9a94e]"
                    : "bg-white/5 border border-white/10 text-white/60"
                )}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyra note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 text-[10px] text-white/25"
      >
        <MessageCircle className="w-3 h-3" />
        <span>Lyra appears as a persistent companion on every dashboard visit</span>
      </motion.div>
    </div>
  );
}

// ─── Moment 2: Reading Flow Narration ────────────────────────────────────────

const READING_CARDS = MOCK_CARDS.slice(0, 3);

const CARD_NARRATIONS = [
  "The Dreamer in your past speaks of seeds planted long ago — imagination waiting for its season.",
  "The Alchemist at the center confirms your transformation is already underway. Lead becomes gold.",
  "The Wanderer looks forward. The journey ahead holds more discovery than you know.",
];

const READING_INTRO =
  "Three cards drawn from your story. Let us see what the stars reveal.";
const READING_SYNTHESIS =
  "Together, they weave a tale of creative rebirth — past seeds, present alchemy, future wandering.";

interface CardFlipProps {
  card: MockCard;
  isRevealed: boolean;
  delay?: number;
}

function CardFlip({ card, isRevealed, delay = 0 }: CardFlipProps) {
  return (
    <div
      className="relative"
      style={{ perspective: "800px", width: 90, height: 135 }}
    >
      {/* Back face */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotateY: isRevealed ? -180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 28,
          delay: isRevealed ? delay : 0,
        }}
        style={{ backfaceVisibility: "hidden" }}
      >
        <MockCardBack width={90} height={135} />
      </motion.div>
      {/* Front face */}
      <motion.div
        className="absolute inset-0"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: isRevealed ? 0 : 180 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 28,
          delay: isRevealed ? delay : 0,
        }}
        style={{ backfaceVisibility: "hidden" }}
      >
        <MockCardFront card={card} width={90} height={135} />
      </motion.div>
    </div>
  );
}

function ReadingMoment({ state, dispatch }: MomentProps) {
  const { revealedCards, narrationIndex, readingPhase } = state;
  const [currentNarration, setCurrentNarration] = useState<string | null>(null);
  const [narrationDone, setNarrationDone] = useState(false);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lyraState: LyraCanvasState =
    currentNarration !== null && !narrationDone ? "speaking" : "attentive";

  // Sequence logic
  useEffect(() => {
    if (readingPhase === "intro") {
      setCurrentNarration(READING_INTRO);
      setNarrationDone(false);
    }
  }, [readingPhase]);

  const handleNarrationComplete = useCallback(() => {
    setNarrationDone(true);
    if (readingPhase === "intro") {
      advanceRef.current = setTimeout(() => {
        dispatch({ type: "SET_READING_PHASE", phase: "card_narration" });
        dispatch({ type: "REVEAL_NEXT_CARD" });
        setCurrentNarration(CARD_NARRATIONS[0]);
        setNarrationDone(false);
        dispatch({ type: "SET_NARRATION_INDEX", index: 0 });
      }, 500);
    } else if (readingPhase === "card_narration") {
      const nextCard = narrationIndex + 1;
      if (nextCard < READING_CARDS.length) {
        advanceRef.current = setTimeout(() => {
          dispatch({ type: "REVEAL_NEXT_CARD" });
          setCurrentNarration(CARD_NARRATIONS[nextCard]);
          setNarrationDone(false);
          dispatch({ type: "SET_NARRATION_INDEX", index: nextCard });
        }, 500);
      } else {
        advanceRef.current = setTimeout(() => {
          dispatch({ type: "SET_READING_PHASE", phase: "interpretation" });
          setCurrentNarration(READING_SYNTHESIS);
          setNarrationDone(false);
        }, 500);
      }
    }
  }, [readingPhase, narrationIndex, dispatch]);

  useEffect(() => {
    return () => {
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  return (
    <div className="py-4 pb-6 flex flex-col gap-5">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-white/30">
          Reading Flow — Lyra narrates the draw
        </span>
      </div>

      {/* Header with sigil */}
      <div className="flex items-center gap-3">
        <LyraCanvas state={lyraState} size={48} />
        <div>
          <p className="text-sm font-medium text-white/80">
            Three-Card Reading
          </p>
          <p className="text-[11px] text-white/35">
            Past · Present · Future
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex justify-center gap-4">
        {READING_CARDS.map((card, i) => (
          <div key={card.id} className="flex flex-col items-center gap-2">
            <CardFlip
              card={card}
              isRevealed={revealedCards > i}
              delay={0}
            />
            <motion.p
              className="text-[10px] text-white/30"
              animate={{ opacity: revealedCards > i ? 0.6 : 0.25 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {["Past", "Present", "Future"][i]}
            </motion.p>
          </div>
        ))}
      </div>

      {/* Narration bubble */}
      <motion.div
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {currentNarration && (
            <motion.div
              key={currentNarration}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <LyraTypewriter
                text={currentNarration}
                speed={16}
                onComplete={handleNarrationComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Completion CTA */}
      <AnimatePresence>
        {readingPhase === "interpretation" && narrationDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-[#c9a94e]/8 border border-[#c9a94e]/20 rounded-xl p-4 text-center"
          >
            <p className="text-xs text-amber-200/70 italic font-serif">
              The reading is complete. Would you like to save this interpretation?
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 px-4 py-2 rounded-lg bg-[#c9a94e]/15 border border-[#c9a94e]/30 text-[#c9a94e] text-sm"
            >
              Save Reading
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 text-[10px] text-white/25">
        <MessageCircle className="w-3 h-3" />
        <span>Lyra narrates each card reveal with typewriter speech</span>
      </div>
    </div>
  );
}

// ─── Moment 3: Journey Chat with Anchor Strip ─────────────────────────────────

const JOURNEY_MESSAGES = MOCK_CONVERSATION.slice(0, 6);

// Map message index to anchors that should appear
const ANCHOR_MAP: Record<number, Anchor> = {
  2: { id: "a1", name: "Courage & Fear", theme: "courage" },
  4: { id: "a2", name: "Transformation", theme: "transformation" },
  5: { id: "a3", name: "Connection", theme: "connection" },
};

interface AnchorStripInlineProps {
  anchors: Anchor[];
  maxSlots?: number;
}

function AnchorStripInline({ anchors, maxSlots = 6 }: AnchorStripInlineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && anchors.length > 0) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [anchors.length]);

  const ghostSlots = Math.max(0, maxSlots - anchors.length);
  const readinessPercent = (anchors.length / maxSlots) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[9px] uppercase tracking-widest text-white/25 shrink-0">
          Anchors
        </span>
        <div className="flex-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-amber-500/50"
            initial={{ width: 0 }}
            animate={{ width: `${readinessPercent}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          />
        </div>
        <span className="text-[9px] text-amber-300/40 tabular-nums shrink-0">
          {anchors.length}/{maxSlots}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1 px-1"
      >
        <AnimatePresence mode="popLayout">
          {anchors.map((anchor) => {
            const colors = ANCHOR_COLORS[anchor.theme] ?? DEFAULT_CHIP_COLOR;
            return (
              <motion.div
                key={anchor.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                }}
                className="snap-start shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full"
                style={{
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: colors.border,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors.dot }}
                />
                <span
                  className="text-xs whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  {anchor.name}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {Array.from({ length: ghostSlots }).map((_, i) => (
          <div
            key={`ghost-${i}`}
            className="snap-start shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full border border-dashed border-white/8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/5 shrink-0" />
            <span className="text-xs text-white/10 whitespace-nowrap">
              ...
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function JourneyMoment({ state, dispatch }: MomentProps) {
  const { journeyVisibleMessages, journeyAnchors } = state;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [typingMsgIdx, setTypingMsgIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lyraState: LyraCanvasState =
    typingMsgIdx !== null ? "speaking" : "attentive";

  // Auto-start conversation
  useEffect(() => {
    if (journeyVisibleMessages === 0) {
      timerRef.current = setTimeout(() => {
        dispatch({ type: "ADVANCE_JOURNEY" });
        setTypingMsgIdx(0);
      }, 600);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMessageTyped = useCallback(
    (msgIdx: number) => {
      setTypingMsgIdx(null);

      // Check if this message has an anchor
      const anchor = ANCHOR_MAP[msgIdx];
      if (anchor) {
        const alreadyHas = state.journeyAnchors.some((a) => a.id === anchor.id);
        if (!alreadyHas) {
          timerRef.current = setTimeout(() => {
            dispatch({ type: "ADD_ANCHOR", anchor });
          }, 200);
        }
      }

      // Advance to next message
      const nextIdx = msgIdx + 1;
      if (nextIdx < JOURNEY_MESSAGES.length) {
        timerRef.current = setTimeout(() => {
          dispatch({ type: "ADVANCE_JOURNEY" });
          const nextMsg = JOURNEY_MESSAGES[nextIdx];
          if (nextMsg.role === "assistant") {
            setTypingMsgIdx(nextIdx);
          } else {
            // User messages show instantly
            timerRef.current = setTimeout(() => {
              handleMessageTyped(nextIdx);
            }, 300);
          }
        }, 400);
      }
    },
    [dispatch, state.journeyAnchors]
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [journeyVisibleMessages]);

  return (
    <div className="py-4 pb-6 flex flex-col gap-3 h-full">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-white/30">
          Journey Chat — Lyra extracts anchor themes
        </span>
      </div>

      {/* Anchor strip */}
      <AnchorStripInline anchors={journeyAnchors} maxSlots={6} />

      {/* Sigil + label */}
      <div className="flex items-center gap-2">
        <LyraCanvas state={lyraState} size={36} />
        <span className="text-xs text-white/40 italic font-serif">
          Creating your personal deck...
        </span>
      </div>

      {/* Chat messages */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <AnimatePresence>
          {JOURNEY_MESSAGES.slice(0, journeyVisibleMessages).map(
            (msg, idx) => {
              const isLyra = msg.role === "assistant";
              const isCurrentlyTyping = typingMsgIdx === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                  }}
                  className={cn(
                    "flex gap-2",
                    isLyra ? "items-start" : "items-start flex-row-reverse"
                  )}
                >
                  {isLyra && (
                    <div className="shrink-0 mt-1">
                      <LyraCanvas
                        state={isCurrentlyTyping ? "speaking" : "attentive"}
                        size={28}
                      />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2.5",
                      isLyra
                        ? "bg-white/5 border border-white/10 rounded-tl-sm"
                        : "bg-[#c9a94e]/10 border border-[#c9a94e]/20 rounded-tr-sm"
                    )}
                  >
                    {isLyra && isCurrentlyTyping ? (
                      <LyraTypewriter
                        text={msg.content}
                        speed={14}
                        onComplete={() => handleMessageTyped(idx)}
                      />
                    ) : (
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isLyra
                            ? "text-amber-200/80 italic font-serif"
                            : "text-white/70"
                        )}
                      >
                        {msg.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            }
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input placeholder */}
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
        <span className="flex-1 text-sm text-white/20">
          Share your story with Lyra...
        </span>
        <div className="w-7 h-7 rounded-lg bg-[#c9a94e]/10 flex items-center justify-center">
          <ChevronRight className="w-3.5 h-3.5 text-[#c9a94e]/50" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-white/25">
        <MessageCircle className="w-3 h-3" />
        <span>Lyra pulls anchor themes from conversation, building the deck</span>
      </div>
    </div>
  );
}

// ─── useCountUp hook ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(target - 5);

  useEffect(() => {
    if (!started) return;
    const startVal = target - 5;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.round(startVal + (target - startVal) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return count;
}

// ─── Moment 4: Celebration ────────────────────────────────────────────────────

function CelebrationMoment({ state, dispatch }: MomentProps) {
  const { celebrationEntered } = state;
  const starCount = useCountUp(48, 1.2, celebrationEntered);
  const [titleVisible, setTitleVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if (!celebrationEntered) {
      dispatch({ type: "CELEBRATION_ENTERED" });
    }
  }, []);

  useEffect(() => {
    if (celebrationEntered) {
      const t1 = setTimeout(() => setTitleVisible(true), 300);
      const t2 = setTimeout(() => setStatsVisible(true), 1200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [celebrationEntered]);

  const titleText = "A New Constellation Has Formed";

  // Deterministic shooting stars
  const shootingStars: {
    top: string;
    left?: string;
    right?: string;
    angle: number;
    delay: number;
  }[] = [
    { top: "15%", left: "10%", angle: 45, delay: 0.2 },
    { top: "25%", right: "8%", angle: -35, delay: 0.6 },
    { top: "40%", left: "5%", angle: 30, delay: 1.0 },
    { top: "20%", left: "50%", angle: 50, delay: 1.4 },
    { top: "60%", right: "15%", angle: -45, delay: 1.8 },
  ];

  const statPills = [
    { label: "+5 new stars", color: "#c9a94e" },
    { label: "+3 connections", color: "#4ecdc4" },
    { label: "+1 deck", color: "#818cf8" },
  ];

  return (
    <div className="py-4 pb-6 flex flex-col items-center gap-6 relative">
      <div className="w-full">
        <span className="text-[10px] uppercase tracking-widest text-white/30">
          Celebration — Milestone reached
        </span>
      </div>

      {/* Radial golden overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(201,169,78,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Shooting stars */}
      {shootingStars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-12 h-[1px] rounded-full bg-gradient-to-r from-[#c9a94e] to-transparent"
          style={{
            top: star.top,
            left: star.left,
            right: star.right,
            rotate: star.angle,
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: [0, 0.8, 0], scaleX: [0, 1, 1] }}
          transition={{
            duration: 0.8,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 3.5,
          }}
        />
      ))}

      {/* Sigil */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <LyraCanvas state="speaking" size={80} />
        <span className="text-[10px] text-amber-300/50 tracking-wider">
          LYRA
        </span>
      </motion.div>

      {/* Title — staggered character entrance */}
      <AnimatePresence>
        {titleVisible && (
          <motion.div className="text-center px-2">
            <div className="overflow-hidden">
              <motion.div className="flex flex-wrap justify-center gap-x-[0.25em]">
                {titleText.split(" ").map((word, wi) => (
                  <motion.span
                    key={wi}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                      delay: wi * 0.07,
                    }}
                    className="text-xl sm:text-2xl font-bold text-white"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Lyra message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-3 max-w-[280px] mx-auto"
            >
              <p className="text-sm text-amber-200/70 italic font-serif leading-relaxed">
                "Your journey tonight has woven new stars into the sky."
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star count */}
      <motion.div
        className="flex flex-col items-center gap-1"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.4 }}
      >
        <div className="bg-[#c9a94e]/10 border border-[#c9a94e]/25 rounded-2xl px-8 py-4 text-center">
          <p
            className="text-4xl font-bold tabular-nums"
            style={{ color: "#c9a94e" }}
          >
            {starCount}
          </p>
          <p className="text-xs text-white/40 mt-1">Stars in your sky</p>
        </div>
      </motion.div>

      {/* Stat pills */}
      <AnimatePresence>
        {statsVisible && (
          <motion.div className="flex gap-2 flex-wrap justify-center">
            {statPills.map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: i * 0.1,
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${pill.color}14`,
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${pill.color}35`,
                  color: pill.color,
                }}
              >
                {pill.label}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28, delay: 1.4 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="px-8 py-3 rounded-xl font-medium text-sm text-[#c9a94e]"
        style={{
          background: "rgba(201,169,78,0.08)",
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "rgba(201,169,78,0.35)",
          boxShadow: "0 0 20px rgba(201,169,78,0.12)",
        }}
      >
        Return Home
      </motion.button>

      <div className="flex items-center gap-2 text-[10px] text-white/25">
        <MessageCircle className="w-3 h-3" />
        <span>Lyra celebrates milestones with star count and constellation growth</span>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function LyraIntegratedContent() {
  const { setMoodPreset } = useMockImmersive();
  const [state, dispatch] = useReducer(reducer, getInitialState());

  useEffect(() => {
    const moods: Record<Moment, string> = {
      dashboard: "default",
      reading: "card-reveal",
      journey: "midnight",
      celebration: "golden",
    };
    setMoodPreset(moods[state.currentMoment]);
  }, [state.currentMoment, setMoodPreset]);

  const handleNext = useCallback(() => {
    dispatch({ type: "NEXT_MOMENT" });
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-3 flex items-center justify-between">
        <Link
          href="/mock/lyra"
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Moment indicator + labels */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-1.5">
            {MOMENTS.map((m) => (
              <button
                key={m}
                onClick={() => dispatch({ type: "GO_TO_MOMENT", moment: m })}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  m === state.currentMoment
                    ? "w-6 bg-[#c9a94e]"
                    : "w-1.5 bg-white/20 hover:bg-white/35"
                )}
              />
            ))}
          </div>
          <motion.span
            key={state.currentMoment}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="text-[10px] uppercase tracking-widest text-white/40"
          >
            {MOMENT_LABELS[state.currentMoment]}
          </motion.span>
        </div>

        {/* Placeholder for balance */}
        <div className="w-12" />
      </div>

      {/* Content area — all moments mounted, opacity controlled */}
      <div className="flex-1 min-h-0 relative overflow-hidden" style={{ minHeight: 200 }}>
        <MomentLayer isActive={state.currentMoment === "dashboard"}>
          <DashboardMoment state={state} dispatch={dispatch} />
        </MomentLayer>
        <MomentLayer isActive={state.currentMoment === "reading"}>
          <ReadingMoment state={state} dispatch={dispatch} />
        </MomentLayer>
        <MomentLayer isActive={state.currentMoment === "journey"}>
          <JourneyMoment state={state} dispatch={dispatch} />
        </MomentLayer>
        <MomentLayer isActive={state.currentMoment === "celebration"}>
          <CelebrationMoment state={state} dispatch={dispatch} />
        </MomentLayer>
      </div>

      {/* Next Moment button */}
      <div className="shrink-0 px-4 sm:px-6 pb-5 sm:pb-7">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm flex items-center justify-center gap-2 hover:bg-white/8 transition-colors"
        >
          {state.currentMoment === "celebration" ? "Restart" : "Next Moment"}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

export default function LyraIntegratedPage() {
  return (
    <MockImmersiveShell>
      <LyraIntegratedContent />
    </MockImmersiveShell>
  );
}
