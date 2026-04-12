"use client";

import { useGuidance } from "@/hooks/use-guidance";
import { GuidanceScreen } from "@/components/guide/guidance-screen";

interface RetreatGuidanceCheckProps {
  pathName: string;
  retreatName: string;
}

// Derive retreat guidance trigger key from path and retreat names
function getRetreatGuidanceTriggerKey(pathName: string, retreatName: string): string {
  const pathSlug = pathName.toLowerCase().replace(/^the\s+/, "").replace(/\s+path$/, "").trim();
  const retreatSlug = retreatName
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/\s+/g, "-")
    .trim();
  return `retreat.${pathSlug}.${retreatSlug}.intro`;
}

export function RetreatGuidanceCheck({ pathName, retreatName }: RetreatGuidanceCheckProps) {
  const triggerKey = getRetreatGuidanceTriggerKey(pathName, retreatName);
  const { shouldShow, guidance, isFirstEncounter, complete, skip, listenAgain } =
    useGuidance({ triggerKey });

  if (!shouldShow || !guidance || !isFirstEncounter) return null;

  return (
    <GuidanceScreen
      guidance={guidance}
      isFirstEncounter={isFirstEncounter}
      onComplete={complete}
      onSkip={skip}
      onListenAgain={listenAgain}
    />
  );
}
