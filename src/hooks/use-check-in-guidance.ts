"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GuidanceData } from "./use-guidance";

interface UseCheckInGuidanceReturn {
  shouldShow: boolean;
  guidance: GuidanceData | null;
  isFirstEncounter: boolean;
  isLoading: boolean;
  complete: () => Promise<void>;
  skip: () => Promise<void>;
  listenAgain: () => Promise<void>;
  dismiss: () => void;
}

export function useCheckInGuidance(): UseCheckInGuidanceReturn {
  const [shouldShow, setShouldShow] = useState(false);
  const [guidance, setGuidance] = useState<GuidanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch("/api/guidance/check-in")
      .then((res) => res.json())
      .then((data) => {
        if (data.guidance) {
          setGuidance(data.guidance);
          setShouldShow(data.show);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
    isFirstEncounter: true,
    isLoading,
    complete,
    skip,
    listenAgain,
    dismiss,
  };
}
