"use client";

import { useReducer, useCallback, useEffect, useRef, useMemo } from "react";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MockCardFront } from "@/components/mock/mock-card";
import { MOCK_CARDS, MOCK_THEMES } from "@/components/mock/mock-data";
import { techniqueRegistry } from "../techniques";
import { CrystalOrb } from "../stages/crystal-orb";
import { FlowShell } from "./flow-shell";
import { FlowCta } from "./flow-cta";
import { TechniqueIndicator } from "./technique-indicator";
import {
  cardForgingReducer,
  createInitialState,
  PHASE_LABELS,
  CTA_LABELS,
  MOOD_MAP,
  type ForgingPhase,
} from "./card-forging-state";

function pickCards() {
  const shuffled = [...MOCK_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

const FORGE_DURATION = 3000;

export function CardForging() {
  const initialCards = useMemo(() => pickCards(), []);
  const [state, dispatch] = useReducer(
    cardForgingReducer,
    createInitialState(initialCards)
  );
  const { setMoodPreset } = useMockImmersive();
  const forgeTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const forgeStartRef = useRef(0);

  // Mood sync
  useEffect(() => {
    setMoodPreset(MOOD_MAP[state.phase]);
  }, [state.phase, setMoodPreset]);

  // Simulate forging progress + auto-advance when complete
  useEffect(() => {
    if (state.phase !== "forging" || state.transitioning) return;

    forgeStartRef.current = Date.now();
    forgeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - forgeStartRef.current;
      const progress = Math.min(1, elapsed / FORGE_DURATION);
      dispatch({ type: "FORGING_TICK", progress });

      if (progress >= 1) {
        clearInterval(forgeTimerRef.current);
        setTimeout(() => {
          dispatch({ type: "FORGE_COMPLETE" });
        }, 400);
      }
    }, 50);

    return () => clearInterval(forgeTimerRef.current);
  }, [state.phase, state.transitioning]);

  const handleAdvance = useCallback(() => {
    if (state.phase === "complete") {
      dispatch({ type: "RESET", forgedCards: pickCards() });
      return;
    }
    dispatch({ type: "ADVANCE" });
  }, [state.phase]);

  const handleMidpoint = useCallback(() => {
    dispatch({ type: "MIDPOINT" });
  }, []);

  const handleTransitionComplete = useCallback(() => {
    dispatch({ type: "TRANSITION_COMPLETE" });
  }, []);

  const ActiveTechnique = techniqueRegistry[state.activeTechnique];

  const cardContent = renderCardContent(state.phase, state.forgedCards, state.forgingProgress);

  return (
    <>
      <TechniqueIndicator
        techniqueId={state.activeTechnique}
        visible={state.transitioning}
      />
      <FlowShell
        statusLabel={PHASE_LABELS[state.phase]}
        statusKey={state.phase}
        cardZone={
          <div className="w-full max-w-sm aspect-[3/4] relative">
            <div className="w-full h-full">
              <ActiveTechnique
                morphed={false}
                onMorphComplete={handleTransitionComplete}
                stageTransition={
                  state.transitionKey
                    ? { key: state.transitionKey, onMidpoint: handleMidpoint }
                    : null
                }
              >
                {cardContent}
              </ActiveTechnique>
            </div>
          </div>
        }
        actionZone={
          state.phase === "forging" ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-[240px]">
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#c9a94e] to-[#ffd700] transition-all duration-100"
                  style={{ width: `${state.forgingProgress * 100}%` }}
                />
              </div>
              <span className="text-xs text-white/40">
                {state.forgingProgress < 1
                  ? `${Math.round(state.forgingProgress * 100)}%`
                  : "Complete!"}
              </span>
            </div>
          ) : (
            <FlowCta
              label={
                state.transitioning ? "Transitioning..." : CTA_LABELS[state.phase]
              }
              onClick={handleAdvance}
              disabled={state.transitioning}
              gold={state.phase === "complete" || state.phase === "prompt"}
            />
          )
        }
      />
    </>
  );
}

function renderCardContent(
  phase: ForgingPhase,
  forgedCards: import("@/components/mock/mock-data").MockCard[],
  forgingProgress: number
) {
  switch (phase) {
    case "prompt":
      return <PromptContent />;
    case "forging":
      return <CrystalOrb morphed={forgingProgress > 0.3} className="w-full h-full" />;
    case "review":
      return <ReviewContent forgedCards={forgedCards} />;
    case "complete":
      return <CompleteContent heroCard={forgedCards[0]} />;
    default:
      return null;
  }
}

function PromptContent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center max-w-[280px]">
        <h2 className="text-lg font-semibold text-white/90 mb-3">
          Describe your vision
        </h2>
        <p className="text-sm text-white/50 mb-4">
          Choose the themes that resonate with your journey
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {MOCK_THEMES.slice(0, 6).map((theme) => (
            <span
              key={theme.id}
              className="rounded-full px-3 py-1 text-xs font-medium border"
              style={{
                borderColor: `${theme.color}40`,
                color: `${theme.color}cc`,
                background: `${theme.color}15`,
              }}
            >
              {theme.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewContent({
  forgedCards,
}: {
  forgedCards: import("@/components/mock/mock-data").MockCard[];
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-2 gap-3">
        {forgedCards.map((card) => (
          <div
            key={card.id}
            className="rounded-xl overflow-hidden"
            style={{
              boxShadow: "0 0 20px rgba(201,169,78,0.2)",
            }}
          >
            <MockCardFront card={card} width={110} height={165} />
          </div>
        ))}
      </div>
    </div>
  );
}

function CompleteContent({
  heroCard,
}: {
  heroCard: import("@/components/mock/mock-data").MockCard;
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          boxShadow:
            "0 0 40px rgba(201,169,78,0.4), 0 0 80px rgba(201,169,78,0.15)",
        }}
      >
        <MockCardFront card={heroCard} width={180} height={270} />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-[#c9a94e]">Deck Created</p>
        <p className="text-sm text-white/50 mt-1">
          Your cards are ready to guide you
        </p>
      </div>
    </div>
  );
}
