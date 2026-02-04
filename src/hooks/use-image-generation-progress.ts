"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageStatusCounts {
  pending: number;
  generating: number;
  completed: number;
  failed: number;
  total: number;
}

export function useImageGenerationProgress(
  deckId: string | null,
  enabled: boolean = true
) {
  const [status, setStatus] = useState<ImageStatusCounts | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const poll = useCallback(async () => {
    if (!deckId) return;
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

    setIsPolling(true);
    poll();

    const interval = setInterval(poll, 3000);

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
