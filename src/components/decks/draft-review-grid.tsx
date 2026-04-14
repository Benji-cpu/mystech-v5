"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { useCardDetailModal } from "@/hooks/use-card-detail-modal";
import { draftToCardDetail } from "./draft-card-utils";
import type { DraftCard, CardDetailData } from "@/types";

interface DraftReviewGridProps {
  cards: DraftCard[];
  onToggle: (cardNumber: number) => void;
  onEdit: (card: DraftCard) => void;
}

export function DraftReviewGrid({
  cards,
  onToggle,
  onEdit,
}: DraftReviewGridProps) {
  const { openCard, modalProps } = useCardDetailModal<CardDetailData>();

  return (
    <>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.cardNumber}
          className={cn(
            "group relative aspect-[2/3] rounded-xl border p-3 flex flex-col cursor-pointer transition-all",
            card.removed
              ? "border-red-500/20 bg-red-500/5 opacity-40"
              : "border-border/50 bg-card hover:border-gold/30"
          )}
          onClick={() => {
            if (!card.removed) {
              openCard(draftToCardDetail(card));
            }
          }}
        >
          {/* Toggle button (top-right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(card.cardNumber);
            }}
            className={cn(
              "absolute top-2 right-2 h-6 w-6 rounded-full border flex items-center justify-center transition-colors z-10",
              card.removed
                ? "border-red-500/40 bg-red-500/10 text-red-400"
                : "border-gold/40 bg-gold/10 text-gold"
            )}
          >
            {card.removed ? (
              <X className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </button>

          {/* Edit button (bottom-right) */}
          {!card.removed && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={(e) => { e.stopPropagation(); onEdit(card); }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}

          {/* Card number */}
          <span className="text-[10px] text-muted-foreground mb-1">
            #{card.cardNumber}
          </span>

          {/* Title */}
          <h4
            className={cn(
              "text-sm font-semibold leading-tight mb-2",
              card.removed && "line-through"
            )}
          >
            {card.title}
          </h4>

          {/* Meaning preview */}
          <p className="text-[11px] text-muted-foreground leading-snug line-clamp-4 flex-1">
            {card.meaning}
          </p>

          {/* Status badge */}
          {card.removed && (
            <div className="mt-auto pt-2">
              <span className="text-[10px] font-medium text-red-400">
                REMOVED
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
    <CardDetailModal {...modalProps} />
    </>
  );
}
