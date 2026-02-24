"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import gsap from "gsap";
import { AURORA, TIMING } from "../aurora-journey-theme";
import { GsapContentMaterializer } from "../gsap-content-materializer";
import type { JourneyAction, CreationSubPhase } from "../aurora-journey-state";
import type { AuroraRibbonHandle } from "../aurora-ribbons";
import { getAllCards, MOCK_ART_STYLES } from "../../_shared/mock-data-v1";
import type { MockFullCard } from "../../_shared/types";

interface CreationPhaseProps {
  subPhase: CreationSubPhase;
  dispatch: React.Dispatch<JourneyAction>;
  auroraRef: React.RefObject<AuroraRibbonHandle | null>;
  isActive: boolean;
  selectedStyleId: string | null;
  userName: string;
}

export function CreationPhase({
  subPhase,
  dispatch,
  auroraRef,
  isActive,
  selectedStyleId,
  userName,
}: CreationPhaseProps) {
  const cardStripRef = useRef<HTMLDivElement>(null);
  const styleGridRef = useRef<HTMLDivElement>(null);
  const styleChosenRef = useRef<HTMLDivElement>(null);

  const previewCards = useMemo(() => {
    const all = getAllCards();
    return all.slice(0, 5);
  }, []);

  // GSAP timeline for sub-phase auto-advance
  useEffect(() => {
    if (!isActive) return;

    const ctx = gsap.context(() => {
      if (subPhase === "intro") {
        gsap.delayedCall(2.0, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "cards_appearing" });
        });
      } else if (subPhase === "cards_appearing") {
        // Stagger card entrance via GSAP
        if (cardStripRef.current) {
          const cards = cardStripRef.current.querySelectorAll(".preview-card");
          gsap.set(cards, { opacity: 0, y: 20, scale: 0.8 });
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.15,
            duration: 0.5,
            ease: "back.out(1.4)",
          });
        }
        gsap.delayedCall(2.5, () => {
          dispatch({ type: "SET_SUB_PHASE", subPhase: "style_select" });
        });
      } else if (subPhase === "style_select") {
        // Animate style grid entrance
        if (styleGridRef.current) {
          gsap.fromTo(
            styleGridRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );
        }
      } else if (subPhase === "style_chosen") {
        if (styleChosenRef.current) {
          gsap.fromTo(
            styleChosenRef.current,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
          );
        }
        gsap.delayedCall(1.5, () => {
          dispatch({ type: "START_BREATH_PAUSE" });
          gsap.delayedCall((TIMING.breathPause + 300) / 1000, () => {
            dispatch({ type: "ADVANCE_PHASE" });
            dispatch({ type: "END_BREATH_PAUSE" });
          });
        });
      }
    });

    return () => ctx.revert();
  }, [subPhase, isActive, dispatch]);

  const handleStyleSelect = useCallback(
    (styleId: string) => {
      dispatch({ type: "SELECT_STYLE", styleId });
      dispatch({ type: "SET_SUB_PHASE", subPhase: "style_chosen" });
    },
    [dispatch]
  );

  const showIntro = subPhase === "intro";
  const showCards = subPhase === "cards_appearing" || subPhase === "style_select" || subPhase === "style_chosen";
  const showStyleGrid = subPhase === "style_select";
  const showStyleChosen = subPhase === "style_chosen";

  const chosenStyle = selectedStyleId
    ? MOCK_ART_STYLES.find((s) => s.id === selectedStyleId)
    : null;

  return (
    <div
      className="flex flex-col items-center flex-1 px-4 min-h-0 overflow-hidden"
      style={{ pointerEvents: isActive ? "auto" : "none" }}
    >
      {/* Lyra's intro text */}
      <GsapContentMaterializer
        visible={showIntro}
        auroraRef={auroraRef}
        className="text-center max-w-md mx-auto pt-4 pb-6 shrink-0"
        id="creation-intro"
      >
        <p className="font-serif text-lg sm:text-xl leading-relaxed" style={{ color: AURORA.text }}>
          The threads of your story are ready to be woven into cards,{" "}
          <span style={{ color: AURORA.accent }}>{userName || "seeker"}</span>.
          Let us choose a visual language for your deck.
        </p>
      </GsapContentMaterializer>

      {/* Card preview strip */}
      <div
        ref={cardStripRef}
        className="flex gap-2 sm:gap-3 justify-center shrink-0 py-3"
        style={{ opacity: showCards ? 1 : 0, height: showCards ? "auto" : 0 }}
      >
        {previewCards.map((card, i) => (
          <CardPreview key={card.id} card={card} index={i} />
        ))}
      </div>

      {/* Style selection grid */}
      <div
        className="flex-1 min-h-0 overflow-y-auto w-full max-w-lg mx-auto py-3"
        style={{
          opacity: showStyleGrid || showStyleChosen ? 1 : 0,
          pointerEvents: showStyleGrid ? "auto" : "none",
        }}
      >
        {showStyleGrid && (
          <div ref={styleGridRef} style={{ opacity: 0 }}>
            <p
              className="text-center text-sm mb-3 tracking-widest uppercase"
              style={{ color: AURORA.textDim }}
            >
              Choose an art style
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOCK_ART_STYLES.map((style) => (
                <StyleButton
                  key={style.id}
                  style={style}
                  onSelect={handleStyleSelect}
                />
              ))}
            </div>
          </div>
        )}

        {showStyleChosen && chosenStyle && (
          <div ref={styleChosenRef} className="text-center py-6" style={{ opacity: 0 }}>
            <div
              className={`w-16 h-16 rounded-2xl ${chosenStyle.gradient} mx-auto mb-4 flex items-center justify-center`}
            >
              <span className="text-white text-2xl font-serif">
                {chosenStyle.name.charAt(0)}
              </span>
            </div>
            <p className="font-serif text-lg" style={{ color: AURORA.accent }}>
              {chosenStyle.name}
            </p>
            <p className="text-sm mt-1" style={{ color: AURORA.textDim }}>
              A perfect choice. The cards will take shape...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Card Preview ────────────────────────────────────────────────────

function CardPreview({ card, index }: { card: MockFullCard; index: number }) {
  return (
    <div
      className="preview-card rounded-lg overflow-hidden border"
      style={{
        width: "clamp(48px, 12vw, 72px)",
        aspectRatio: "2/3",
        borderColor: "rgba(255, 255, 255, 0.08)",
        background: "rgba(255, 255, 255, 0.03)",
        opacity: 0,
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
          className="w-full h-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${AURORA.surface}, ${AURORA.bg})` }}
        >
          <span className="text-[8px]" style={{ color: AURORA.accentDim }}>
            {card.title.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Style Button ────────────────────────────────────────────────────

function StyleButton({
  style,
  onSelect,
}: {
  style: (typeof MOCK_ART_STYLES)[number];
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={ref}
      onClick={() => onSelect(style.id)}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors min-h-[44px] cursor-pointer"
      style={{
        borderColor: "rgba(255, 255, 255, 0.06)",
        background: "rgba(255, 255, 255, 0.03)",
      }}
      onMouseEnter={(e) => {
        gsap.to(e.currentTarget, {
          borderColor: AURORA.borderAccent,
          background: "rgba(196, 122, 42, 0.05)",
          scale: 1.03,
          duration: 0.2,
        });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, {
          borderColor: "rgba(255, 255, 255, 0.06)",
          background: "rgba(255, 255, 255, 0.03)",
          scale: 1,
          duration: 0.2,
        });
      }}
      onPointerDown={(e) => {
        gsap.to(e.currentTarget, { scale: 0.97, duration: 0.1 });
      }}
      onPointerUp={(e) => {
        gsap.to(e.currentTarget, { scale: 1.03, duration: 0.1 });
      }}
    >
      <div
        className={`w-10 h-10 rounded-lg ${style.gradient} flex items-center justify-center`}
      >
        <span className="text-white text-sm font-medium">
          {style.name.charAt(0)}
        </span>
      </div>
      <span className="text-xs" style={{ color: AURORA.textDim }}>
        {style.name}
      </span>
    </button>
  );
}
