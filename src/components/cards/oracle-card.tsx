"use client";

import Image from "next/image";
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
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
}

const DEFAULT_SIZES: Record<"sm" | "md" | "lg" | "fill", string> = {
  sm: "128px",
  md: "192px",
  lg: "256px",
  fill: "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw",
};

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
  priority,
  sizes,
  blurDataURL,
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
        <CardImage
          card={card}
          onRetryImage={onRetryImage}
          priority={priority}
          sizes={sizes ?? DEFAULT_SIZES[size]}
          blurDataURL={blurDataURL ?? card.imageBlurData ?? undefined}
        />
        {isSpecial && (
          <div className={cn(
            "absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full",
            typeConfig.badgeClass,
          )}>
            <TypeIcon className="h-3 w-3" />
          </div>
        )}
        {card.originContext?.source === ORIGIN_SOURCE.CHRONICLE_EMERGENCE && (
          <span className="absolute top-2 right-2 z-10 text-gold/40 text-xs leading-none" aria-label="Emerged from pattern">
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
  priority,
  sizes,
  blurDataURL,
}: {
  card: CardDetailData;
  onRetryImage?: () => void;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
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
        className="relative h-full w-full"
      >
        {card.imageStatus === "completed" && card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes={sizes}
            priority={priority}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
            className="object-cover"
          />
        ) : card.imageStatus === "none" ? (
          <div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(to bottom, var(--paper-card), var(--paper-warm), var(--paper-card))",
            }}
          />
        ) : card.imageStatus === "generating" ? (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(to bottom, var(--paper-card), var(--paper-warm))",
            }}
          >
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: "var(--accent-gold)" }}
            />
          </div>
        ) : card.imageStatus === "failed" ? (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2"
            style={{
              background:
                "linear-gradient(to bottom, var(--paper-card), var(--paper-warm))",
            }}
          >
            <AlertCircle className="h-6 w-6" style={{ color: "#b83a2b" }} />
            {onRetryImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRetryImage();
                }}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "var(--ink-mute)" }}
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        ) : (
          <Skeleton
            className="h-full w-full rounded-none"
            style={{ background: "var(--paper-warm)" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
