"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Card } from "@/types";

interface OracleCardProps {
  card: Card;
  onRetryImage?: () => void;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeClasses = {
  sm: "w-32",
  md: "w-48",
  lg: "w-64",
};

export function OracleCard({
  card,
  onRetryImage,
  size = "md",
  onClick,
}: OracleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={cn("perspective-1000", sizeClasses[size])}
      onClick={handleClick}
    >
      <div
        className={cn(
          "relative aspect-[2/3] cursor-pointer transition-transform duration-500",
          "[transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        {/* Front */}
        <div className="absolute inset-0 rounded-xl overflow-hidden border border-border/50 bg-card shadow-lg [backface-visibility:hidden]">
          <CardImage card={card} onRetryImage={onRetryImage} />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
            <h3 className="text-sm font-semibold text-white leading-tight">
              {card.title}
            </h3>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rounded-xl overflow-hidden border border-border/50 bg-card shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex flex-col h-full p-4 overflow-hidden bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
            <h3 className="text-sm font-semibold text-[#c9a94e] mb-2 line-clamp-1">
              {card.title}
            </h3>
            <div className="mb-3 flex-shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Meaning
              </p>
              <p className="text-xs text-foreground/90 leading-relaxed line-clamp-3">
                {card.meaning}
              </p>
            </div>
            <div className="flex-1 min-h-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Guidance
              </p>
              <p className="text-xs text-foreground/80 leading-relaxed italic line-clamp-4">
                {card.guidance}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardImage({
  card,
  onRetryImage,
}: {
  card: Card;
  onRetryImage?: () => void;
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
        <Loader2 className="h-8 w-8 animate-spin text-[#c9a94e]/60" />
      </div>
    );
  }

  if (card.imageStatus === "failed") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
        <AlertCircle className="h-6 w-6 text-red-400/60" />
        {onRetryImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetryImage();
            }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Retry
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
