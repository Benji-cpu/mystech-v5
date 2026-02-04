"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import type { Card } from "@/types";

interface CardDetailModalProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetryImage?: (cardId: string) => void;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onRetryImage,
}: CardDetailModalProps) {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#c9a94e]">{card.title}</DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="aspect-[2/3] w-full max-w-xs mx-auto rounded-xl overflow-hidden border border-border/50">
          {card.imageStatus === "completed" && card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.title}
              className="h-full w-full object-cover"
            />
          ) : card.imageStatus === "generating" ? (
            <div className="flex h-full w-full items-center justify-center bg-[#1a0530]">
              <Loader2 className="h-10 w-10 animate-spin text-[#c9a94e]/60" />
            </div>
          ) : card.imageStatus === "failed" ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#1a0530]">
              <AlertCircle className="h-8 w-8 text-red-400/60" />
              {onRetryImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRetryImage(card.id)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Regenerate Image
                </Button>
              )}
            </div>
          ) : (
            <Skeleton className="h-full w-full rounded-none bg-[#1a0530]" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Meaning
            </h4>
            <p className="text-sm leading-relaxed">{card.meaning}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Guidance
            </h4>
            <p className="text-sm leading-relaxed italic text-foreground/80">
              {card.guidance}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
