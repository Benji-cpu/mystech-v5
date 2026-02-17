"use client";

import { useState, useEffect, useCallback } from "react";
import type { VoicePreferences } from "@/types";

const DEFAULT_PREFS: VoicePreferences = {
  enabled: false,
  autoplay: true,
  speed: "1.0",
  voiceId: null,
};

export function useVoicePreferences() {
  const [preferences, setPreferences] = useState<VoicePreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data.voice) {
          setPreferences(data.voice);
        }
      })
      .catch(() => {
        // Use defaults on error
      })
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback(
    async (updates: Partial<VoicePreferences>) => {
      const previous = preferences;

      // Optimistic update
      setPreferences((prev) => ({ ...prev, ...updates }));

      try {
        const body: Record<string, unknown> = {};
        if (updates.enabled !== undefined) body.voiceEnabled = updates.enabled;
        if (updates.autoplay !== undefined) body.voiceAutoplay = updates.autoplay;
        if (updates.speed !== undefined) body.voiceSpeed = updates.speed;
        if (updates.voiceId !== undefined) body.voiceId = updates.voiceId;

        const res = await fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          setPreferences(previous);
          return false;
        }

        const data = await res.json();
        if (data.voice) {
          setPreferences(data.voice);
        }
        return true;
      } catch {
        setPreferences(previous);
        return false;
      }
    },
    [preferences]
  );

  return { preferences, loading, update };
}
