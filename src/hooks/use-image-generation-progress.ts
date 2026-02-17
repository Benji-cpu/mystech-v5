"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface ImageStatusCounts {
  pending: number;
  generating: number;
  completed: number;
  failed: number;
  total: number;
}

// Safety limit: stop polling after 5 minutes (200 polls × 1.5s)
const MAX_POLL_COUNT = 200;

export function useImageGenerationProgress(
  deckId: string | null,
  enabled: boolean = true
) {
  const [status, setStatus] = useState<ImageStatusCounts | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollCountRef = useRef(0);

  const poll = useCallback(async () => {
    if (!deckId) return;
    if (pollCountRef.current >= MAX_POLL_COUNT) return;
    pollCountRef.current++;
    try {
      const res = await fetch(`/api/decks/${deckId}/image-status`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        setStatus(json.data);
      }
    } catch {
      // Silently continue polling
    }
  }, [deckId]);

  useEffect(() => {
    if (!deckId || !enabled) return;

    // Reset poll count when polling restarts (e.g., new retry)
    pollCountRef.current = 0;
    setIsPolling(true);
    poll();

    const interval = setInterval(() => {
      if (pollCountRef.current >= MAX_POLL_COUNT) {
        clearInterval(interval);
        setIsPolling(false);
        return;
      }
      poll();
    }, 1500);

    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [deckId, enabled, poll]);

  const isComplete =
    status !== null &&
    status.total > 0 &&
    status.completed + status.failed >= status.total;

  return { status, isPolling, isComplete };
}
