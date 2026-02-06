"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, List, Grid, Layers, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReviewListView } from "./review-list-view";
import { ReviewGridView } from "./review-grid-view";
import { ReviewSwipeView } from "./review-swipe-view";
import { FinalizeConfirmDialog } from "./finalize-confirm-dialog";
import type { DraftCard } from "@/types";

type ViewMode = "list" | "grid" | "swipe";

interface DraftReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: string;
  deckTitle: string;
  artStyleId?: string;
  draftCards: DraftCard[];
  onCardUpdate: (cards: DraftCard[]) => void;
  isGenerating: boolean;
}

export function DraftReviewModal({
  isOpen,
  onClose,
  deckId,
  deckTitle,
  artStyleId,
  draftCards,
  onCardUpdate,
  isGenerating,
}: DraftReviewModalProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!isOpen) return null;

  async function handleFinalize() {
    setIsFinalizing(true);

    try {
      const response = await fetch(`/api/decks/${deckId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artStyleId }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/decks/${deckId}`);
      } else {
        console.error("Failed to finalize:", data.error);
        alert(data.error || "Failed to finalize deck. Please try again.");
      }
    } catch (error) {
      console.error("Failed to finalize:", error);
      alert("Failed to finalize deck. Please try again.");
    } finally {
      setIsFinalizing(false);
      setShowConfirmDialog(false);
    }
  }

  async function handleCardEdit(cardNumber: number, instruction: string) {
    try {
      const response = await fetch(`/api/decks/${deckId}/drafts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, instruction }),
      });

      const data = await response.json();

      if (data.success && data.data?.draftCards) {
        onCardUpdate(data.data.draftCards);
      }
    } catch (error) {
      console.error("Failed to edit card:", error);
    }
  }

  async function handleCardRegenerate(cardNumber: number) {
    try {
      const response = await fetch(`/api/decks/${deckId}/drafts/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber }),
      });

      const data = await response.json();

      if (data.success && data.data?.draftCards) {
        onCardUpdate(data.data.draftCards);
      }
    } catch (error) {
      console.error("Failed to regenerate card:", error);
    }
  }

  async function handleCardUndo(cardNumber: number) {
    const card = draftCards.find((c) => c.cardNumber === cardNumber);
    if (!card?.previousVersion) return;

    const updatedCards = draftCards.map((c) => {
      if (c.cardNumber === cardNumber && c.previousVersion) {
        return {
          ...c.previousVersion,
          cardNumber,
          previousVersion: undefined,
        };
      }
      return c;
    });

    try {
      const response = await fetch(`/api/decks/${deckId}/drafts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: updatedCards }),
      });

      const data = await response.json();

      if (data.success) {
        onCardUpdate(updatedCards);
      }
    } catch (error) {
      console.error("Failed to undo:", error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex flex-col bg-background">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h2 className="font-semibold">{deckTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {draftCards.length} cards • Review and refine
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center border rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === "list"
                    ? "bg-[#c9a94e]/20 text-[#c9a94e]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === "grid"
                    ? "bg-[#c9a94e]/20 text-[#c9a94e]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("swipe")}
                className={cn(
                  "p-2 rounded transition-colors",
                  viewMode === "swipe"
                    ? "bg-[#c9a94e]/20 text-[#c9a94e]"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Swipe view"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Finalize Button */}
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={isFinalizing || isGenerating || draftCards.length === 0}
            >
              {isFinalizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Finalize Deck
                </>
              )}
            </Button>

            {/* Close Button */}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#c9a94e]" />
              <p className="text-muted-foreground">
                Crafting your cards from our conversation...
              </p>
            </div>
          ) : viewMode === "list" ? (
            <ReviewListView
              cards={draftCards}
              onEdit={handleCardEdit}
              onRegenerate={handleCardRegenerate}
              onUndo={handleCardUndo}
            />
          ) : viewMode === "grid" ? (
            <ReviewGridView
              cards={draftCards}
              onEdit={handleCardEdit}
              onRegenerate={handleCardRegenerate}
              onUndo={handleCardUndo}
            />
          ) : (
            <ReviewSwipeView
              cards={draftCards}
              onRegenerate={handleCardRegenerate}
              onComplete={() => setShowConfirmDialog(true)}
            />
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <FinalizeConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleFinalize}
        cardCount={draftCards.length}
        isLoading={isFinalizing}
      />
    </div>
  );
}
