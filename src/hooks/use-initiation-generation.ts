"use client";

import { useState } from "react";
import type { PresetArtStyleName } from "@/lib/ai/prompts/onboarding";

interface InitiationGenerationResult {
  deckId: string;
  deckTitle: string;
  selectedArtStyleName: PresetArtStyleName;
  selectedArtStyleId: string;
}

export function useInitiationGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InitiationGenerationResult | null>(null);

  async function generate(userInput: string): Promise<InitiationGenerationResult | null> {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Ask AI to pick the art style
      const styleRes = await fetch("/api/onboarding/select-art-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      const styleJson = await styleRes.json();
      const artStyleName: PresetArtStyleName =
        styleJson.success && styleJson.data?.artStyleName
          ? styleJson.data.artStyleName
          : "Watercolor Dream"; // fallback

      const artStyleId: string = styleJson.data?.artStyleId ?? "";

      // Step 2: Generate deck with 3 cards using the selected style
      const deckRes = await fetch("/api/ai/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vision: userInput,
          cardCount: 3,
          artStyleId: artStyleId || undefined,
          mode: "onboarding",
        }),
      });

      const deckJson = await deckRes.json();
      if (!deckJson.success) {
        setError(deckJson.error ?? "Failed to create your deck");
        return null;
      }

      const { deckId, title: deckTitle } = deckJson.data;

      // Step 3: Fire-and-forget image generation
      fetch("/api/ai/generate-images-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId }),
      });

      const genResult: InitiationGenerationResult = {
        deckId,
        deckTitle,
        selectedArtStyleName: artStyleName,
        selectedArtStyleId: artStyleId,
      };
      setResult(genResult);
      return genResult;
    } catch {
      setError("Something went wrong. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  return { generate, isGenerating, error, result };
}
