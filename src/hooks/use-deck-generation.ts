"use client";

import { useState } from "react";

interface GenerateDeckInput {
  vision: string;
  cardCount: number;
  artStyleId: string;
}

export function useDeckGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(
    input: GenerateDeckInput
  ): Promise<{ deckId: string; title: string; obstacleCount: number } | null> {
    setIsGenerating(true);
    setError(null);

    try {
      // Phase 1: Generate card text
      const textRes = await fetch("/api/ai/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const textJson = await textRes.json();
      if (!textJson.success) {
        setError(textJson.error ?? "Failed to generate deck");
        return null;
      }

      const { deckId, title, obstacleCount } = textJson.data;

      // Phase 2: Trigger batch image generation (fire-and-forget)
      fetch("/api/ai/generate-images-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId }),
      });

      // Return data — let the caller control navigation
      return { deckId, title: title ?? "Your Deck", obstacleCount: obstacleCount ?? 0 };
    } catch {
      setError("Something went wrong. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  return { generate, isGenerating, error };
}
