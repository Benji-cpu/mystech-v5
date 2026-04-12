"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface GuidanceData {
  id: string;
  title: string;
  narrationText: string;
  audioUrl: string | null;
  audioDurationMs: number | null;
  deliveryMode: "full_screen" | "overlay";
}

interface UseGuidanceOptions {
  triggerKey: string;
  enabled?: boolean;
}

interface UseGuidanceReturn {
  shouldShow: boolean;
  guidance: GuidanceData | null;
  isFirstEncounter: boolean;
  isLoading: boolean;
  complete: () => Promise<void>;
  skip: () => Promise<void>;
  listenAgain: () => Promise<void>;
  dismiss: () => void;
}

export function useGuidance({
  triggerKey,
  enabled = true,
}: UseGuidanceOptions): UseGuidanceReturn {
  const [shouldShow, setShouldShow] = useState(false);
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [isFirstEncounter, setIsFirstEncounter] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || fetchedRef.current) {
      setIsLoading(false);
      return;
    }
    fetchedRef.current = true;

    fetch(`/api/guidance/check?triggerKey=${encodeURIComponent(triggerKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.guidance) {
          setGuidance(data.guidance);
          setShouldShow(data.show);
          setIsFirstEncounter(!data.previouslyCompleted);
        }
      })
      .catch(() => {
        // Silently fail — no guidance shown
      })
      .finally(() => setIsLoading(false));
  }, [triggerKey, enabled]);

  const complete = useCallback(async () => {
    if (!guidance) return;
    setShouldShow(false);
    await fetch("/api/guidance/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guidanceId: guidance.id }),
    }).catch(() => {});
  }, [guidance]);

  const skip = useCallback(async () => {
    if (!guidance) return;
    setShouldShow(false);
    await fetch("/api/guidance/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guidanceId: guidance.id, skipped: true }),
    }).catch(() => {});
  }, [guidance]);

  const listenAgain = useCallback(async () => {
    if (!guidance) return;
    await fetch("/api/guidance/listen-again", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guidanceId: guidance.id }),
    }).catch(() => {});
  }, [guidance]);

  const dismiss = useCallback(() => {
    setShouldShow(false);
  }, []);

  return {
    shouldShow,
    guidance,
    isFirstEncounter,
    isLoading,
    complete,
    skip,
    listenAgain,
    dismiss,
  };
}
