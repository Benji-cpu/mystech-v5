"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { draftToCardDetail } from "./draft-card-utils";
import type { DraftCard, CardDetailData } from "@/types";

interface DraftReviewListProps {
  cards: DraftCard[];
  onToggle: (cardNumber: number) => void;
  onEdit: (card: DraftCard) => void;
}

export function DraftReviewList({
  cards,
  onToggle,
  onEdit,
}: DraftReviewListProps) {
  const { openCard, modalProps } = useCardDetailModal<CardDetailData>();

  return (
    <>
    <div className="space-y-2">
      {cards.map((card) => (
        <div
          key={card.cardNumber}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
            card.removed
              ? "border-red-500/20 bg-red-500/5 opacity-60"
              : "border-border/50 bg-card hover:border-gold/30"
          )}
          onClick={() => {
            if (!card.removed) {
              openCard(draftToCardDetail(card));
            }
          }}
        >
          {/* Toggle button */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(card.cardNumber); }}
            className={cn(
              "flex-shrink-0 mt-0.5 h-6 w-6 rounded-md border flex items-center justify-center transition-colors",
              card.removed
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-gold/40 bg-gold/10 text-gold"
            )}
          >
            {card.removed ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Card info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                #{card.cardNumber}
              </span>
              <span
                className={cn(
                  "font-medium text-sm",
                  card.removed && "line-through"
                )}
              >
                {card.title}
              </span>
              {card.removed && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  REMOVED
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {card.meaning}
            </p>
          </div>

          {/* Edit button */}
          {!card.removed && (
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
    <CardDetailModal {...modalProps} />
    </>
  );
}
