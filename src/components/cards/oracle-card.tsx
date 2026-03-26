"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  animated?: boolean;
}

const sizeClasses = {
  sm: "w-32",
  md: "w-48",
  lg: "w-64",
  fill: "w-full",
};

const sizePixels: Record<string, number> = {
  sm: 128,
  md: 192,
  lg: 256,
};

export function OracleCard({
  card,
  onRetryImage,
  size = "md",
  onClick,
  hideTitle,
  animated = false,
}: OracleCardProps) {
  const cardType = (card.cardType ?? 'general') as CardType;
  const typeConfig = CARD_TYPE_CONFIG[cardType];
  const TypeIcon = typeConfig.icon;
  const isSpecial = cardType !== 'general';

  const useAnimation = animated && size !== "fill";
  const Wrapper = useAnimation ? motion.div : "div";
  const wrapperProps = useAnimation ? {
    animate: { width: sizePixels[size] },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  } : {};

  return (
    <Wrapper
      className={cn(!useAnimation && sizeClasses[size], onClick && "cursor-pointer")}
      style={useAnimation ? { width: sizePixels[size] } : undefined}
      onClick={onClick}
      {...wrapperProps}
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
    </Wrapper>
  );
}

function CardImage({
  card,
  onRetryImage,
}: {
  card: CardDetailData;
  onRetryImage?: () => void;
}) {
  const stateKey = `${card.imageStatus}-${card.imageUrl ? 'url' : 'none'}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stateKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="h-full w-full"
      >
        {card.imageStatus === "completed" && card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="h-full w-full object-cover"
          />
        ) : card.imageStatus === "none" ? (
          <div className="h-full w-full bg-gradient-to-b from-[#1a0530] via-[#0a0118] to-[#1a0530]" />
        ) : card.imageStatus === "generating" ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0118] to-[#1a0530]">
            <Loader2 className="h-8 w-8 animate-spin text-[#c9a94e]/60" />
          </div>
        ) : card.imageStatus === "failed" ? (
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
        ) : (
          <Skeleton className="h-full w-full rounded-none bg-[#1a0530]" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
