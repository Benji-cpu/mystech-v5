"use client";

import { useState } from "react";
import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import type { Card } from "@/types";

interface DeckCardGridProps {
  cards: Card[];
  onRetryImage?: (cardId: string) => void;
}

export function DeckCardGrid({ cards, onRetryImage }: DeckCardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  if (cards.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No cards yet.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.id} className="flex justify-center">
            <OracleCard
              card={card}
              size="md"
              onClick={() => setSelectedCard(card)}
              onRetryImage={
                onRetryImage ? () => onRetryImage(card.id) : undefined
              }
            />
          </div>
        ))}
      </div>

      <CardDetailModal
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onRetryImage={onRetryImage}
      />
    </>
  );
}
