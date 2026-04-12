"use client";

import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { LyraNudge } from "@/components/guide/lyra-nudge";
import { GuidanceOverlay } from "@/components/guide/guidance-overlay";
import { getActiveNudge } from "@/components/guide/nudge-config";
import { useGuidance } from "@/hooks/use-guidance";
import { useCheckInGuidance } from "@/hooks/use-check-in-guidance";

// Feature nudge IDs that map to guidance overlays
const FEATURE_GUIDANCE_MAP: Record<string, string> = {
  chronicle_intro: "feature.chronicle.intro",
  art_styles: "feature.art_styles.intro",
  astrology_intro: "feature.astrology.intro",
  sharing: "feature.sharing.intro",
};

function FeatureGuidanceOverlaySlot({ triggerKey }: { triggerKey: string }) {
  const { shouldShow, guidance, isFirstEncounter, complete, skip, listenAgain, dismiss } =
    useGuidance({ triggerKey });

  if (!shouldShow || !guidance) return null;

  return (
    <GuidanceOverlay
      guidance={guidance}
      isFirstEncounter={isFirstEncounter}
      onComplete={complete}
      onSkip={skip}
      onListenAgain={listenAgain}
      onDismiss={dismiss}
    />
  );
}

function CheckInGuidanceSlot() {
  const { shouldShow, guidance, isFirstEncounter, complete, skip, listenAgain, dismiss } =
    useCheckInGuidance();

  if (!shouldShow || !guidance) return null;

  return (
    <GuidanceOverlay
      guidance={guidance}
      isFirstEncounter={isFirstEncounter}
      onComplete={complete}
      onSkip={skip}
      onListenAgain={listenAgain}
      onDismiss={dismiss}
    />
  );
}

export function DashboardNudgeSlot() {
  const { milestones, stage, completeMilestone, isLoaded } = useOnboarding();

  if (!isLoaded) return null;

  const nudge = getActiveNudge(milestones, stage);

  // Check if the active nudge has a guidance overlay upgrade
  const guidanceTriggerKey = nudge ? FEATURE_GUIDANCE_MAP[nudge.id] : null;

  return (
    <>
      {/* Check-in guidance overlay (periodic, separate from nudges) */}
      <CheckInGuidanceSlot />

      {/* Feature guidance overlay takes priority over text nudge */}
      {guidanceTriggerKey && (
        <FeatureGuidanceOverlaySlot triggerKey={guidanceTriggerKey} />
      )}

      {/* Text nudge fallback (shows when no guidance overlay active) */}
      <AnimatePresence mode="wait">
        {nudge && !guidanceTriggerKey && (
          <LyraNudge
            key={nudge.id}
            nudge={nudge}
            onDismiss={() => completeMilestone(nudge.milestone)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
