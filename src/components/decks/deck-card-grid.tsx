"use client";

import { useState } from "react";
import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { CardFeedbackButton } from "@/components/cards/card-feedback-button";
import type { Card, CardFeedbackType } from "@/types";

interface DeckCardGridProps {
  cards: Card[];
  onRetryImage?: (cardId: string) => void;
  feedbackMap?: Record<string, CardFeedbackType>;
}

export function DeckCardGrid({ cards, onRetryImage, feedbackMap }: DeckCardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Derive current card from live cards prop so modal reflects optimistic updates
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
        {cards.map((card) => (
          <div key={card.id} className="relative group">
            <OracleCard
              card={card}
              size="fill"
              onClick={() => setSelectedCard(card)}
              onRetryImage={
                onRetryImage ? () => onRetryImage(card.id) : undefined
              }
            />
            {feedbackMap && (
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <CardFeedbackButton
                  cardId={card.id}
                  initialFeedback={feedbackMap[card.id] ?? null}
                  size="sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <CardDetailModal
        card={currentSelectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onRetryImage={onRetryImage}
        feedbackMap={feedbackMap}
      />
    </>
  );
}
