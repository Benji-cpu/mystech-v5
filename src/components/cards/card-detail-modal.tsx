"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, RotateCcw, Wand2, Download } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CardFeedbackButton } from "@/components/cards/card-feedback-button";
import { QuickRefineChips } from "@/components/studio/quick-refine-chips";
import { CARD_TYPE_CONFIG } from "@/components/cards/card-type-config";
import { showUpgradeModal } from "@/components/billing/upgrade-modal";
import { ORIGIN_SOURCE, type CardDetailData, type CardFeedbackType, type CardType } from "@/types";

interface CardDetailModalProps {
  card: CardDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRetryImage?: (cardId: string) => void;
  onCardImageUpdated?: (cardId: string, newImageUrl: string) => void;
  showFeedback?: boolean;
  feedbackMap?: Record<string, CardFeedbackType>;
  onFeedbackChange?: (cardId: string, feedback: CardFeedbackType | null) => void;
}

export function CardDetailModal({
  card,
  open,
  onOpenChange,
  onRetryImage,
  onCardImageUpdated,
  showFeedback = false,
  feedbackMap,
  onFeedbackChange,
}: CardDetailModalProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!card) return null;

  const handleDownload = async () => {
    if (!card.imageUrl || card.imageStatus !== "completed") return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/cards/${card.id}/download`);
      if (res.status === 402) {
        showUpgradeModal({
          reason: "print_download",
          message: "Download the full-resolution artwork to print or share. Pro unlocks this and more.",
        });
        return;
      }
      if (!res.ok) {
        toast.error("Download failed. Please try again.");
        return;
      }
      const filename =
        res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ??
        `${card.title}.png`;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setIsFlipped(false);
    }
    onOpenChange(nextOpen);
  };

  const cardType = (card.cardType ?? 'general') as CardType;
  const typeConfig = CARD_TYPE_CONFIG[cardType];
  const TypeIcon = typeConfig.icon;
  const isSpecial = cardType !== 'general';

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
            <div className={cn(
              "absolute inset-0 rounded-xl overflow-hidden border bg-card shadow-lg [backface-visibility:hidden]",
              typeConfig.borderClass,
              typeConfig.glowClass,
            )}>
              <CardImage card={card} onRetryImage={onRetryImage} />
              {isSpecial && (
                <div className={cn(
                  "absolute top-3 left-3 z-10 flex h-7 w-7 items-center justify-center rounded-full",
                  typeConfig.badgeClass,
                )}>
                  <TypeIcon className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                <h3 className="text-base font-semibold text-white leading-tight">
                  {card.title}
                </h3>
              </div>
            </div>

            {/* Back face — meaning & guidance */}
            <div className={cn(
              "absolute inset-0 rounded-xl overflow-hidden border bg-card shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]",
              typeConfig.borderClass,
              typeConfig.glowClass,
            )}>
              <div className="flex flex-col h-full p-5 sm:p-6 overflow-y-auto bg-gradient-to-b from-surface-deep to-surface-mid">
                {isSpecial && (
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                    <TypeIcon className="h-3 w-3" />
                    {typeConfig.label}
                  </p>
                )}
                <h3 className="text-lg font-semibold text-gold mb-4">
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
                {card.originContext && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">
                      {card.originContext.source === ORIGIN_SOURCE.CHRONICLE_EMERGENCE ? 'Emerged from Pattern' : 'Journey Origin'}
                    </p>
                    <p className="text-xs text-white/50">
                      {card.originContext.source === ORIGIN_SOURCE.CHRONICLE_EMERGENCE
                        ? `✦ ${card.originContext.detectedPattern ?? 'Emerged from your Chronicle'}`
                        : card.originContext.retreatName
                          ? `Forged during: ${card.originContext.retreatName}`
                          : card.originContext.source === ORIGIN_SOURCE.OBSTACLE_DETECTION
                            ? `Pattern detected: ${card.originContext.detectedPattern ?? 'recurring card'}`
                            : 'Earned through practice'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick refine chips — show when front face visible and image ready */}
        {!isFlipped && card.imageStatus === "completed" && card.imageUrl && (
          <div className="flex justify-center mt-2">
            <QuickRefineChips
              cardId={card.id}
              currentImagePrompt={card.imagePrompt}
              onRefineComplete={(newUrl) => onCardImageUpdated?.(card.id, newUrl)}
              compact
            />
          </div>
        )}

        {/* Hint + Studio link */}
        <div className="flex items-center justify-center gap-3 mt-1">
          <p className="text-xs text-muted-foreground/60 select-none">
            {isFlipped ? "Tap to see image" : "Tap to reveal meaning"}
          </p>
          {card.imageStatus === "completed" && card.imageUrl && (
            <>
              <span className="text-muted-foreground/20">·</span>
              <Link
                href={`/studio/cards/${card.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Wand2 className="h-3 w-3" />
                Refine in Studio
              </Link>
              <span className="text-muted-foreground/20">·</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                disabled={downloading}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Download className="h-3 w-3" />
                )}
                Print-quality
              </button>
            </>
          )}
        </div>

        {/* Feedback button */}
        {showFeedback && (
          <div className="flex justify-center mt-2">
            <CardFeedbackButton
              cardId={card.id}
              initialFeedback={feedbackMap?.[card.id] ?? null}
              onFeedbackChange={onFeedbackChange}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CardImage({
  card,
  onRetryImage,
}: {
  card: CardDetailData;
  onRetryImage?: (cardId: string) => void;
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
            sizes="(min-width: 640px) 480px, 90vw"
            priority
            placeholder={card.imageBlurData ? "blur" : "empty"}
            blurDataURL={card.imageBlurData ?? undefined}
            className="object-cover"
          />
        ) : card.imageStatus === "none" ? (
          <div className="h-full w-full bg-gradient-to-b from-surface-mid via-surface-deep to-surface-mid" />
        ) : card.imageStatus === "generating" ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-surface-deep to-surface-mid">
            <Loader2 className="h-10 w-10 animate-spin text-gold/60" />
          </div>
        ) : card.imageStatus === "failed" ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-surface-deep to-surface-mid">
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
        ) : (
          <Skeleton className="h-full w-full rounded-none bg-surface-mid" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
