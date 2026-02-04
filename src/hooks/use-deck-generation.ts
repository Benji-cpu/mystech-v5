"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateDeckInput {
  title: string;
  description: string;
  cardCount: number;
  artStyleId: string;
}

export function useDeckGeneration() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate(input: GenerateDeckInput) {
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
        return;
      }

      const { deckId } = textJson.data;

      // Phase 2: Trigger batch image generation (fire-and-forget)
      fetch("/api/ai/generate-images-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId }),
      });

      // Navigate to deck view
      router.push(`/decks/${deckId}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  return { generate, isGenerating, error };
}
