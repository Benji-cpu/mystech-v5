"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useReducer,
} from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, RotateCcw } from "lucide-react";

import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import {
  MOCK_CARDS,
  MOCK_SPREADS,
  MOCK_INTERPRETATION,
  type MockCard,
  type MockSpread,
} from "@/components/mock/mock-data";
import { MockCardFront } from "@/components/mock/mock-card";
import { cn } from "@/lib/utils";

import {
  ceremonyReducer,
  initialCeremonyState,
  phaseLabels,
  type CeremonyPhase,
} from "./use-ceremony-state";
import { PortalVortexLayer } from "./portal-vortex-layer";
import { StardustOverlay } from "./stardust-overlay";
import { GoldenUnfoldCard } from "./golden-unfold-card";
import { createDealTimeline, killDealTimeline } from "./deal-animation";

// ─── SHUFFLE ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── RESPONSIVE CARD SIZE ────────────────────────────────────────────────────

interface ResponsiveCardSize {
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  isTablet: boolean;
}

function useResponsiveCardSize(
  cardCount: number,
  isInterpret: boolean = false
): ResponsiveCardSize {
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
  let gap: number;

  if (isInterpret) {
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

  const cardHeight = Math.round(cardWidth * 1.5);
  return { cardWidth, cardHeight, gap, isMobile, isTablet };
}

// ─── SVG SPREAD PREVIEW ──────────────────────────────────────────────────────

function SpreadPreviewSVG({ spread }: { spread: MockSpread }) {
  const positions = spread.positions;
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padX = 15;
  const padY = 12;
  const svgWidth = 100;
  const svgHeight = 60;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const mapX = (x: number) =>
    padX + ((x - minX) / rangeX) * (svgWidth - padX * 2);
  const mapY = (y: number) =>
    padY + ((y - minY) / rangeY) * (svgHeight - padY * 2);

  const isSingle = positions.length === 1;
  const cardW = 8;
  const cardH = 12;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-24 sm:h-32 mt-2 sm:mt-4"
    >
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
              transform={
                pos.rotation
                  ? `rotate(${pos.rotation}, ${cx}, ${cy})`
                  : undefined
              }
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

// ─── INTERPRETATION ROW (compressed card strip) ───────────────────────────────

interface InterpretationRowProps {
  cards: MockCard[];
  cardWidth: number;
  cardHeight: number;
  gap: number;
}

function InterpretationRow({
  cards,
  cardWidth,
  cardHeight,
  gap,
}: InterpretationRowProps) {
  return (
    <div
      className="flex items-center justify-center flex-wrap"
      style={{ gap }}
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          layout
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <MockCardFront card={card} width={cardWidth} height={cardHeight} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── SPREAD LAYOUT PROPS ─────────────────────────────────────────────────────

interface SpreadLayoutProps {
  cards: MockCard[];
  cardWidth: number;
  cardHeight: number;
  gap: number;
  isMobile: boolean;
  chargedCards: Set<number>;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

// ─── LAYOUT COMPONENTS (ported from approved ceremony) ──────────────────────

function SingleCardLayout({ cards, cardWidth, cardHeight, chargedCards, cardRefs }: SpreadLayoutProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div ref={(el) => { cardRefs.current[0] = el; }}>
        <GoldenUnfoldCard
          card={cards[0]}
          width={cardWidth}
          height={cardHeight}
          unfolded={chargedCards.has(0)}
          glowing={chargedCards.has(0)}
        />
      </div>
    </div>
  );
}

function ThreeCardLayout({ cards, cardWidth, cardHeight, gap, chargedCards, cardRefs }: SpreadLayoutProps) {
  return (
    <div className="flex items-center justify-center h-full" style={{ gap }}>
      {cards.map((card, idx) => (
        <div key={card.id} ref={(el) => { cardRefs.current[idx] = el; }}>
          <GoldenUnfoldCard
            card={card}
            width={cardWidth}
            height={cardHeight}
            unfolded={chargedCards.has(idx)}
            glowing={chargedCards.has(idx)}
          />
        </div>
      ))}
    </div>
  );
}

function FiveCardCrossLayout({ cards, cardWidth, cardHeight, gap, isMobile, chargedCards, cardRefs }: SpreadLayoutProps) {
  const renderCard = (idx: number) => (
    <div ref={(el) => { cardRefs.current[idx] = el; }}>
      <GoldenUnfoldCard
        card={cards[idx]}
        width={cardWidth}
        height={cardHeight}
        unfolded={chargedCards.has(idx)}
        glowing={chargedCards.has(idx)}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ gap }}>
        <div className="flex justify-center">{renderCard(1)}</div>
        <div className="flex items-center justify-center" style={{ gap }}>
          {renderCard(3)}{renderCard(0)}{renderCard(4)}
        </div>
        <div className="flex justify-center">{renderCard(2)}</div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {cards.map((card, idx) => {
        const pos = MOCK_SPREADS[2].positions[idx];
        return (
          <div
            key={card.id}
            ref={(el) => { cardRefs.current[idx] = el; }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%) rotate(${pos.rotation || 0}deg)` }}
          >
            <GoldenUnfoldCard
              card={card}
              width={cardWidth}
              height={cardHeight}
              unfolded={chargedCards.has(idx)}
              glowing={chargedCards.has(idx)}
            />
          </div>
        );
      })}
    </div>
  );
}

function CelticCrossLayout({ cards, cardWidth, cardHeight, gap, isMobile, chargedCards, cardRefs }: SpreadLayoutProps) {
  const renderCard = (idx: number) => (
    <div ref={(el) => { cardRefs.current[idx] = el; }}>
      <GoldenUnfoldCard
        card={cards[idx]}
        width={cardWidth}
        height={cardHeight}
        unfolded={chargedCards.has(idx)}
        glowing={chargedCards.has(idx)}
      />
    </div>
  );

  if (isMobile) {
    const smallGap = Math.max(2, gap - 2);
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ gap: smallGap }}>
        <div className="flex flex-col items-center" style={{ gap: smallGap }}>
          <div className="flex justify-center">{renderCard(4)}</div>
          <div className="flex items-center justify-center" style={{ gap }}>
            {renderCard(3)}
            <div className="relative flex items-center justify-center" style={{ width: cardWidth + 10, height: cardHeight }}>
              <div className="relative z-0">{renderCard(0)}</div>
              <div className="absolute z-10" style={{ transform: "rotate(90deg)" }}>
                <div ref={(el) => { cardRefs.current[1] = el; }}>
                  <GoldenUnfoldCard
                    card={cards[1]}
                    width={cardWidth}
                    height={cardHeight}
                    unfolded={chargedCards.has(1)}
                    glowing={chargedCards.has(1)}
                  />
                </div>
              </div>
            </div>
            {renderCard(5)}
          </div>
          <div className="flex justify-center">{renderCard(2)}</div>
        </div>
        <div className="flex items-center justify-center" style={{ gap }}>
          {renderCard(6)}{renderCard(7)}{renderCard(8)}{renderCard(9)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {cards.map((card, idx) => {
        const pos = MOCK_SPREADS[3].positions[idx];
        return (
          <div
            key={card.id}
            ref={(el) => { cardRefs.current[idx] = el; }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `translate(-50%, -50%) rotate(${pos.rotation || 0}deg)` }}
          >
            <GoldenUnfoldCard
              card={card}
              width={cardWidth}
              height={cardHeight}
              unfolded={chargedCards.has(idx)}
              glowing={chargedCards.has(idx)}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── SPREAD LAYOUT SELECTOR ─────────────────────────────────────────────────

function renderSpreadLayout(
  cards: MockCard[],
  spread: MockSpread | null,
  cardWidth: number,
  cardHeight: number,
  gap: number,
  isMobile: boolean,
  chargedCards: Set<number>,
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
) {
  if (!spread) return null;
  const props: SpreadLayoutProps = { cards, cardWidth, cardHeight, gap, isMobile, chargedCards, cardRefs };

  switch (spread.count) {
    case 1: return <SingleCardLayout {...props} />;
    case 3: return <ThreeCardLayout {...props} />;
    case 5: return <FiveCardCrossLayout {...props} />;
    case 10: return <CelticCrossLayout {...props} />;
    default: return <ThreeCardLayout {...props} />;
  }
}

// ─── DEAL ZONE (GSAP deal animation) ────────────────────────────────────────

interface DealZoneProps {
  cards: MockCard[];
  cardWidth: number;
  cardHeight: number;
  dealContainerRef: React.RefObject<HTMLDivElement | null>;
}

function DealZone({ cards, cardWidth, cardHeight, dealContainerRef }: DealZoneProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div
        ref={dealContainerRef}
        className="relative"
        style={{ width: cardWidth * 1.5, height: cardHeight * 1.3 }}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            className="deal-card absolute"
            style={{
              top: "50%",
              left: "50%",
              marginTop: -(cardHeight / 2),
              marginLeft: -(cardWidth / 2),
              zIndex: idx,
            }}
          >
            <MockCardFront card={card} width={cardWidth} height={cardHeight} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN CONTENT (PERSISTENT SHELL) ─────────────────────────────────────────

function CeremonyV2Content() {
  const { setMoodPreset, performanceTier } = useMockImmersive();
  const [state, dispatch] = useReducer(ceremonyReducer, initialCeremonyState);

  // Interpretation streaming state
  const [displayedText, setDisplayedText] = useState("");
  const charIndexRef = useRef(0);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs for GSAP deal container and individual card rects
  const cardZoneRef = useRef<HTMLDivElement>(null);
  const dealContainerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Charging card rect for stardust targeting
  const [chargingCardRect, setChargingCardRect] = useState<DOMRect | null>(null);

  const cardCount = state.drawnCards.length;
  const isInterpretPhase =
    state.phase === "interpreting" || state.phase === "complete";
  const isSpreadSelectPhase = state.phase === "spread_select";
  const isCardPhase =
    state.phase === "dealing" ||
    state.phase === "charging" ||
    state.phase === "portal_opening";

  // Responsive card sizing
  const fullCardSize = useResponsiveCardSize(cardCount, false);
  const interpretCardSize = useResponsiveCardSize(cardCount, true);

  // Performance-tier particle counts
  const particleCount =
    performanceTier === "minimal"
      ? 0
      : performanceTier === "reduced"
      ? 80
      : 200;

  // ── Phase-based mood changes ─────────────────────────────────────────────

  useEffect(() => {
    const moodMap: Record<CeremonyPhase, string> = {
      spread_select: "default",
      portal_opening: "midnight",
      dealing: "card-draw",
      charging: "card-reveal",
      interpreting: "completion",
      complete: "default",
    };
    setMoodPreset(moodMap[state.phase]);
  }, [state.phase, setMoodPreset]);

  // ── Handle spread selection ──────────────────────────────────────────────

  const handleSpreadSelect = useCallback((spread: MockSpread) => {
    const shuffled = shuffleArray(MOCK_CARDS);
    const drawn = shuffled.slice(0, spread.count);
    // Reset card refs array size
    cardRefs.current = new Array(spread.count).fill(null);
    dispatch({ type: "SELECT_SPREAD", spread, cards: drawn });
  }, []);

  // ── Portal complete → dealing ────────────────────────────────────────────

  const handlePortalComplete = useCallback(() => {
    dispatch({ type: "PORTAL_COMPLETE" });
  }, []);

  // ── GSAP deal animation (triggered when phase = "dealing") ───────────────

  useEffect(() => {
    if (state.phase !== "dealing") return;

    // Small delay to let the DOM render the deal-card elements
    const setupTimer = setTimeout(() => {
      const container = dealContainerRef.current;
      if (!container) {
        // If container not yet ready, auto-complete
        dispatch({ type: "DEAL_COMPLETE" });
        return;
      }

      const tl = createDealTimeline(container, cardCount, () => {
        // Extra pause so user sees the fanned cards before charging begins
        setTimeout(() => dispatch({ type: "DEAL_COMPLETE" }), 400);
      });

      return () => {
        tl.kill();
        if (container) killDealTimeline(container);
      };
    }, 100);

    return () => clearTimeout(setupTimer);
  }, [state.phase, cardCount]);

  // ── Charging sequence: get rect for current charging card ────────────────

  useEffect(() => {
    if (state.phase !== "charging" || state.chargingCardIndex < 0) {
      setChargingCardRect(null);
      return;
    }

    // For 5+ cards, skip stardust entirely (handled by rapid-fire effect above)
    if (cardCount >= 5) return;

    const cardEl = cardRefs.current[state.chargingCardIndex];
    if (!cardEl) {
      // Card not in DOM yet, skip stardust and mark as charged
      dispatch({ type: "CARD_CHARGED", index: state.chargingCardIndex });
      return;
    }

    // Small delay for layout to settle after phase transition
    const timer = setTimeout(() => {
      const rect = cardEl.getBoundingClientRect();
      setChargingCardRect(rect);
    }, 80);

    return () => clearTimeout(timer);
  }, [state.phase, state.chargingCardIndex, cardCount]);

  // ── Fast charging for 5+ cards (skip stardust, rapid unfold) ────────────

  useEffect(() => {
    if (state.phase !== "charging" || cardCount < 5) return;
    // For large spreads, skip stardust entirely — rapid-fire CARD_CHARGED
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < cardCount; i++) {
      timers.push(
        setTimeout(() => {
          dispatch({ type: "CARD_CHARGED", index: i });
        }, 200 + i * 200)
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [state.phase, cardCount]);

  // ── Stardust complete handler ────────────────────────────────────────────

  const handleStardustComplete = useCallback(() => {
    if (state.phase !== "charging" || state.chargingCardIndex < 0) return;
    setChargingCardRect(null);
    dispatch({ type: "CARD_CHARGED", index: state.chargingCardIndex });
  }, [state.phase, state.chargingCardIndex]);

  // ── Interpretation text streaming ────────────────────────────────────────

  useEffect(() => {
    if (state.phase !== "interpreting") return;

    charIndexRef.current = 0;
    setDisplayedText("");

    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    streamIntervalRef.current = setInterval(() => {
      if (charIndexRef.current < MOCK_INTERPRETATION.length) {
        setDisplayedText(MOCK_INTERPRETATION.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
      } else {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        setTimeout(() => dispatch({ type: "COMPLETE" }), 1000);
      }
    }, 15);

    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [state.phase]);

  // ── Reset handler ─────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    setDisplayedText("");
    charIndexRef.current = 0;
    setChargingCardRect(null);
    dispatch({ type: "RESET" });
  }, []);

  // ── Computed values ───────────────────────────────────────────────────────

  const stardustActive =
    state.phase === "charging" &&
    state.chargingCardIndex >= 0 &&
    chargingCardRect !== null &&
    !state.chargedCards.has(state.chargingCardIndex);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Back link */}
      <div className="shrink-0 p-3 sm:p-6">
        <Link
          href="/mock"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Reading Mocks</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Main content area — flex column of persistent zones */}
      <div className="flex-1 min-h-0 flex flex-col px-3 sm:px-6 pb-3 sm:pb-6">

        {/* ─── STATUS ZONE — always mounted, shows phase label ─────────────── */}
        <motion.div
          layout
          animate={{
            height: isSpreadSelectPhase ? 0 : "auto",
            opacity: isSpreadSelectPhase ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="shrink-0 overflow-hidden"
        >
          <div className="text-center py-2 sm:py-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={state.phase}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-[#c9a94e] text-sm sm:text-lg font-medium tracking-wide"
              >
                {phaseLabels[state.phase]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ─── SELECTION ZONE — collapses after spread is chosen ───────────── */}
        <motion.div
          layout
          animate={{
            flex: isSpreadSelectPhase ? "1 1 0%" : "0 0 0px",
            opacity: isSpreadSelectPhase ? 1 : 0,
            height: isSpreadSelectPhase ? "auto" : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="w-full max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isSpreadSelectPhase ? 1 : 0,
                  y: isSpreadSelectPhase ? 0 : 10,
                }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 text-[#c9a94e] mb-3 sm:mb-4"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium tracking-wider uppercase">
                  Choose Your Spread
                </span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isSpreadSelectPhase ? 1 : 0,
                  y: isSpreadSelectPhase ? 0 : 10,
                }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-4xl font-bold text-white/90"
              >
                What guidance do you seek?
              </motion.h1>
            </div>

            {/* Mobile: compact list */}
            <div className="space-y-2 sm:hidden overflow-y-auto max-h-[55dvh]">
              {MOCK_SPREADS.map((spread, idx) => (
                <motion.button
                  key={spread.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: isSpreadSelectPhase ? 1 : 0,
                    y: isSpreadSelectPhase ? 0 : 6,
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
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between group hover:border-[#c9a94e]/30 transition-colors"
                >
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white/90">
                      {spread.name}
                    </h3>
                    <p className="text-white/60 text-xs">
                      {spread.count} {spread.count === 1 ? "card" : "cards"}
                    </p>
                  </div>
                  <div className="flex gap-1 items-center">
                    {Array.from({ length: Math.min(spread.count, 10) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="w-2 h-3 rounded-sm bg-white/15 border border-[#c9a94e]/30"
                          style={
                            spread.positions[i]?.rotation
                              ? {
                                  transform: `rotate(${spread.positions[i].rotation}deg)`,
                                }
                              : undefined
                          }
                        />
                      )
                    )}
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
                    y: isSpreadSelectPhase ? 0 : 10,
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
                    <h3 className="text-xl sm:text-2xl font-bold text-white/90 mb-1 sm:mb-2">
                      {spread.name}
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base mb-3 sm:mb-4">
                      {spread.count} {spread.count === 1 ? "card" : "cards"}
                    </p>
                    <SpreadPreviewSVG spread={spread} />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── CARD ZONE — portal + deal + stardust + cards ────────────────── */}
        <motion.div
          ref={cardZoneRef}
          layout
          animate={{
            flex: isInterpretPhase
              ? "0 0 auto"
              : isSpreadSelectPhase
              ? "0 0 0px"
              : "1 1 0%",
            opacity: isSpreadSelectPhase ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="overflow-hidden relative min-h-0"
        >
          {/* Portal vortex overlay — z-20 */}
          <PortalVortexLayer
            active={state.phase === "portal_opening"}
            onComplete={handlePortalComplete}
          />

          {/* Stardust overlay canvas — z-30 */}
          <StardustOverlay
            active={stardustActive}
            targetRect={chargingCardRect}
            onComplete={handleStardustComplete}
            particleCount={particleCount}
          />

          {/* Card content — z-10 */}
          <div className="relative z-10 w-full h-full">
            {isInterpretPhase ? (
              /* Interpretation row: small compressed thumbnails */
              <div className="flex items-center justify-center py-3 sm:py-4">
                <InterpretationRow
                  cards={state.drawnCards}
                  cardWidth={interpretCardSize.cardWidth}
                  cardHeight={interpretCardSize.cardHeight}
                  gap={interpretCardSize.gap}
                />
              </div>
            ) : state.phase === "dealing" ? (
              <DealZone
                cards={state.drawnCards}
                cardWidth={fullCardSize.cardWidth}
                cardHeight={fullCardSize.cardHeight}
                dealContainerRef={dealContainerRef}
              />
            ) : !isSpreadSelectPhase ? (
              /* Spread layout: charging phase with proper positions */
              <div className="w-full max-w-4xl mx-auto h-full">
                {renderSpreadLayout(
                  state.drawnCards,
                  state.selectedSpread,
                  fullCardSize.cardWidth,
                  fullCardSize.cardHeight,
                  fullCardSize.gap,
                  fullCardSize.isMobile,
                  state.chargedCards,
                  cardRefs,
                )}
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* ─── TEXT ZONE — interpretation text, grows from h-0 ─────────────── */}
        <motion.div
          layout
          animate={{
            flex: isInterpretPhase ? "1 1 0%" : "0 0 0px",
            opacity: isInterpretPhase ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: isInterpretPhase ? 0.2 : 0,
          }}
          className="overflow-hidden min-h-0"
        >
          {/* Clip-path circle reveal on the glass container */}
          <div
            className="h-full overflow-y-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8"
            style={{
              clipPath: isInterpretPhase
                ? "circle(150% at 50% 0%)"
                : "circle(0% at 50% 0%)",
              transition: "clip-path 0.8s ease-out",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 text-[#c9a94e] mb-4 sm:mb-6">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium tracking-wider uppercase">
                {phaseLabels["interpreting"]}
              </span>
            </div>

            {/* Streaming text */}
            <div className="prose prose-invert max-w-none">
              <div className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {state.phase === "interpreting" && displayedText}
                {state.phase === "complete" && MOCK_INTERPRETATION}
                {state.phase === "interpreting" &&
                  displayedText.length < MOCK_INTERPRETATION.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-4 bg-[#c9a94e] ml-0.5 align-middle"
                    />
                  )}
              </div>
            </div>

            {/* Reset button — appears when complete */}
            <AnimatePresence>
              {state.phase === "complete" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                  className="text-center mt-6 sm:mt-10"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className={cn(
                      "inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-medium text-sm sm:text-base",
                      "bg-gradient-to-r from-[#c9a94e] to-[#b89840]",
                      "text-[#0a0118] shadow-lg shadow-[#c9a94e]/20",
                      "hover:shadow-xl hover:shadow-[#c9a94e]/30",
                      "transition-shadow duration-300"
                    )}
                  >
                    <RotateCcw className="w-4 h-4" />
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

// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────

export default function CeremonyV2Page() {
  return (
    <MockImmersiveShell>
      <CeremonyV2Content />
    </MockImmersiveShell>
  );
}
