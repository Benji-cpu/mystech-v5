"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardEditInline } from "@/components/decks/card-edit-inline";
import {
  Check,
  X,
  Pencil,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import type { DraftCard } from "@/types";

interface DraftReviewSwipeProps {
  cards: DraftCard[];
  onToggle: (cardNumber: number) => void;
  onAiEdit: (cardNumber: number, instruction: string) => Promise<DraftCard>;
  onFinalize: () => void;
  onReplace: () => void;
  onBackToChat: () => void;
  isFinalizing: boolean;
  isReplacing: boolean;
}

const SWIPE_THRESHOLD = 100;
const FLY_OFF_DURATION = 300;

export function DraftReviewSwipe({
  cards,
  onToggle,
  onAiEdit,
  onFinalize,
  onReplace,
  onBackToChat,
  isFinalizing,
  isReplacing,
}: DraftReviewSwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flyDirection, setFlyDirection] = useState<"left" | "right" | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [editingCardNumber, setEditingCardNumber] = useState<number | null>(null);
  const [isAiEditing, setIsAiEditing] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const card = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;

  // Dismiss hint on first interaction
  const dismissHint = useCallback(() => {
    if (showHint) setShowHint(false);
  }, [showHint]);

  // --- Mouse drag handlers ---
  function handleMouseDown(e: React.MouseEvent) {
    if (editingCardNumber !== null) return;
    dismissHint();
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setDragX(0);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !dragStartRef.current) return;
    const delta = e.clientX - dragStartRef.current.x;
    setDragX(delta);
  }

  function handleMouseUp() {
    if (!isDragging) return;
    resolveSwipe(dragX);
    setIsDragging(false);
    dragStartRef.current = null;
  }

  // Cleanup mouse listeners on window if mouse leaves container
  useEffect(() => {
    function handleGlobalMouseUp() {
      if (isDragging) {
        resolveSwipe(dragX);
        setIsDragging(false);
        dragStartRef.current = null;
      }
    }
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, dragX]);

  // --- Touch drag handlers ---
  function handleTouchStart(e: React.TouchEvent) {
    if (editingCardNumber !== null) return;
    dismissHint();
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setIsDragging(true);
    setDragX(0);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!isDragging || !dragStartRef.current) return;
    const delta = e.touches[0].clientX - dragStartRef.current.x;
    setDragX(delta);
  }

  function handleTouchEnd() {
    if (!isDragging) return;
    resolveSwipe(dragX);
    setIsDragging(false);
    dragStartRef.current = null;
  }

  // --- Swipe resolution ---
  function resolveSwipe(delta: number) {
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      const direction = delta > 0 ? "right" : "left";
      setFlyDirection(direction);

      // Mark card as kept (right) or removed (left)
      if (card) {
        const shouldBeRemoved = direction === "left";
        const isCurrentlyRemoved = !!card.removed;
        if (shouldBeRemoved !== isCurrentlyRemoved) {
          onToggle(card.cardNumber);
        }
      }

      // Advance after fly-off animation
      setTimeout(() => {
        setFlyDirection(null);
        setDragX(0);
        setCurrentIndex((i) => i + 1);
        setEditingCardNumber(null);
      }, FLY_OFF_DURATION);
    } else {
      setDragX(0);
    }
  }

  // --- AI edit ---
  async function handleAiEdit(cardNumber: number, instruction: string) {
    setIsAiEditing(true);
    try {
      await onAiEdit(cardNumber, instruction);
      setEditingCardNumber(null);
    } finally {
      setIsAiEditing(false);
    }
  }

  // --- Card transform styles ---
  function getCardStyle(): React.CSSProperties {
    if (flyDirection) {
      const xOff = flyDirection === "right" ? "150%" : "-150%";
      const rotation = flyDirection === "right" ? 30 : -30;
      return {
        transform: `translateX(${xOff}) rotate(${rotation}deg)`,
        opacity: 0,
        transition: `transform ${FLY_OFF_DURATION}ms ease-out, opacity ${FLY_OFF_DURATION}ms ease-out`,
      };
    }
    if (isDragging) {
      return {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.1}deg)`,
        transition: "none",
        cursor: "grabbing",
      };
    }
    return {
      transform: "translateX(0) rotate(0deg)",
      transition: "transform 0.2s ease-out",
      cursor: "grab",
    };
  }

  function getOverlayOpacity(): { keep: number; reject: number } {
    const progress = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
    if (dragX > 0) return { keep: progress, reject: 0 };
    if (dragX < 0) return { keep: 0, reject: progress };
    return { keep: 0, reject: 0 };
  }

  // ---------- Summary screen ----------
  if (isComplete) {
    const kept = cards.filter((c) => !c.removed);
    const rejected = cards.filter((c) => c.removed);

    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6 py-8">
        <div className="text-center space-y-2">
          <Sparkles className="h-8 w-8 text-gold mx-auto mb-2" />
          <h2 className="text-2xl font-bold font-display">Review Complete</h2>
        </div>

        {/* Mini card grid — kept cards only */}
        {kept.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center max-w-md px-4">
            {kept.map((c) => (
              <div
                key={c.cardNumber}
                className="w-16 h-20 rounded-lg border border-gold/30 bg-gold/5 flex items-center justify-center p-1"
              >
                <span className="text-[10px] text-center leading-tight text-muted-foreground line-clamp-3">
                  {c.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Counts */}
        <p className="text-sm text-muted-foreground">
          {kept.length} card{kept.length !== 1 ? "s" : ""} approved
          {rejected.length > 0 && (
            <> &middot; {rejected.length} rejected</>
          )}
        </p>

        {/* Primary CTA */}
        <Button
          onClick={onFinalize}
          disabled={kept.length === 0 || isFinalizing || isReplacing}
          className="w-full max-w-xs bg-gold/20 border border-gold text-gold hover:bg-gold/30"
          size="lg"
        >
          {isFinalizing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Images...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Images for {kept.length} Card{kept.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>

        {/* Secondary actions */}
        <div className="flex gap-3 items-center">
          {rejected.length > 0 && (
            <Button
              variant="outline"
              onClick={onReplace}
              disabled={isReplacing || isFinalizing}
              size="sm"
            >
              {isReplacing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Replacing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Replace Rejected ({rejected.length})
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setCurrentIndex(0);
              setEditingCardNumber(null);
            }}
            disabled={isFinalizing || isReplacing}
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Review Again
          </Button>
        </div>

        {/* Tertiary: back to conversation */}
        <button
          onClick={onBackToChat}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Conversation
        </button>
      </div>
    );
  }

  if (!card) return null;

  const overlay = getOverlayOpacity();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Counter */}
      <p className="text-sm text-muted-foreground">
        {currentIndex + 1} of {cards.length}
      </p>

      {/* Card stack container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-sm h-[420px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          /* handled by global listener */
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Next card peek (if exists) */}
        {currentIndex + 1 < cards.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="aspect-[2/3] w-[85%] rounded-xl border border-border/30 bg-card/50 p-6 flex flex-col"
              style={{
                transform: `scale(${0.95 + Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) * 0.05})`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  #{cards[currentIndex + 1].cardNumber}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground/60">
                {cards[currentIndex + 1].title}
              </h3>
            </div>
          </div>
        )}

        {/* Current card */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none"
          style={getCardStyle()}
        >
          <div className="relative aspect-[2/3] w-[85%] rounded-xl border border-border/50 bg-card p-6 flex flex-col overflow-hidden">
            {/* Keep overlay (green, right) */}
            <div
              className="absolute inset-0 rounded-xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center pointer-events-none z-10"
              style={{ opacity: overlay.keep }}
            >
              <div className="bg-green-500/90 rounded-full p-3">
                <Check className="h-8 w-8 text-white" />
              </div>
              <span className="absolute bottom-6 text-green-400 font-bold text-lg uppercase tracking-wider">
                Keep
              </span>
            </div>

            {/* Reject overlay (red, left) */}
            <div
              className="absolute inset-0 rounded-xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center pointer-events-none z-10"
              style={{ opacity: overlay.reject }}
            >
              <div className="bg-red-500/90 rounded-full p-3">
                <X className="h-8 w-8 text-white" />
              </div>
              <span className="absolute bottom-6 text-red-400 font-bold text-lg uppercase tracking-wider">
                Regenerate
              </span>
            </div>

            {/* Card content */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">
                #{card.cardNumber}
              </span>
            </div>

            <h3 className="text-lg font-semibold mb-3">{card.title}</h3>

            <div className="flex-1 overflow-y-auto space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Meaning
                </p>
                <p className="text-sm leading-relaxed">{card.meaning}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Guidance
                </p>
                <p className="text-sm leading-relaxed italic text-muted-foreground">
                  {card.guidance}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* First-card instruction hint */}
        {showHint && currentIndex === 0 && !isDragging && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
              <p className="text-sm text-white/90">
                <span className="text-red-400">&larr; Swipe left to reject</span>
                <span className="mx-3 text-white/40">&middot;</span>
                <span className="text-green-400">Swipe right to keep &rarr;</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Edit button */}
      {editingCardNumber === null && !flyDirection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setEditingCardNumber(card.cardNumber);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit with AI
        </Button>
      )}

      {/* Inline AI edit */}
      {editingCardNumber === card.cardNumber && (
        <CardEditInline
          cardNumber={card.cardNumber}
          onSubmit={handleAiEdit}
          onClose={() => setEditingCardNumber(null)}
          isLoading={isAiEditing}
        />
      )}
    </div>
  );
}
