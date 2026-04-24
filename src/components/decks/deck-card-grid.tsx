"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { CardFeedbackButton } from "@/components/cards/card-feedback-button";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import type { Card, CardFeedbackType } from "@/types";

interface DeckCardGridProps {
  cards: Card[];
  onRetryImage?: (cardId: string) => void;
  feedbackMap?: Record<string, CardFeedbackType>;
}

export function DeckCardGrid({ cards: initialCards, onRetryImage, feedbackMap }: DeckCardGridProps) {
  const { selectedCard, openCard, modalProps } = useCardDetailModal<Card>();
  const [localCards, setLocalCards] = useState<Card[]>(initialCards);
  const [localFeedback, setLocalFeedback] = useState<Record<string, CardFeedbackType>>(
    feedbackMap ?? {}
  );

  const handleFeedbackChange = useCallback(
    (cardId: string, feedback: CardFeedbackType | null) => {
      setLocalFeedback((prev) => {
        const next = { ...prev };
        if (feedback === null) {
          delete next[cardId];
        } else {
          next[cardId] = feedback;
        }
        return next;
      });
    },
    []
  );

  const handleCardImageUpdated = useCallback(
    (cardId: string, newImageUrl: string) => {
      setLocalCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, imageUrl: newImageUrl } : c))
      );
    },
    []
  );

  // Use localCards (which may have updated image URLs from refinement)
  const cards = localCards;

  // Derive current card from live cards so modal reflects optimistic updates
  const currentSelectedCard = selectedCard
    ? cards.find((c) => c.id === selectedCard.id) ?? selectedCard
    : null;

  if (cards.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No cards yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card, index) => (
          <div key={card.id} className="relative group">
            <OracleCard
              card={card}
              size="fill"
              priority={index < 5}
              onClick={() => openCard(card)}
              onRetryImage={
                onRetryImage ? () => onRetryImage(card.id) : undefined
              }
            />
            {/* Studio refine icon — desktop hover only */}
            {card.imageStatus === "completed" && card.imageUrl && (
              <Link
                href={`/studio/cards/${card.id}`}
                className="absolute top-1.5 left-1.5 hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-primary hover:border-primary/30"
                onClick={(e) => e.stopPropagation()}
              >
                <Wand2 className="h-3.5 w-3.5" />
              </Link>
            )}
            {feedbackMap && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <CardFeedbackButton
                  cardId={card.id}
                  initialFeedback={localFeedback[card.id] ?? null}
                  onFeedbackChange={handleFeedbackChange}
                  size="sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <CardDetailModal
        {...modalProps}
        card={currentSelectedCard}
        onRetryImage={onRetryImage}
        onCardImageUpdated={handleCardImageUpdated}
        showFeedback
        feedbackMap={localFeedback}
        onFeedbackChange={handleFeedbackChange}
      />
    </>
  );
}
