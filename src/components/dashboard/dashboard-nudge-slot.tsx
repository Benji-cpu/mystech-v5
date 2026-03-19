"use client";

import { AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/components/guide/onboarding-provider";
import { LyraNudge } from "@/components/guide/lyra-nudge";
import { getActiveNudge } from "@/components/guide/nudge-config";

export function DashboardNudgeSlot() {
  const { milestones, stage, completeMilestone, isLoaded } = useOnboarding();

  if (!isLoaded) return null;

  const nudge = getActiveNudge(milestones, stage);

  return (
    <AnimatePresence mode="wait">
      {nudge && (
        <LyraNudge
          key={nudge.id}
          nudge={nudge}
          onDismiss={() => completeMilestone(nudge.milestone)}
        />
      )}
    </AnimatePresence>
  );
}
