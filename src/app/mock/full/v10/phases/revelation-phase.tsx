"use client";

import { useEffect, useCallback, useRef, useMemo, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import gsap from "gsap";
import { AURORA, RS_CONFIG, TIMING } from "../aurora-journey-theme";
import { GsapContentMaterializer } from "../gsap-content-materializer";
import type { JourneyAction, RevelationSubPhase } from "../aurora-journey-state";
import type { AuroraRibbonHandle } from "../aurora-ribbons";
import { getAllCards, shuffleArray, MOCK_READING_INTERPRETATION } from "../../_shared/mock-data-v1";

const POSITIONS = ["Past", "Present", "Future"];
const DRAG_THRESHOLD = -80; // px — drag up past this to reveal

interface RevelationPhaseProps {
  subPhase: RevelationSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  auroraRef: React.RefObject<AuroraRibbonHandle | null>;
  isActive: boolean;
  revealedCards: number[];
  interpretationProgress: number;
  userName: string;
}

export function RevelationPhase({
  subPhase,
  dispatch,
  auroraRef,
  isActive,
  revealedCards,
  interpretationProgress,
  userName,
}: RevelationPhaseProps) {
  const cardZoneRef = useRef<HTMLDivElement>(null);
  const interpZoneRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [streamedText, setStreamedText] = useState("");

  const readingCards = useMemo(() => {
    const all = getAllCards();
    const shuffled = shuffleArray(all);
    return shuffled.slice(0, 3);
  }, []);

  // GSAP timeline for sub-phase auto-advance
  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      if (subPhase === "forming_circle") {
        gsap.delayedCall(1.5, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "dealing" });
        });
      } else if (subPhase === "dealing") {
        gsap.delayedCall(1.2, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "revealing" });
        });
      }
    });

    return () => ctx.revert();
  }, [subPhase, isActive, dispatch]);

  // Status text animation
  useEffect(() => {
    if (statusRef.current && isActive) {
      gsap.fromTo(
        statusRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [subPhase, isActive]);

  // Card zone / interp zone flex transitions via GSAP
  useEffect(() => {
    const isInterpreting = subPhase === "interpreting" || subPhase === "complete";

    if (cardZoneRef.current) {
      gsap.to(cardZoneRef.current, {
        flex: isInterpreting ? "0 0 auto" : "1 1 0%",
        paddingTop: isInterpreting ? 8 : 16,
        paddingBottom: isInterpreting ? 8 : 16,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }

    if (interpZoneRef.current) {
      gsap.to(interpZoneRef.current, {
        flex: isInterpreting ? "1 1 0%" : "0 0 0px",
        opacity: isInterpreting ? 1 : 0,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  }, [subPhase]);

  // Stream interpretation text
  useEffect(() => {
    if (subPhase !== "interpreting" || !isActive) return;

    const text = MOCK_READING_INTERPRETATION;
    let i = 0;
    setStreamedText("");

    const interval = setInterval(() => {
      if (i < text.length) {
        const chunk = text.slice(i, i + 2);
        setStreamedText((prev) => prev + chunk);
        i += 2;
        dispatch({
          type: "SET_INTERPRETATION_PROGRESS",
          progress: Math.min(i / text.length, 1),
        });
      } else {
        clearInterval(interval);
        gsap.delayedCall(1.5, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "complete" });
        });
      }
    }, 20);

    return () => clearInterval(interval);
  }, [subPhase, isActive, dispatch]);

  const handleCardReveal = useCallback(
    (index: number) => {
      if (subPhase !== "revealing") return;
      if (revealedCards.includes(index)) return;

      dispatch({ type: "REVEAL_CARD", index });

      // Pulse aurora on reveal
      auroraRef.current?.executeCommand({ type: "pulse", intensity: 0.5, duration: 0.8 });

      const newRevealed = [...revealedCards, index];
      if (newRevealed.length >= 3) {
        gsap.delayedCall(TIMING.cardRevealDelay / 1000, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "interpreting" });
        });
      }
    },
    [subPhase, revealedCards, dispatch, auroraRef]
  );

  const handleComplete = useCallback(() => {
    dispatch({ type: "START_BREATH_PAUSE" });
    gsap.delayedCall((TIMING.breathPause + 200) / 1000, () => {
      dispatch({ type: "ADVANCE_PHASE" });
      dispatch({ type: "END_BREATH_PAUSE" });
    });
  }, [dispatch]);

  const showCards = subPhase !== "forming_circle";
  const isInterpreting = subPhase === "interpreting" || subPhase === "complete";
  const isComplete = subPhase === "complete";

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Status text */}
      <div className="text-center py-2 shrink-0 px-4">
        <p
          ref={statusRef}
          key={subPhase}
          className="font-serif text-sm sm:text-base"
          style={{ color: AURORA.textDim }}
        >
          {subPhase === "forming_circle" && "The sacred circle forms..."}
          {subPhase === "dealing" && "Your cards are being drawn from the deck..."}
          {subPhase === "revealing" && "Drag each card upward to reveal its message"}
          {subPhase === "interpreting" && "Lyra reads the threads of meaning..."}
          {subPhase === "complete" && "Your reading is complete"}
        </p>
      </div>

      {/* Card zone */}
      <div
        ref={cardZoneRef}
        className="flex items-center justify-center gap-3 sm:gap-5 px-4 min-h-0 shrink-0"
        style={{ flex: "1 1 0%", paddingTop: 16, paddingBottom: 16 }}
      >
        {readingCards.map((card, i) => (
          <DragRevealCard
            key={card.id}
            card={card}
            index={i}
            isRevealed={revealedCards.includes(i)}
            canReveal={subPhase === "revealing" && !revealedCards.includes(i)}
            isSmall={isInterpreting}
            showCards={showCards}
            dealing={subPhase === "dealing"}
            onReveal={handleCardReveal}
          />
        ))}
      </div>

      {/* Interpretation zone */}
      <div
        ref={interpZoneRef}
        className="min-h-0 px-4 pb-4 overflow-hidden"
        style={{ flex: "0 0 0px", opacity: 0 }}
      >
        <div className="h-full overflow-y-auto max-w-lg mx-auto">
          <div className="py-3">
            <InterpretationText text={streamedText} isStreaming={subPhase === "interpreting"} />

            {isComplete && (
              <div className="text-center mt-6">
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 rounded-full border min-h-[44px] min-w-[44px] cursor-pointer"
                  style={{
                    borderColor: AURORA.borderAccent,
                    color: AURORA.accent,
                    background: "rgba(196, 122, 42, 0.05)",
                  }}
                >
                  <span className="text-sm tracking-widest uppercase font-serif">
                    Complete Reading
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Drag-to-Reveal Card ────────────────────────────────────────────

interface DragRevealCardProps {
  card: ReturnType<typeof getAllCards>[number];
  index: number;
  isRevealed: boolean;
  canReveal: boolean;
  isSmall: boolean;
  showCards: boolean;
  dealing: boolean;
  onReveal: (index: number) => void;
}

function DragRevealCard({
  card,
  index,
  isRevealed,
  canReveal,
  isSmall,
  showCards,
  dealing,
  onReveal,
}: DragRevealCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Spring for drag interaction
  const [spring, springApi] = useSpring(() => ({
    y: 0,
    rotateX: 0,
    scale: 1,
    config: RS_CONFIG,
  }));

  // Flip spring (separate from drag)
  const [flipSpring, flipApi] = useSpring(() => ({
    rotateY: 180,
    config: { tension: 260, friction: 30 },
  }));

  // Deal entrance animation via GSAP
  useEffect(() => {
    if (dealing && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          delay: index * 0.2,
          ease: "back.out(1.4)",
        }
      );
    }
  }, [dealing, index]);

  // Flip when revealed
  useEffect(() => {
    flipApi.start({ rotateY: isRevealed ? 0 : 180 });
  }, [isRevealed, flipApi]);

  // Size transition
  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        width: isSmall ? "clamp(48px, 10vw, 64px)" : "clamp(80px, 22vw, 140px)",
        duration: 0.5,
        ease: "power2.inOut",
      });
    }
  }, [isSmall]);

  // Drag gesture
  const bind = useDrag(
    ({ movement: [, my], active, tap }) => {
      if (!canReveal) return;

      // Tap fallback for accessibility
      if (tap) {
        onReveal(index);
        return;
      }

      if (active) {
        // During drag: lift card + partial rotateX
        const rotateX = Math.min(0, my) * 0.3; // Proportional to drag
        springApi.start({
          y: Math.min(0, my),
          rotateX,
          scale: 1 + Math.abs(my) * 0.001,
          immediate: true,
        });
      } else {
        // Release
        if (my < DRAG_THRESHOLD) {
          // Past threshold — reveal!
          springApi.start({ y: 0, rotateX: 0, scale: 1 });
          onReveal(index);
        } else {
          // Snap back
          springApi.start({ y: 0, rotateX: 0, scale: 1 });
        }
      }
    },
    {
      axis: "y",
      filterTaps: true,
      from: () => [0, spring.y.get()],
    }
  );

  const tapIndicatorRef = useRef<HTMLDivElement>(null);

  // Pulsing tap indicator via GSAP
  useEffect(() => {
    if (canReveal && tapIndicatorRef.current) {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(tapIndicatorRef.current, { opacity: 0.6, duration: 1, ease: "sine.inOut" });
      tl.to(tapIndicatorRef.current, { opacity: 0.3, duration: 1, ease: "sine.inOut" });
      return () => { tl.kill(); };
    }
  }, [canReveal]);

  return (
    <animated.div
      ref={cardRef}
      {...(canReveal ? bind() : {})}
      className="rounded-xl overflow-hidden border relative"
      style={{
        width: isSmall ? "clamp(48px, 10vw, 64px)" : "clamp(80px, 22vw, 140px)",
        aspectRatio: "2/3",
        borderColor: isRevealed ? AURORA.borderAccent : "rgba(255, 255, 255, 0.08)",
        opacity: showCards ? 1 : 0,
        touchAction: "pan-x",
        cursor: canReveal ? "grab" : "default",
        transform: spring.y.to(
          (y) => `translateY(${y}px) rotateX(${spring.rotateX.get()}deg) scale(${spring.scale.get()})`
        ),
        perspective: 800,
      }}
    >
      {/* Card back */}
      <animated.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${AURORA.surface}, ${AURORA.bg})`,
          backfaceVisibility: "hidden",
          transform: flipSpring.rotateY.to((r) => `rotateY(${r + 180}deg)`),
        }}
      >
        <div
          className="w-3/4 h-3/4 rounded-lg border flex items-center justify-center"
          style={{
            borderColor: AURORA.borderAccent,
            background: "rgba(196, 122, 42, 0.05)",
          }}
        >
          <span className="text-2xl" style={{ color: AURORA.accentDim }}>
            &#10022;
          </span>
        </div>
      </animated.div>

      {/* Card face */}
      <animated.div
        className="absolute inset-0"
        style={{
          backfaceVisibility: "hidden",
          transform: flipSpring.rotateY.to((r) => `rotateY(${r}deg)`),
        }}
      >
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-2"
            style={{
              background: `linear-gradient(135deg, rgba(196,122,42,0.1), ${AURORA.surface})`,
            }}
          >
            <span
              className="font-serif text-[10px] sm:text-xs text-center leading-tight"
              style={{ color: AURORA.accent }}
            >
              {card.title}
            </span>
          </div>
        )}
        {/* Position label */}
        {isRevealed && !isSmall && (
          <div
            className="absolute bottom-0 inset-x-0 py-1.5 px-2 text-center"
            style={{
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
            }}
          >
            <span
              className="text-[10px] sm:text-xs uppercase tracking-widest font-medium block"
              style={{ color: AURORA.accent }}
            >
              {POSITIONS[index]}
            </span>
            <span
              className="text-[9px] sm:text-[11px] font-serif block mt-0.5 truncate"
              style={{ color: AURORA.text }}
            >
              {card.title}
            </span>
          </div>
        )}
      </animated.div>

      {/* Drag/tap indicator */}
      {canReveal && (
        <div
          ref={tapIndicatorRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: "none", opacity: 0.3 }}
        >
          <div
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-col gap-0.5"
            style={{ borderColor: AURORA.accentGlow }}
          >
            <span style={{ color: AURORA.accent, fontSize: 12 }}>&#8593;</span>
          </div>
        </div>
      )}
    </animated.div>
  );
}

// ── Interpretation text renderer ────────────────────────────────────

function InterpretationText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <p className="font-serif text-sm sm:text-base leading-relaxed" style={{ color: AURORA.text }}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold" style={{ color: AURORA.accent }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
      {isStreaming && (
        <span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-middle animate-pulse"
          style={{ backgroundColor: AURORA.accent }}
        />
      )}
    </p>
  );
}
