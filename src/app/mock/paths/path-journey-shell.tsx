"use client";

import { useReducer, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMockImmersive, moodPresets } from "@/components/mock/mock-immersive-provider";
import { MOCK_CARDS } from "@/components/mock/mock-data";

import {
  pathJourneyReducer,
  initialPathJourneyState,
  getZoneProportions,
} from "./path-journey-state";

import {
  MOCK_PATH,
  MOCK_RETREAT,
  MOCK_INTERPRETATIONS,
  MOCK_ARTIFACT,
} from "./path-journey-data";

import { TrailMap } from "./trail-map";
import { OverviewZone } from "./zones/overview-zone";
import { WaypointZone } from "./zones/waypoint-zone";
import { IntentionZone } from "./zones/intention-zone";
import { ReadingZone } from "./zones/reading-zone";
import { ReflectionZone } from "./zones/reflection-zone";
import { RetreatCompleteZone } from "./zones/retreat-complete-zone";

const SPRING = { type: "spring" as const, stiffness: 200, damping: 28 };

export function PathJourneyShell() {
  const [state, dispatch] = useReducer(pathJourneyReducer, initialPathJourneyState);
  const { setMood } = useMockImmersive();

  const { phase, subPhase, currentWaypointIndex, completedWaypoints, trailProgress } = state;
  const currentWaypoint = MOCK_RETREAT.waypoints[currentWaypointIndex];
  const zones = getZoneProportions(state);

  // ── Mood shifts ─────────────────────────────────────────────────────

  useEffect(() => {
    const moodMap: Record<string, string> = {
      default: "default",
      midnight: "midnight",
      golden: "golden",
    };
    const presetName = moodMap[state.backgroundMood] ?? "default";
    const preset = moodPresets[presetName];
    if (preset) setMood(preset);
  }, [state.backgroundMood, setMood]);

  // ── Handlers ────────────────────────────────────────────────────────

  const handleBeginJourney = useCallback(() => {
    dispatch({ type: "BEGIN_JOURNEY" });
  }, []);

  const handleProceedToIntention = useCallback(() => {
    dispatch({ type: "SET_INTENTION" });
  }, []);

  const handleSetUserIntention = useCallback((text: string) => {
    dispatch({ type: "SET_USER_INTENTION", text });
  }, []);

  const handleUseSuggestedIntention = useCallback(() => {
    if (!currentWaypoint) return;
    dispatch({ type: "SET_USER_INTENTION", text: currentWaypoint.suggestedIntention });
  }, [currentWaypoint]);

  const handleConfirmIntention = useCallback(() => {
    dispatch({ type: "CONFIRM_INTENTION" });
  }, []);

  const handleSetUserQuestion = useCallback((text: string) => {
    dispatch({ type: "SET_USER_QUESTION", text });
  }, []);

  const handleDrawCards = useCallback(() => {
    // Shuffle and pick 3 mock cards
    const shuffled = [...MOCK_CARDS].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, 3);
    dispatch({ type: "DRAW_CARDS", cards: drawn });
  }, []);

  const handleRevealCard = useCallback(
    (index: number) => {
      dispatch({ type: "REVEAL_CARD", index });
    },
    []
  );

  const handleBeginInterpretation = useCallback(() => {
    const text = MOCK_INTERPRETATIONS[currentWaypointIndex] ?? "";
    dispatch({ type: "BEGIN_INTERPRETATION", text });
  }, [currentWaypointIndex]);

  const handleReadingComplete = useCallback(() => {
    dispatch({ type: "READING_COMPLETE" });
  }, []);

  const handleAbsorbAndContinue = useCallback(() => {
    dispatch({ type: "ABSORB_AND_CONTINUE" });
  }, []);

  const handleSetUserReflection = useCallback((text: string) => {
    dispatch({ type: "SET_USER_REFLECTION", text });
  }, []);

  const handleSkipReflection = useCallback(() => {
    dispatch({ type: "SKIP_REFLECTION" });
  }, []);

  const handleAdvanceToNext = useCallback(() => {
    dispatch({ type: "ADVANCE_TO_NEXT" });
  }, []);

  const handleAdvanceComplete = useCallback(() => {
    dispatch({ type: "ADVANCE_COMPLETE" });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // ── CTA button config ──────────────────────────────────────────────

  type CTAConfig = { label: string; onClick: () => void; disabled?: boolean } | null;

  const allRevealed = state.revealedCardIndices.length >= 3;

  const getCTA = (): CTAConfig => {
    switch (phase) {
      case "overview":
        return { label: "Begin Today's Step", onClick: handleBeginJourney };
      case "waypoint":
        return { label: "Set My Intention", onClick: handleProceedToIntention };
      case "intention":
        return {
          label: "Continue to Reading",
          onClick: handleConfirmIntention,
          disabled: !state.userIntention.trim(),
        };
      case "reading":
        if (subPhase === "questioning") {
          return {
            label: "Draw Your Cards",
            onClick: handleDrawCards,
            disabled: !state.userQuestion.trim(),
          };
        }
        if (subPhase === "revealing" && allRevealed) {
          return { label: "Interpret My Cards", onClick: handleBeginInterpretation };
        }
        if (subPhase === "interpreting" || subPhase === "complete") {
          return { label: "Absorb and Continue", onClick: handleAbsorbAndContinue };
        }
        return null;
      case "reflection": {
        const canProceed = state.userReflection.trim() || state.reflectionSkipped;
        if (currentWaypointIndex >= 2) {
          return {
            label: "Complete the Retreat",
            onClick: () => dispatch({ type: "RETREAT_COMPLETE" }),
            disabled: !canProceed,
          };
        }
        return {
          label: "Continue the Path",
          onClick: handleAdvanceToNext,
          disabled: !canProceed,
        };
      }
      case "advancing":
        return { label: "Arrive at Next Step", onClick: handleAdvanceComplete };
      case "retreat_complete":
        return { label: "Return to Paths", onClick: handleReset };
      default:
        return null;
    }
  };

  const cta = getCTA();

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* ── TRAIL ZONE — always mounted, flex proportion changes ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden shrink-0"
        animate={{ flex: `0 0 ${zones.trail}` }}
        transition={SPRING}
      >
        <TrailMap
          waypoints={MOCK_RETREAT.waypoints}
          currentWaypointIndex={currentWaypointIndex}
          completedWaypoints={completedWaypoints}
          trailProgress={trailProgress}
        />
      </motion.div>

      {/* ── SCENE ZONE — always mounted, main content area ── */}
      <motion.div
        layout
        className="min-h-0 overflow-hidden overflow-y-auto"
        animate={{ flex: `1 1 ${zones.scene}` }}
        transition={SPRING}
      >
        <div className="h-full px-4 sm:px-6 flex flex-col">
          {/* Overview — always mounted, visibility controlled */}
          <motion.div
            layout
            animate={{
              height: phase === "overview" ? "auto" : 0,
              opacity: phase === "overview" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <OverviewZone
              path={MOCK_PATH}
              retreat={MOCK_RETREAT}
              onBeginJourney={handleBeginJourney}
            />
          </motion.div>

          {/* Waypoint — always mounted */}
          <motion.div
            layout
            animate={{
              height: phase === "waypoint" ? "auto" : 0,
              opacity: phase === "waypoint" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden"
          >
            {currentWaypoint && (
              <WaypointZone
                waypoint={currentWaypoint}
                waypointIndex={currentWaypointIndex}
                onProceedToIntention={handleProceedToIntention}
              />
            )}
          </motion.div>

          {/* Intention — always mounted */}
          <motion.div
            layout
            animate={{
              height: phase === "intention" ? "auto" : 0,
              opacity: phase === "intention" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden"
          >
            {currentWaypoint && (
              <IntentionZone
                suggestedIntention={currentWaypoint.suggestedIntention}
                waypointName={currentWaypoint.name}
                userIntention={state.userIntention}
                onSetUserIntention={handleSetUserIntention}
                onUseSuggested={handleUseSuggestedIntention}
              />
            )}
          </motion.div>

          {/* Reading — always mounted */}
          <motion.div
            layout
            animate={{
              height: phase === "reading" ? "auto" : 0,
              opacity: phase === "reading" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden flex-1 min-h-0"
          >
            <ReadingZone
              subPhase={phase === "reading" ? (subPhase as "questioning" | "drawing" | "revealing" | "interpreting" | "complete" | null) : null}
              cards={state.drawnCards}
              revealedIndices={state.revealedCardIndices}
              interpretationText={state.interpretationText}
              userIntention={state.userIntention}
              userQuestion={state.userQuestion}
              onSetUserQuestion={handleSetUserQuestion}
              onRevealCard={handleRevealCard}
            />
          </motion.div>

          {/* Reflection — always mounted */}
          <motion.div
            layout
            animate={{
              height: phase === "reflection" ? "auto" : 0,
              opacity: phase === "reflection" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden"
          >
            {currentWaypoint && (
              <ReflectionZone
                waypoint={currentWaypoint}
                waypointIndex={currentWaypointIndex}
                isLastWaypoint={currentWaypointIndex >= 2}
                isTimeLocked={state.isTimeLocked}
                userReflection={state.userReflection}
                onSetUserReflection={handleSetUserReflection}
                onSkipReflection={handleSkipReflection}
                reflectionSkipped={state.reflectionSkipped}
              />
            )}
          </motion.div>

          {/* Advancing — always mounted */}
          <motion.div
            layout
            animate={{
              height: phase === "advancing" ? "auto" : 0,
              opacity: phase === "advancing" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center py-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#c9a94e] text-sm italic text-center"
              >
                The path continues...
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground text-xs text-center mt-2"
              >
                Tomorrow, a new waypoint awaits
              </motion.p>
            </div>
          </motion.div>

          {/* Retreat Complete — always mounted */}
          <motion.div
            layout
            animate={{
              height: phase === "retreat_complete" ? "auto" : 0,
              opacity: phase === "retreat_complete" ? 1 : 0,
            }}
            transition={SPRING}
            className="overflow-hidden"
          >
            <RetreatCompleteZone
              retreat={MOCK_RETREAT}
              artifactTitle={MOCK_ARTIFACT.title}
              artifactThemes={MOCK_ARTIFACT.themes}
              artifactSummary={MOCK_ARTIFACT.summary}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ── ACTION ZONE — fixed CTA bar at bottom ── */}
      <motion.div
        layout
        className="shrink-0 overflow-hidden"
        animate={{ flex: `0 0 ${zones.action}` }}
        transition={SPRING}
      >
        <div className="h-full flex items-center justify-center px-4 pb-safe">
          {cta && (
            <motion.button
              key={cta.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cta.onClick}
              disabled={cta.disabled}
              className={cn(
                "px-8 py-3 rounded-xl font-medium text-sm min-h-[44px]",
                "bg-gradient-to-r from-[#c9a94e] to-[#b89840]",
                "text-[#0a0118] shadow-lg shadow-[#c9a94e]/20",
                "hover:shadow-xl hover:shadow-[#c9a94e]/30",
                "transition-shadow duration-300",
                cta.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {cta.label}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
