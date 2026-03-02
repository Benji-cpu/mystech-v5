"use client";

import { useState, useCallback, useMemo } from "react";
import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { CardFeedbackButton } from "@/components/cards/card-feedback-button";
import { cn } from "@/lib/utils";
import type { Card, CardFeedbackType } from "@/types";

type FilterTab = "all" | "oracle" | "journey";

interface DeckCardGridProps {
  cards: Card[];
  onRetryImage?: (cardId: string) => void;
  feedbackMap?: Record<string, CardFeedbackType>;
}

export function DeckCardGrid({ cards, onRetryImage, feedbackMap }: DeckCardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
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

  const hasJourneyCards = useMemo(
    () => cards.some((c) => c.cardType === "obstacle" || c.cardType === "threshold"),
    [cards]
  );

  const filteredCards = useMemo(() => {
    if (activeTab === "all") return cards;
    if (activeTab === "oracle") return cards.filter((c) => c.cardType === "general");
    return cards.filter((c) => c.cardType === "obstacle" || c.cardType === "threshold");
  }, [cards, activeTab]);

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
      {/* Filter tabs — only show if deck has journey cards */}
      {hasJourneyCards && (
        <div className="flex gap-1.5 mb-4">
          {([
            { key: "all", label: "All" },
            { key: "oracle", label: "Oracle" },
            { key: "journey", label: "Journey" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === key
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredCards.map((card) => (
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
        card={currentSelectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        onRetryImage={onRetryImage}
        feedbackMap={localFeedback}
        onFeedbackChange={handleFeedbackChange}
      />
    </>
  );
}
