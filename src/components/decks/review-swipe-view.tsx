"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftCard } from "@/types";

interface ReviewSwipeViewProps {
  cards: DraftCard[];
  onRegenerate: (cardNumber: number) => Promise<void>;
  onComplete: () => void;
}

export function ReviewSwipeView({
  cards,
  onRegenerate,
  onComplete,
}: ReviewSwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [regeneratingCards, setRegeneratingCards] = useState<Set<number>>(new Set());
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const startX = useRef(0);
  const isDragging = useRef(false);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;
  const SWIPE_THRESHOLD = 100;

  const handleSwipeRight = useCallback(() => {
    if (isAnimating || !currentCard) return;
    setIsAnimating(true);
    setSwipeOffset(window.innerWidth);

    setTimeout(() => {
      setReviewedCards((prev) => new Set([...prev, currentCard.cardNumber]));
      setCurrentIndex((prev) => prev + 1);
      setSwipeOffset(0);
      setIsAnimating(false);
    }, 300);
  }, [currentCard, isAnimating]);

  const handleSwipeLeft = useCallback(async () => {
    if (isAnimating || !currentCard) return;

    // Start regeneration in background
    setRegeneratingCards((prev) => new Set([...prev, currentCard.cardNumber]));

    // Animate card out
    setIsAnimating(true);
    setSwipeOffset(-window.innerWidth);

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeOffset(0);
      setIsAnimating(false);
    }, 300);

    // Regenerate in background
    try {
      await onRegenerate(currentCard.cardNumber);
    } finally {
      setRegeneratingCards((prev) => {
        const next = new Set(prev);
        next.delete(currentCard.cardNumber);
        return next;
      });
    }
  }, [currentCard, isAnimating, onRegenerate]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (isAnimating) return;
    startX.current = e.clientX;
    isDragging.current = true;
  }, [isAnimating]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const diff = e.clientX - startX.current;
    setSwipeOffset(diff);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
      if (swipeOffset > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      setSwipeOffset(0);
    }
  }, [swipeOffset, handleSwipeRight, handleSwipeLeft]);

  if (isComplete) {
    const regeneratingCount = regeneratingCards.size;

    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Review Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You&apos;ve reviewed all {cards.length} cards.
            {regeneratingCount > 0 && (
              <span className="block mt-2">
                {regeneratingCount} card{regeneratingCount > 1 ? "s" : ""} still regenerating...
              </span>
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(0);
                setReviewedCards(new Set());
              }}
            >
              Review Again
            </Button>
            <Button onClick={onComplete} disabled={regeneratingCount > 0}>
              {regeneratingCount > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Waiting...
                </>
              ) : (
                "Finalize Deck"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const rotation = (swipeOffset / window.innerWidth) * 15;
  const opacity = 1 - Math.abs(swipeOffset) / (window.innerWidth * 2);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 touch-none">
      {/* Progress */}
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </p>
        <div className="flex gap-1 mt-2 justify-center">
          {cards.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < currentIndex
                  ? "bg-[#c9a94e]"
                  : i === currentIndex
                  ? "bg-primary"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative w-full max-w-sm aspect-[2/3]">
        {/* Current Card */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-[#1a1225] to-[#0a0118] border rounded-xl p-6 cursor-grab active:cursor-grabbing",
            isAnimating && "transition-transform duration-300"
          )}
          style={{
            transform: `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
            opacity,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Swipe Hints */}
          {swipeOffset > 30 && (
            <div className="absolute top-4 left-4 text-green-500 font-bold text-lg border-2 border-green-500 rounded px-2 py-1 rotate-[-15deg]">
              KEEP
            </div>
          )}
          {swipeOffset < -30 && (
            <div className="absolute top-4 right-4 text-red-500 font-bold text-lg border-2 border-red-500 rounded px-2 py-1 rotate-[15deg]">
              REDO
            </div>
          )}

          <div className="h-full flex flex-col">
            <div className="text-xs text-muted-foreground mb-2">
              Card {currentCard.cardNumber}
            </div>
            <h3 className="text-xl font-bold mb-4">{currentCard.title}</h3>
            <div className="flex-1 overflow-y-auto">
              <p className="text-sm text-muted-foreground mb-4">
                {currentCard.meaning}
              </p>
              <p className="text-sm">{currentCard.guidance}</p>
            </div>
          </div>
        </div>

        {/* Next Card Preview */}
        {currentIndex + 1 < cards.length && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1225] to-[#0a0118] border rounded-xl p-6 -z-10 scale-95 opacity-50">
            <div className="h-full flex flex-col">
              <div className="text-xs text-muted-foreground mb-2">
                Card {cards[currentIndex + 1].cardNumber}
              </div>
              <h3 className="text-xl font-bold">{cards[currentIndex + 1].title}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 flex items-center gap-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Swipe left to regenerate
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4" />
          Swipe right to keep
        </div>
      </div>

      {/* Button Fallbacks */}
      <div className="mt-4 flex gap-4">
        <Button variant="outline" onClick={handleSwipeLeft}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
        <Button onClick={handleSwipeRight}>
          <Check className="w-4 h-4 mr-2" />
          Keep
        </Button>
      </div>
    </div>
  );
}
