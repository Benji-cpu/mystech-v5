"use client";

import { useReducer, useCallback, useEffect, useRef, useMemo } from "react";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { MOCK_CARDS, MOCK_INTERPRETATION } from "@/components/mock/mock-data";
import { techniqueRegistry } from "../techniques";
import { SummoningCircle } from "../stages/summoning-circle";
import { FlowShell } from "./flow-shell";
import { FlowCta } from "./flow-cta";
import { TechniqueIndicator } from "./technique-indicator";
import {
  oracleJourneyReducer,
  createInitialState,
  PHASE_LABELS,
  CTA_LABELS,
  MOOD_MAP,
  type OraclePhase,
} from "./oracle-journey-state";

function pickCards() {
  const shuffled = [...MOCK_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function OracleJourney() {
  const initialCards = useMemo(() => pickCards(), []);
  const [state, dispatch] = useReducer(
    oracleJourneyReducer,
    createInitialState(initialCards)
  );
  const { setMoodPreset } = useMockImmersive();
  const streamTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Mood sync
  useEffect(() => {
    setMoodPreset(MOOD_MAP[state.phase]);
  }, [state.phase, setMoodPreset]);

  // Stream interpretation text when entering interpreting phase
  useEffect(() => {
    if (state.phase !== "interpreting") return;
    if (state.displayedText.length >= MOCK_INTERPRETATION.length) return;

    let charIndex = state.displayedText.length;
    streamTimerRef.current = setInterval(() => {
      charIndex += 3;
      if (charIndex >= MOCK_INTERPRETATION.length) {
        charIndex = MOCK_INTERPRETATION.length;
        clearInterval(streamTimerRef.current);
      }
      dispatch({
        type: "STREAM_TICK",
        text: MOCK_INTERPRETATION.slice(0, charIndex),
      });
    }, 20);

    return () => clearInterval(streamTimerRef.current);
  }, [state.phase, state.transitioning]);

  const handleAdvance = useCallback(() => {
    if (state.phase === "interpreting") {
      dispatch({ type: "RESET", drawnCards: pickCards() });
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

  // Get the technique component for the current phase's outgoing transition
  const ActiveTechnique = techniqueRegistry[state.activeTechnique];

  const positions = ["Past", "Present", "Future"];

  // Render the card zone content based on current phase
  const cardContent = renderCardContent(state.phase, state.drawnCards, positions);

  const isInterpreting = state.phase === "interpreting";
  const isComplete = isInterpreting && state.displayedText.length >= MOCK_INTERPRETATION.length;

  return (
    <>
      <TechniqueIndicator
        techniqueId={state.activeTechnique}
        visible={state.transitioning}
      />
      <FlowShell
        statusLabel={PHASE_LABELS[state.phase]}
        statusKey={state.phase}
        cardZoneShrink={isInterpreting}
        textZoneExpanded={isInterpreting}
        cardZone={
          <div className="w-full max-w-sm aspect-[3/4] relative">
            {isInterpreting ? (
              // Compact card strip — no technique wrapper needed
              <div className="flex items-center justify-center gap-3 py-2">
                {state.drawnCards.map((card, i) => (
                  <div key={card.id} className="text-center">
                    <MockCardFront card={card} width={60} height={90} />
                    <p className="text-[10px] text-white/40 mt-1">{positions[i]}</p>
                  </div>
                ))}
              </div>
            ) : (
              // Technique-wrapped content
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
            )}
          </div>
        }
        textZone={
          isInterpreting ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-2">
              <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                {state.displayedText}
                {!isComplete && (
                  <span className="inline-block w-1.5 h-4 bg-[#c9a94e]/70 ml-0.5 animate-pulse" />
                )}
              </p>
            </div>
          ) : null
        }
        actionZone={
          <FlowCta
            label={
              state.transitioning
                ? "Transitioning..."
                : isInterpreting && !isComplete
                  ? "Reading..."
                  : CTA_LABELS[state.phase]
            }
            onClick={handleAdvance}
            disabled={state.transitioning || (isInterpreting && !isComplete)}
            gold={isComplete || state.phase === "welcome"}
          />
        }
      />
    </>
  );
}

function renderCardContent(
  phase: OraclePhase,
  drawnCards: import("@/components/mock/mock-data").MockCard[],
  positions: string[]
) {
  switch (phase) {
    case "welcome":
      return <WelcomeContent />;
    case "summoning":
      return <SummoningCircle morphed className="w-full h-full" />;
    case "dealt":
      return <DealtContent drawnCards={drawnCards} positions={positions} />;
    case "revealed":
      return <RevealedContent drawnCards={drawnCards} positions={positions} />;
    case "interpreting":
      return null;
    default:
      return null;
  }
}

function WelcomeContent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center max-w-[280px]">
        <div className="text-4xl mb-4">&#10022;</div>
        <h2 className="text-lg font-semibold text-white/90 mb-2">
          What guidance do you seek?
        </h2>
        <p className="text-sm text-white/50">
          The oracle awaits your question. Focus your intention and let the cards reveal what lies ahead.
        </p>
      </div>
    </div>
  );
}

function DealtContent({
  drawnCards,
  positions,
}: {
  drawnCards: import("@/components/mock/mock-data").MockCard[];
  positions: string[];
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex gap-4 items-end">
        {drawnCards.map((card, i) => (
          <div key={card.id} className="text-center">
            <MockCardBack width={80} height={120} />
            <p className="text-xs text-white/50 mt-2">{positions[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevealedContent({
  drawnCards,
  positions,
}: {
  drawnCards: import("@/components/mock/mock-data").MockCard[];
  positions: string[];
}) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex gap-4 items-end">
        {drawnCards.map((card, i) => (
          <div key={card.id} className="text-center">
            <MockCardFront card={card} width={80} height={120} />
            <p className="text-xs text-[#c9a94e]/70 mt-2">{positions[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
