"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CardFeedbackButton } from "@/components/cards/card-feedback-button";
import type { Card, CardFeedbackType } from "@/types";

interface CardDetailModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetryImage?: (cardId: string) => void;
  feedbackMap?: Record<string, CardFeedbackType>;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onRetryImage,
  feedbackMap,
}: CardDetailModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!card) return null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsFlipped(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md p-4 sm:p-6 border-border/50 bg-background/95 backdrop-blur">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">{card.title}</DialogTitle>

        {/* Flippable card */}
        <div
          className="perspective-1000 max-w-sm w-full mx-auto cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className={cn(
              "relative aspect-[2/3] transition-transform duration-500",
              "[transform-style:preserve-3d]",
              isFlipped && "[transform:rotateY(180deg)]"
            )}
          >
            {/* Front face — image */}
            <div className="absolute inset-0 rounded-xl overflow-hidden border border-border/50 bg-card shadow-lg [backface-visibility:hidden]">
              <CardImage card={card} onRetryImage={onRetryImage} />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                <h3 className="text-base font-semibold text-white leading-tight">
                  {card.title}
                </h3>
              </div>
            </div>

            {/* Back face — meaning & guidance */}
            <div className="absolute inset-0 rounded-xl overflow-hidden border border-border/50 bg-card shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="flex flex-col h-full p-5 sm:p-6 overflow-y-auto bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
                <h3 className="text-lg font-semibold text-[#c9a94e] mb-4">
                  {card.title}
                </h3>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1.5">
                    Meaning
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {card.meaning}
                  </p>
                </div>
                <div className="flex-1 min-h-0">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1.5">
                    Guidance
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed italic">
                    {card.guidance}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-muted-foreground/60 mt-2 select-none">
          {isFlipped ? "Tap to see image" : "Tap to reveal meaning"}
        </p>

        {/* Feedback button */}
        <div className="flex justify-center mt-2">
          <CardFeedbackButton
            cardId={card.id}
            initialFeedback={feedbackMap?.[card.id] ?? null}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CardImage({
  card,
  onRetryImage,
}: {
  card: Card;
  onRetryImage?: (cardId: string) => void;
}) {
  if (card.imageStatus === "completed" && card.imageUrl) {
    return (
      <img
        src={card.imageUrl}
        alt={card.title}
        className="h-full w-full object-cover"
      />
    );
  }

  if (card.imageStatus === "generating") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
        <Loader2 className="h-10 w-10 animate-spin text-[#c9a94e]/60" />
      </div>
    );
  }

  if (card.imageStatus === "failed") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
        <AlertCircle className="h-8 w-8 text-red-400/60" />
        {onRetryImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetryImage(card.id);
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border/50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Regenerate Image
          </button>
        )}
      </div>
    );
  }

  // Pending
  return (
    <Skeleton className="h-full w-full rounded-none bg-[#1a0530]" />
  );
}
