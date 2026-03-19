"use client";

import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CARD_TYPE_CONFIG } from "@/components/cards/card-type-config";
import { ORIGIN_SOURCE, type CardDetailData, type CardType } from "@/types";

interface OracleCardProps {
  card: CardDetailData;
  onRetryImage?: () => void;
  size?: "sm" | "md" | "lg" | "fill";
  onClick?: () => void;
  hideTitle?: boolean;
}

const sizeClasses = {
  sm: "w-32",
  md: "w-48",
  lg: "w-64",
  fill: "w-full",
};

export function OracleCard({
  card,
  onRetryImage,
  size = "md",
  onClick,
  hideTitle,
}: OracleCardProps) {
  const cardType = (card.cardType ?? 'general') as CardType;
  const typeConfig = CARD_TYPE_CONFIG[cardType];
  const TypeIcon = typeConfig.icon;
  const isSpecial = cardType !== 'general';

  return (
    <div
      className={cn(sizeClasses[size], onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <div className={cn(
        "relative aspect-[2/3] rounded-xl overflow-hidden border bg-card shadow-lg",
        typeConfig.borderClass,
        typeConfig.glowClass,
      )}>
        <CardImage card={card} onRetryImage={onRetryImage} />
        {isSpecial && (
          <div className={cn(
            "absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full",
            typeConfig.badgeClass,
          )}>
            <TypeIcon className="h-3 w-3" />
          </div>
        )}
        {card.originContext?.source === ORIGIN_SOURCE.CHRONICLE_EMERGENCE && (
          <span className="absolute top-2 right-2 z-10 text-[#c9a94e]/40 text-xs leading-none" aria-label="Emerged from pattern">
            ✦
          </span>
        )}
        {!hideTitle && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
            <h3 className="text-sm font-semibold text-white leading-tight">
              {card.title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}

function CardImage({
  card,
  onRetryImage,
}: {
  card: CardDetailData;
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

  if (card.imageStatus === "none") {
    return (
      <div className="h-full w-full bg-gradient-to-b from-[#1a0530] via-[#0a0118] to-[#1a0530]" />
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
