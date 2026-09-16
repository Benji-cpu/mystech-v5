"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { DeckCardGrid } from "./deck-card-grid";
import { GenerationProgress } from "./generation-progress";
import { useImageGenerationProgress } from "@/hooks/use-image-generation-progress";
import { toast } from "sonner";
import type { Deck, Card, CardFeedbackType } from "@/types";
import { setDomainSnapshot } from "@/lib/feedback/domain-snapshot";

interface DeckViewClientProps {
  deck: Deck;
  initialCards: Card[];
  initialFeedbackMap?: Record<string, CardFeedbackType>;
}

export function DeckViewClient({ deck, initialCards, initialFeedbackMap }: DeckViewClientProps) {
  const router = useRouter();
  const [cards, setCards] = useState(initialCards);
  const [retryingCardIds, setRetryingCardIds] = useState<Set<string>>(
    new Set()
  );
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  // Track last known completed count to avoid infinite re-fetch loop
  const lastKnownCompletedRef = useRef(
    initialCards.filter((c) => c.imageStatus === "completed").length
  );
  const isFetchingCardsRef = useRef(false);

  // Derive needsPolling from live cards state + retrying state
  const needsPolling =
    deck.status === "generating" ||
    retryingCardIds.size > 0 ||
    cards.some(
      (c) => c.imageStatus === "pending" || c.imageStatus === "generating"
    );

  const hasFailed = cards.some((c) => c.imageStatus === "failed");

  const { status, isComplete } = useImageGenerationProgress(
    deck.id,
    needsPolling
  );

  // Self-heal a deck whose art never started. Image generation is kicked off
  // by a fire-and-forget fetch from the client that created the deck; if that
  // tab closed, crashed or lost its connection, every card sits at "pending"
  // and the page reads "Painting your cards… 0/N" forever (seen on the
  // first-time walk, 2026-09-16). One request per page load, and the batch
  // route only ever touches pending/failed/stale cards, so this never bills.
  const healKickedRef = useRef(false);
  useEffect(() => {
    if (healKickedRef.current) return;
    const untouched = cards.filter((c) => c.imageStatus === "pending");
    const inFlight = cards.some((c) => c.imageStatus === "generating");
    if (untouched.length === 0 || inFlight) return;
    healKickedRef.current = true;
    fetch("/api/ai/generate-images-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId: deck.id }),
    }).catch(() => {
      // Polling will surface the outcome; nothing to do here.
    });
  }, [cards, deck.id]);

  // What a report from this page needs to be answerable: which deck, and how
  // far the art actually got. "The cards never painted" is unactionable
  // without it.
  useEffect(() => {
    setDomainSnapshot("deck", {
      deckId: deck.id,
      cardCount: cards.length,
      imageStatus: cards.reduce<Record<string, number>>((acc, c) => {
        acc[c.imageStatus ?? "unknown"] = (acc[c.imageStatus ?? "unknown"] ?? 0) + 1;
        return acc;
      }, {}),
    });
    return () => setDomainSnapshot("deck", null);
  }, [cards, deck.id]);

  // Refresh cards when new images complete (comparing against ref, NOT cards state)
  useEffect(() => {
    if (!status || !needsPolling) return;
    if (isFetchingCardsRef.current) return;

    const completedCount = status.completed;

    if (completedCount > lastKnownCompletedRef.current) {
      isFetchingCardsRef.current = true;
      const controller = new AbortController();

      fetch(`/api/decks/${deck.id}/cards`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json) => {
          if (json.success) {
            setCards(json.data);
            lastKnownCompletedRef.current = json.data.filter(
              (c: Card) => c.imageStatus === "completed"
            ).length;
          }
        })
        .catch(() => {
          // Ignore abort errors
        })
        .finally(() => {
          isFetchingCardsRef.current = false;
        });

      return () => controller.abort();
    }
  }, [status, deck.id, needsPolling]);

  useEffect(() => {
    if (isComplete && needsPolling) {
      toast.success("All card images have been generated!");
      router.refresh();
    }
  }, [isComplete, needsPolling, router]);

  // Use ref for double-click guard to avoid stale closure issues
  const retryingCardIdsRef = useRef(retryingCardIds);
  retryingCardIdsRef.current = retryingCardIds;

  const handleRetryImage = useCallback(
    async (cardId: string) => {
      // Double-click guard using ref (avoids dependency on retryingCardIds)
      if (retryingCardIdsRef.current.has(cardId)) return;

      // Optimistically set card to generating
      setRetryingCardIds((prev) => new Set(prev).add(cardId));
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, imageStatus: "generating" as const } : c
        )
      );
      toast.info("Regenerating image...");

      try {
        const res = await fetch("/api/ai/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardId }),
        });
        const json = await res.json();
        if (json.success && json.data?.imageUrl) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    imageStatus: "completed" as const,
                    imageUrl: json.data.imageUrl,
                  }
                : c
            )
          );
          lastKnownCompletedRef.current++;
          toast.success("Image regenerated successfully!");
        } else {
          setCards((prev) =>
            prev.map((c) =>
              c.id === cardId
                ? { ...c, imageStatus: "failed" as const }
                : c
            )
          );
          toast.error(json.error ?? "Failed to regenerate image");
        }
      } catch {
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? { ...c, imageStatus: "failed" as const }
              : c
          )
        );
        toast.error("Failed to regenerate image");
      } finally {
        setRetryingCardIds((prev) => {
          const next = new Set(prev);
          next.delete(cardId);
          return next;
        });
      }
    },
    [deck.id]
  );

  const handleRetryAllFailed = useCallback(async () => {
    const failedCards = cards.filter((c) => c.imageStatus === "failed");
    if (failedCards.length === 0) return;

    setIsRetryingAll(true);
    const failedIds = failedCards.map((c) => c.id);

    // Optimistically set all failed cards to generating
    setRetryingCardIds((prev) => {
      const next = new Set(prev);
      failedIds.forEach((id) => next.add(id));
      return next;
    });
    setCards((prev) =>
      prev.map((c) =>
        failedIds.includes(c.id)
          ? { ...c, imageStatus: "generating" as const }
          : c
      )
    );
    toast.info(`Retrying ${failedCards.length} failed image${failedCards.length !== 1 ? "s" : ""}...`);

    try {
      const res = await fetch("/api/ai/generate-images-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId: deck.id }),
      });
      const json = await res.json();

      // Fetch fresh cards to get updated statuses
      const cardsRes = await fetch(`/api/decks/${deck.id}/cards`);
      const cardsJson = await cardsRes.json();
      if (cardsJson.success) {
        setCards(cardsJson.data);
        lastKnownCompletedRef.current = cardsJson.data.filter(
          (c: Card) => c.imageStatus === "completed"
        ).length;
      }

      if (json.success) {
        toast.success("All images regenerated successfully!");
      } else {
        toast.error(json.error ?? "Some images failed to regenerate");
      }
    } catch {
      // Fetch fresh cards to see what actually happened
      try {
        const cardsRes = await fetch(`/api/decks/${deck.id}/cards`);
        const cardsJson = await cardsRes.json();
        if (cardsJson.success) {
          setCards(cardsJson.data);
          lastKnownCompletedRef.current = cardsJson.data.filter(
            (c: Card) => c.imageStatus === "completed"
          ).length;
        }
      } catch {
        setCards((prev) =>
          prev.map((c) =>
            failedIds.includes(c.id)
              ? { ...c, imageStatus: "failed" as const }
              : c
          )
        );
      }
      toast.error("Failed to regenerate images");
    } finally {
      setRetryingCardIds((prev) => {
        const next = new Set(prev);
        failedIds.forEach((id) => next.delete(id));
        return next;
      });
      setIsRetryingAll(false);
    }
  }, [cards, deck.id]);

  // Show progress bar when polling OR when there are failed cards
  const showProgress = (status && needsPolling) || hasFailed;

  return (
    <div className="space-y-6">
      {showProgress && status && (
        <GenerationProgress
          completed={status.completed}
          total={status.total}
          failed={status.failed}
          generating={status.generating}
          onRetryAllFailed={handleRetryAllFailed}
          isRetrying={isRetryingAll}
        />
      )}

      <DeckCardGrid cards={cards} onRetryImage={handleRetryImage} feedbackMap={initialFeedbackMap} />
    </div>
  );
}
