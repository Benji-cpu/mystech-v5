"use client";

import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MOCK_CARDS, MOCK_SPREADS, MOCK_INTERPRETATION, type MockCard, type MockSpread } from "@/components/mock/mock-data";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { cn } from "@/lib/utils";

type Phase = "spread_select" | "drawing" | "revealing" | "interpreting" | "complete";

interface State {
  phase: Phase;
  selectedSpread: MockSpread | null;
  drawnCards: MockCard[];
}

type Action =
  | { type: "SELECT_SPREAD"; spread: MockSpread; cards: MockCard[] }
  | { type: "START_REVEALING" }
  | { type: "START_INTERPRETING" }
  | { type: "COMPLETE" }
  | { type: "RESET" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SELECT_SPREAD":
      return { ...state, selectedSpread: action.spread, drawnCards: action.cards, phase: "drawing" };
    case "START_REVEALING":
      return { ...state, phase: "revealing" };
    case "START_INTERPRETING":
      return { ...state, phase: "interpreting" };
    case "COMPLETE":
      return { ...state, phase: "complete" };
    case "RESET":
      return { phase: "spread_select", selectedSpread: null, drawnCards: [] };
    default:
      return state;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── RESPONSIVE CARD SIZE HOOK ────────────────────────────────────────────────

interface ResponsiveCardSize {
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  isTablet: boolean;
  viewportWidth: number;
}

function useResponsiveCardSize(cardCount: number, isInterpret: boolean = false): ResponsiveCardSize {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  let cardWidth: number;
  let cardHeight: number;
  let gap: number;

  if (isInterpret) {
    // Smaller sizes for interpretation row
    if (cardCount <= 1) {
      cardWidth = isMobile ? 96 : isTablet ? 120 : 132;
    } else if (cardCount <= 3) {
      cardWidth = isMobile ? 60 : isTablet ? 84 : 96;
    } else if (cardCount <= 5) {
      cardWidth = isMobile ? 48 : isTablet ? 72 : 84;
    } else {
      cardWidth = isMobile ? 36 : isTablet ? 48 : 60;
    }
    gap = isMobile ? 4 : 6;
  } else {
    // Full sizes for spread layout
    if (cardCount <= 1) {
      cardWidth = isMobile ? 160 : isTablet ? 200 : 220;
      gap = 0;
    } else if (cardCount <= 3) {
      cardWidth = isMobile ? 100 : isTablet ? 140 : 160;
      gap = isMobile ? 8 : 16;
    } else if (cardCount <= 5) {
      cardWidth = isMobile ? 80 : isTablet ? 120 : 140;
      gap = isMobile ? 6 : 12;
    } else {
      cardWidth = isMobile ? 60 : isTablet ? 80 : 100;
      gap = isMobile ? 4 : 8;
    }
  }

  cardHeight = Math.round(cardWidth * 1.5);

  return { cardWidth, cardHeight, gap, isMobile, isTablet, viewportWidth };
}

// ─── RESPONSIVE TIMING ──────────────────────────────────────────────────────

function getRevealTiming(cardCount: number) {
  const revealDuration = Math.max(600, 1000 - cardCount * 40);
  const delayBetween = Math.max(300, 500 - cardCount * 20);
  return { revealDuration, delayBetween };
}

// ─── FLIP CARD COMPONENT ─────────────────────────────────────────────────────

interface FlipCardProps {
  card: MockCard;
  flipped: boolean;
  cardWidth: number;
  cardHeight: number;
  isActive?: boolean;
}

function FlipCard({ card, flipped, cardWidth, cardHeight, isActive }: FlipCardProps) {
  return (
    <div className="relative" style={{ perspective: 800, width: cardWidth, height: cardHeight }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d", position: "relative", width: cardWidth, height: cardHeight }}
      >
        {/* Front face (visible when flipped) */}
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <MockCardFront card={card} width={cardWidth} height={cardHeight} />
        </div>
        {/* Back face (visible when not flipped) */}
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <MockCardBack width={cardWidth} height={cardHeight} />
        </div>
      </motion.div>

      {/* Golden glow during active reveal */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.5] }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 -m-4 rounded-2xl bg-[#ffd700]/30 blur-xl pointer-events-none"
        />
      )}
    </div>
  );
}

// ─── SPREAD LAYOUT COMPONENTS ────────────────────────────────────────────────

interface SpreadLayoutProps {
  cards: MockCard[];
  cardStates: ("hidden" | "revealing" | "revealed")[];
  phase: Phase;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  spread: MockSpread;
}

function SingleCardLayout({ cards, cardStates, phase, cardWidth, cardHeight }: SpreadLayoutProps) {
  const flipped = phase !== "drawing" && (cardStates[0] === "revealing" || cardStates[0] === "revealed");
  const isRevealing = cardStates[0] === "revealing";

  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        layout
        animate={{ scale: isRevealing ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <FlipCard card={cards[0]} flipped={flipped} cardWidth={cardWidth} cardHeight={cardHeight} isActive={isRevealing} />
      </motion.div>
    </div>
  );
}

function ThreeCardLayout({ cards, cardStates, phase, cardWidth, cardHeight, gap }: SpreadLayoutProps) {
  return (
    <div className="flex items-center justify-center h-full" style={{ gap }}>
      {cards.map((card, idx) => {
        const flipped = phase !== "drawing" && (cardStates[idx] === "revealing" || cardStates[idx] === "revealed");
        const isRevealing = cardStates[idx] === "revealing";
        return (
          <motion.div
            key={card.id}
            layout
            animate={{ scale: isRevealing ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <FlipCard card={card} flipped={flipped} cardWidth={cardWidth} cardHeight={cardHeight} isActive={isRevealing} />
          </motion.div>
        );
      })}
    </div>
  );
}

function FiveCardCrossLayout({ cards, cardStates, phase, cardWidth, cardHeight, gap, isMobile }: SpreadLayoutProps) {
  // Five Card Cross order: [0]=Present, [1]=Challenge(top), [2]=Guidance(bottom), [3]=Past(left), [4]=Future(right)
  const renderCard = (idx: number) => {
    const flipped = phase !== "drawing" && (cardStates[idx] === "revealing" || cardStates[idx] === "revealed");
    const isRevealing = cardStates[idx] === "revealing";
    return (
      <motion.div
        key={cards[idx].id}
        layout
        animate={{ scale: isRevealing ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <FlipCard card={cards[idx]} flipped={flipped} cardWidth={cardWidth} cardHeight={cardHeight} isActive={isRevealing} />
      </motion.div>
    );
  };

  if (isMobile) {
    // 3-row grid: Challenge / Past-Present-Future / Guidance
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ gap }}>
        {/* Row 1: Challenge (top) */}
        <div className="flex justify-center">{renderCard(1)}</div>
        {/* Row 2: Past, Present, Future */}
        <div className="flex items-center justify-center" style={{ gap }}>{renderCard(3)}{renderCard(0)}{renderCard(4)}</div>
        {/* Row 3: Guidance (bottom) */}
        <div className="flex justify-center">{renderCard(2)}</div>
      </div>
    );
  }

  // Desktop: absolute positioning using spread percentages
  return (
    <div className="relative h-full w-full">
      {cards.map((card, idx) => {
        const flipped = phase !== "drawing" && (cardStates[idx] === "revealing" || cardStates[idx] === "revealed");
        const isRevealing = cardStates[idx] === "revealing";
        const pos = MOCK_SPREADS[2].positions[idx]; // Five Card Cross
        return (
          <motion.div
            key={card.id}
            layout
            animate={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              scale: isRevealing ? 1.1 : 1,
              rotate: pos.rotation || 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <FlipCard card={card} flipped={flipped} cardWidth={cardWidth} cardHeight={cardHeight} isActive={isRevealing} />
          </motion.div>
        );
      })}
    </div>
  );
}

function CelticCrossLayout({ cards, cardStates, phase, cardWidth, cardHeight, gap, isMobile }: SpreadLayoutProps) {
  const renderCard = (idx: number, extraProps?: { rotate?: number }) => {
    const flipped = phase !== "drawing" && (cardStates[idx] === "revealing" || cardStates[idx] === "revealed");
    const isRevealing = cardStates[idx] === "revealing";
    return (
      <motion.div
        key={cards[idx].id}
        layout
        animate={{ scale: isRevealing ? 1.1 : 1, rotate: extraProps?.rotate || 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={extraProps?.rotate ? { position: "absolute" as const, zIndex: 1 } : undefined}
      >
        <FlipCard card={cards[idx]} flipped={flipped} cardWidth={cardWidth} cardHeight={cardHeight} isActive={isRevealing} />
      </motion.div>
    );
  };

  if (isMobile) {
    // Celtic Cross indices:
    // 0=Present, 1=Challenge(crossing), 2=Foundation, 3=Recent Past, 4=Crown, 5=Near Future
    // 6=Self, 7=Environment, 8=Hopes, 9=Outcome
    const smallGap = Math.max(2, gap - 2);
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ gap: smallGap }}>
        {/* Cross section */}
        <div className="flex flex-col items-center" style={{ gap: smallGap }}>
          {/* Crown */}
          <div className="flex justify-center">{renderCard(4)}</div>
          {/* Past - Present+Challenge - Future */}
          <div className="flex items-center justify-center" style={{ gap }}>
            {renderCard(3)}
            {/* Present + Challenge overlapping */}
            <div className="relative flex items-center justify-center" style={{ width: cardWidth + 10, height: cardHeight }}>
              <div className="relative z-0">{renderCard(0)}</div>
              <div className="absolute z-10" style={{ transform: "rotate(90deg)" }}>
                <FlipCard
                  card={cards[1]}
                  flipped={phase !== "drawing" && (cardStates[1] === "revealing" || cardStates[1] === "revealed")}
                  cardWidth={cardWidth}
                  cardHeight={cardHeight}
                  isActive={cardStates[1] === "revealing"}
                />
              </div>
            </div>
            {renderCard(5)}
          </div>
          {/* Foundation */}
          <div className="flex justify-center">{renderCard(2)}</div>
        </div>
        {/* Staff: horizontal row */}
        <div className="flex items-center justify-center" style={{ gap }}>
          {renderCard(6)}
          {renderCard(7)}
          {renderCard(8)}
          {renderCard(9)}
        </div>
      </div>
    );
  }

  // Desktop: absolute positioning using spread percentages
  return (
    <div className="relative h-full w-full">
      {cards.map((card, idx) => {
        const flipped = phase !== "drawing" && (cardStates[idx] === "revealing" || cardStates[idx] === "revealed");
        const isRevealing = cardStates[idx] === "revealing";
        const pos = MOCK_SPREADS[3].positions[idx]; // Celtic Cross
        return (
          <motion.div
            key={card.id}
            layout
            animate={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              scale: isRevealing ? 1.1 : 1,
              rotate: pos.rotation || 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <FlipCard card={card} flipped={flipped} cardWidth={cardWidth} cardHeight={cardHeight} isActive={isRevealing} />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── INTERPRETATION ROW (compact strip for interpreting/complete) ────────────

interface InterpretationRowProps {
  cards: MockCard[];
  cardWidth: number;
  cardHeight: number;
  gap: number;
}

function InterpretationRow({ cards, cardWidth, cardHeight, gap }: InterpretationRowProps) {
  return (
    <div className="flex items-center justify-center flex-wrap" style={{ gap }}>
      {cards.map((card) => (
        <motion.div key={card.id} layout transition={{ type: "spring", stiffness: 300, damping: 25 }}>
          <FlipCard card={card} flipped cardWidth={cardWidth} cardHeight={cardHeight} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── SVG SPREAD PREVIEW ──────────────────────────────────────────────────────

function SpreadPreviewSVG({ spread }: { spread: MockSpread }) {
  // Normalize positions to fit SVG viewBox
  const positions = spread.positions;

  // Find bounds
  const xs = positions.map(p => p.x);
  const ys = positions.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Map positions to SVG coordinates with padding
  const padX = 15;
  const padY = 12;
  const svgWidth = 100;
  const svgHeight = 60;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const mapX = (x: number) => padX + ((x - minX) / rangeX) * (svgWidth - padX * 2);
  const mapY = (y: number) => padY + ((y - minY) / rangeY) * (svgHeight - padY * 2);

  // For single card, center it
  const isSingle = positions.length === 1;
  const cardW = 8;
  const cardH = 12;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-24 sm:h-32 mt-2 sm:mt-4">
      {positions.map((pos, i) => {
        const cx = isSingle ? svgWidth / 2 : mapX(pos.x);
        const cy = isSingle ? svgHeight / 2 - 3 : mapY(pos.y);
        return (
          <g key={i}>
            <rect
              x={cx - cardW / 2}
              y={cy - cardH / 2}
              width={cardW}
              height={cardH}
              rx={1}
              className="fill-white/10 stroke-[#c9a94e]/40"
              strokeWidth={0.5}
              transform={pos.rotation ? `rotate(${pos.rotation}, ${cx}, ${cy})` : undefined}
            />
            <text
              x={cx}
              y={cy + cardH / 2 + 5}
              textAnchor="middle"
              className="fill-white/40"
              fontSize="3"
            >
              {pos.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── MAIN CEREMONY CONTENT (PERSISTENT SHELL) ────────────────────────────────

function ReadingCeremonyContent() {
  const { setMoodPreset } = useMockImmersive();
  const [state, dispatch] = useReducer(reducer, {
    phase: "spread_select",
    selectedSpread: null,
    drawnCards: [],
  });

  // Interpretation streaming state
  const [displayedText, setDisplayedText] = useState("");
  const charIndexRef = useRef(0);

  const cardCount = state.drawnCards.length;
  const { revealDuration, delayBetween } = getRevealTiming(cardCount);

  const isInterpretPhase = state.phase === "interpreting" || state.phase === "complete";
  const isSpreadSelectPhase = state.phase === "spread_select";

  // Two sets of card sizes: full for spread, small for interpretation
  const fullCardSize = useResponsiveCardSize(cardCount, false);
  const interpretCardSize = useResponsiveCardSize(cardCount, true);

  // Card reveal hook
  const { cardStates, startReveal, reset: resetReveal } = useCardReveal({
    cardCount,
    revealDuration,
    delayBetween,
    onAllRevealed: () => {
      setTimeout(() => dispatch({ type: "START_INTERPRETING" }), 500);
    },
  });

  // Phase-based mood changes
  useEffect(() => {
    switch (state.phase) {
      case "spread_select":
        setMoodPreset("default");
        break;
      case "drawing":
        setMoodPreset("card-draw");
        break;
      case "revealing":
        setMoodPreset("card-reveal");
        break;
      case "interpreting":
        setMoodPreset("completion");
        break;
      case "complete":
        setMoodPreset("default");
        break;
    }
  }, [state.phase, setMoodPreset]);

  // Auto-transition from drawing to revealing
  useEffect(() => {
    if (state.phase === "drawing") {
      const timer = setTimeout(() => {
        dispatch({ type: "START_REVEALING" });
        startReveal();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.phase, startReveal]);

  // Interpretation streaming effect
  useEffect(() => {
    if (state.phase === "interpreting") {
      charIndexRef.current = 0;
      setDisplayedText("");

      const interval = setInterval(() => {
        if (charIndexRef.current < MOCK_INTERPRETATION.length) {
          setDisplayedText(MOCK_INTERPRETATION.slice(0, charIndexRef.current + 1));
          charIndexRef.current++;
        } else {
          clearInterval(interval);
          setTimeout(() => dispatch({ type: "COMPLETE" }), 1000);
        }
      }, 15);

      return () => clearInterval(interval);
    }
  }, [state.phase]);

  const handleSpreadSelect = useCallback((spread: MockSpread) => {
    const shuffled = shuffleArray(MOCK_CARDS);
    const drawn = shuffled.slice(0, spread.count);
    dispatch({ type: "SELECT_SPREAD", spread, cards: drawn });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    resetReveal();
    setDisplayedText("");
    charIndexRef.current = 0;
  }, [resetReveal]);

  // Pick the right spread layout component
  const renderSpreadLayout = (cardWidth: number, cardHeight: number, gap: number, isMobile: boolean) => {
    if (!state.selectedSpread) return null;

    const layoutProps: SpreadLayoutProps = {
      cards: state.drawnCards,
      cardStates,
      phase: state.phase,
      cardWidth,
      cardHeight,
      gap,
      isMobile,
      spread: state.selectedSpread,
    };

    switch (state.selectedSpread.count) {
      case 1: return <SingleCardLayout {...layoutProps} />;
      case 3: return <ThreeCardLayout {...layoutProps} />;
      case 5: return <FiveCardCrossLayout {...layoutProps} />;
      case 10: return <CelticCrossLayout {...layoutProps} />;
      default: return <ThreeCardLayout {...layoutProps} />;
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Back Link */}
      <div className="shrink-0 p-3 sm:p-6">
        <Link
          href="/mock/reading"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Reading Mocks</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Main Content — Three Persistent Zones */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-col px-3 sm:px-6 pb-3 sm:pb-6">
        {/* ─── ZONE 1: SELECTION ZONE ────────────────────────────────────────── */}
        <motion.div
          layout
          animate={{
            height: isSpreadSelectPhase ? "auto" : 0,
            opacity: isSpreadSelectPhase ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-6 sm:mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isSpreadSelectPhase ? 1 : 0, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 text-[#c9a94e] mb-3 sm:mb-4"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium tracking-wider uppercase">Choose Your Spread</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isSpreadSelectPhase ? 1 : 0, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl font-bold text-white/90"
              >
                What guidance do you seek?
              </motion.h1>
            </div>

            {/* Mobile: compact list layout */}
            <div className="space-y-2 sm:hidden overflow-y-auto max-h-[60dvh]">
              {MOCK_SPREADS.map((spread, idx) => (
                <motion.button
                  key={spread.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: isSpreadSelectPhase ? 1 : 0,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.3 + idx * 0.08,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  whileTap={isSpreadSelectPhase ? { scale: 0.98 } : {}}
                  onClick={() => handleSpreadSelect(spread)}
                  disabled={!isSpreadSelectPhase}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between group"
                >
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white/90">{spread.name}</h3>
                    <p className="text-white/60 text-xs">{spread.count} {spread.count === 1 ? "card" : "cards"}</p>
                  </div>
                  {/* Inline dot preview */}
                  <div className="flex gap-1 items-center">
                    {Array.from({ length: Math.min(spread.count, 10) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-3 rounded-sm bg-white/15 border border-[#c9a94e]/30"
                        style={
                          spread.positions[i]?.rotation
                            ? { transform: `rotate(${spread.positions[i].rotation}deg)` }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Desktop: grid with SVG previews */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {MOCK_SPREADS.map((spread, idx) => (
                <motion.button
                  key={spread.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: isSpreadSelectPhase ? 1 : 0,
                    y: 0,
                    scale: isSpreadSelectPhase ? 1 : 0.95,
                  }}
                  transition={{
                    delay: 0.4 + idx * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  whileHover={isSpreadSelectPhase ? { scale: 1.02, y: -4 } : {}}
                  whileTap={isSpreadSelectPhase ? { scale: 0.98 } : {}}
                  onClick={() => handleSpreadSelect(spread)}
                  disabled={!isSpreadSelectPhase}
                  className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-8 text-left overflow-hidden group"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c9a94e]/0 to-[#c9a94e]/0 group-hover:from-[#c9a94e]/10 group-hover:to-transparent transition-all duration-500" />

                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-bold text-white/90 mb-1 sm:mb-2">{spread.name}</h3>
                    <p className="text-white/60 text-sm sm:text-base mb-3 sm:mb-4">{spread.count} {spread.count === 1 ? "card" : "cards"}</p>

                    {/* SVG spread preview */}
                    <SpreadPreviewSVG spread={spread} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── ZONE 2: CARD ZONE ─────────────────────────────────────────────── */}
        <motion.div
          layout
          animate={{
            flex: isInterpretPhase ? "0 0 auto" : isSpreadSelectPhase ? "0 0 0px" : "1 1 0%",
            opacity: isSpreadSelectPhase ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "overflow-hidden flex flex-col",
            isInterpretPhase && "lg:flex-row lg:gap-6"
          )}
        >
          {/* Status text during drawing/revealing */}
          {!isInterpretPhase && !isSpreadSelectPhase && (
            <div className="shrink-0 text-center py-2 sm:py-4">
              <AnimatePresence mode="wait">
                {state.phase === "drawing" && (
                  <motion.p
                    key="drawing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-[#c9a94e] text-base sm:text-lg"
                  >
                    Drawing {state.selectedSpread?.name}...
                  </motion.p>
                )}
                {state.phase === "revealing" && (
                  <motion.p
                    key="revealing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-[#c9a94e] text-base sm:text-lg"
                  >
                    Revealing your cards...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Card display area */}
          <motion.div
            layout
            className={cn(
              "flex items-center justify-center",
              isInterpretPhase ? "shrink-0 py-3 sm:py-4 lg:flex-[0_0_40%]" : "flex-1 min-h-0"
            )}
          >
            {isInterpretPhase ? (
              <InterpretationRow
                cards={state.drawnCards}
                cardWidth={interpretCardSize.cardWidth}
                cardHeight={interpretCardSize.cardHeight}
                gap={interpretCardSize.gap}
              />
            ) : !isSpreadSelectPhase ? (
              <div className="w-full max-w-4xl h-full">
                {renderSpreadLayout(
                  fullCardSize.cardWidth,
                  fullCardSize.cardHeight,
                  fullCardSize.gap,
                  fullCardSize.isMobile
                )}
              </div>
            ) : null}
          </motion.div>
        </motion.div>

        {/* ─── ZONE 3: TEXT ZONE ─────────────────────────────────────────────── */}
        <motion.div
          layout
          animate={{
            flex: isInterpretPhase ? "1 1 0%" : "0 0 0px",
            opacity: isInterpretPhase ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: isInterpretPhase ? 0.2 : 0 }}
          className="overflow-hidden"
        >
          <div className="h-full overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8">
            <div className="flex items-center gap-2 text-[#c9a94e] mb-4 sm:mb-6">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium tracking-wider uppercase">Your Reading</span>
            </div>

            <div className="prose prose-invert max-w-none">
              <div className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {state.phase === "interpreting" && displayedText}
                {state.phase === "complete" && MOCK_INTERPRETATION}
                {state.phase === "interpreting" && displayedText.length < MOCK_INTERPRETATION.length && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1 h-4 bg-[#c9a94e] ml-1"
                  />
                )}
              </div>
            </div>

            {/* Reset Button */}
            <AnimatePresence>
              {state.phase === "complete" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.3 }}
                  className="text-center mt-6 sm:mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className={cn(
                      "px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium text-sm sm:text-base",
                      "bg-gradient-to-r from-[#c9a94e] to-[#b89840]",
                      "text-[#0a0118] shadow-lg shadow-[#c9a94e]/20",
                      "hover:shadow-xl hover:shadow-[#c9a94e]/30",
                      "transition-shadow duration-300"
                    )}
                  >
                    Begin Another Reading
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function ReadingCeremonyPage() {
  return (
    <MockImmersiveShell>
      <ReadingCeremonyContent />
    </MockImmersiveShell>
  );
}
