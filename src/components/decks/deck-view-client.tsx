"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DeckCardGrid } from "./deck-card-grid";
import { GenerationProgress } from "./generation-progress";
import { useImageGenerationProgress } from "@/hooks/use-image-generation-progress";
import { toast } from "sonner";
import type { Deck, Card } from "@/types";

interface DeckViewClientProps {
  deck: Deck;
  initialCards: Card[];
}

export function DeckViewClient({ deck, initialCards }: DeckViewClientProps) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);

  const needsPolling =
    deck.status === "generating" ||
    initialCards.some(
      (c) => c.imageStatus === "pending" || c.imageStatus === "generating"
    );

  const { status, isComplete } = useImageGenerationProgress(
    deck.id,
    needsPolling
  );

  // Refresh cards when images complete
  useEffect(() => {
    if (!status || !needsPolling) return;

    const completedCount = status.completed;
    const currentCompleted = cards.filter(
      (c) => c.imageStatus === "completed"
    ).length;

    if (completedCount > currentCompleted) {
      // Fetch updated cards
      fetch(`/api/decks/${deck.id}/cards`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setCards(json.data);
          }
        });
    }
  }, [status, deck.id, needsPolling, cards]);

  useEffect(() => {
    if (isComplete && needsPolling) {
      toast.success("All card images have been generated!");
      router.refresh();
    }
  }, [isComplete, needsPolling, router]);

  const handleRetryImage = useCallback(
    async (cardId: string) => {
      try {
        const res = await fetch("/api/ai/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId }),
        });
        const json = await res.json();
        if (json.success) {
          // Refresh cards
          const cardsRes = await fetch(`/api/decks/${deck.id}/cards`);
          const cardsJson = await cardsRes.json();
          if (cardsJson.success) {
            setCards(cardsJson.data);
          }
        } else {
          toast.error(json.error ?? "Failed to regenerate image");
        }
      } catch {
        toast.error("Failed to regenerate image");
      }
    },
    [deck.id]
  );

  return (
    <div className="space-y-6">
      {status && needsPolling && (
        <GenerationProgress
          completed={status.completed}
          total={status.total}
          failed={status.failed}
          generating={status.generating}
        />
      )}

      <DeckCardGrid cards={cards} onRetryImage={handleRetryImage} />
    </div>
  );
}
