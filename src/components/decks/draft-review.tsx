"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DraftReviewList } from "@/components/decks/draft-review-list";
import { DraftReviewSwipe } from "@/components/decks/draft-review-swipe";
import { DraftReviewGrid } from "@/components/decks/draft-review-grid";
import { CardEditModal } from "@/components/decks/card-edit-modal";
import { cn } from "@/lib/utils";
import {
  List,
  Layers,
  LayoutGrid,
  Loader2,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_DRAFT_REVIEW } from "@/components/guide/lyra-constants";
import type { DraftCard } from "@/types";

type ViewMode = "list" | "swipe" | "grid";

interface DraftReviewProps {
  deckId: string;
  deckTitle: string;
  initialDraftCards: DraftCard[];
}

export function DraftReview({
  deckId,
  deckTitle,
  initialDraftCards,
}: DraftReviewProps) {
  const router = useRouter();
  const [draftCards, setDraftCards] = useState<DraftCard[]>(initialDraftCards);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingCard, setEditingCard] = useState<DraftCard | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removedCount = draftCards.filter((c) => c.removed).length;
  const keptCount = draftCards.length - removedCount;

  function handleToggle(cardNumber: number) {
    setDraftCards((prev) =>
      prev.map((c) =>
        c.cardNumber === cardNumber ? { ...c, removed: !c.removed } : c
      )
    );

    // Persist toggle to server
    const card = draftCards.find((c) => c.cardNumber === cardNumber);
    const newRemoved = !card?.removed;
    fetch(`/api/decks/${deckId}/drafts`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: [
          {
            cardNumber,
            action: newRemoved ? "remove" : "keep",
          },
        ],
      }),
    }).catch(() => {
      // Revert on failure
      setDraftCards((prev) =>
        prev.map((c) =>
          c.cardNumber === cardNumber ? { ...c, removed: !newRemoved } : c
        )
      );
    });
  }

  function handleEdit(card: DraftCard) {
    setEditingCard(card);
  }

  async function handleSaveEdit(edited: {
    title: string;
    meaning: string;
    guidance: string;
  }) {
    if (!editingCard) return;

    const cardNumber = editingCard.cardNumber;

    // Optimistic update
    setDraftCards((prev) =>
      prev.map((c) =>
        c.cardNumber === cardNumber
          ? {
              ...c,
              ...edited,
              previousVersion: {
                title: c.title,
                meaning: c.meaning,
                guidance: c.guidance,
                imagePrompt: c.imagePrompt,
              },
            }
          : c
      )
    );
    setEditingCard(null);

    try {
      const res = await fetch(`/api/decks/${deckId}/drafts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [{ cardNumber, action: "edit", edits: edited }],
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDraftCards(json.data.draftCards);
      }
    } catch {
      // Optimistic update stays; next refresh will sync
    }
  }

  async function handleAiEdit(
    cardNumber: number,
    instruction: string
  ): Promise<DraftCard> {
    const res = await fetch(`/api/decks/${deckId}/drafts/ai-edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardNumber, instruction }),
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error ?? "Failed to edit card");
    }

    const updatedCard = json.data.card as DraftCard;
    setDraftCards((prev) =>
      prev.map((c) => (c.cardNumber === cardNumber ? updatedCard : c))
    );
    return updatedCard;
  }

  async function handleReplace() {
    setIsReplacing(true);
    setError(null);

    try {
      const res = await fetch(`/api/decks/${deckId}/drafts/replace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to generate replacements");
        return;
      }

      setDraftCards(json.data.draftCards);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsReplacing(false);
    }
  }

  async function handleFinalize() {
    setIsFinalizing(true);
    setError(null);

    try {
      const res = await fetch(`/api/decks/${deckId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Failed to finalize deck");
        return;
      }

      // Fire-and-forget image generation
      fetch("/api/ai/generate-images-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId }),
      });

      router.push(`/decks/${deckId}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsFinalizing(false);
    }
  }

  function handleBackToChat() {
    router.push(`/decks/new/journey/${deckId}/chat`);
  }

  const viewModes: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "list", label: "List", icon: <List className="h-4 w-4" /> },
    { key: "swipe", label: "Swipe", icon: <Layers className="h-4 w-4" /> },
    { key: "grid", label: "Grid", icon: <LayoutGrid className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToChat}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <LyraSigil size="sm" state="attentive" />
            <div>
              <h1 className="text-xl font-bold">{LYRA_DRAFT_REVIEW.title}</h1>
              <p className="text-sm text-muted-foreground">
                {keptCount} kept, {removedCount} removed — {deckTitle}
              </p>
            </div>
          </div>
        </div>

        {/* View mode selector */}
        <div className="flex gap-1">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                viewMode === mode.key
                  ? "bg-gold/20 border-gold text-gold"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {mode.icon}
              <span className="hidden sm:inline">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      <div className="min-h-[400px]">
        {viewMode === "list" && (
          <DraftReviewList
            cards={draftCards}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        )}
        {viewMode === "swipe" && (
          <DraftReviewSwipe
            cards={draftCards}
            onToggle={handleToggle}
            onAiEdit={handleAiEdit}
            onFinalize={handleFinalize}
            onReplace={handleReplace}
            onBackToChat={handleBackToChat}
            isFinalizing={isFinalizing}
            isReplacing={isReplacing}
          />
        )}
        {viewMode === "grid" && (
          <DraftReviewGrid
            cards={draftCards}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Bottom actions (hidden in swipe mode — swipe has its own summary actions) */}
      {viewMode !== "swipe" && (
        <div className="flex gap-3 pt-2 border-t border-border/50">
          {removedCount > 0 && (
            <Button
              variant="outline"
              onClick={handleReplace}
              disabled={isReplacing || isFinalizing}
            >
              {isReplacing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Replacing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {LYRA_DRAFT_REVIEW.replaceButton(removedCount)}
                </>
              )}
            </Button>
          )}

          <Button
            className="ml-auto"
            onClick={handleFinalize}
            disabled={keptCount === 0 || isReplacing || isFinalizing}
          >
            {isFinalizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {LYRA_DRAFT_REVIEW.finalizeButton(keptCount)}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Edit modal (used by list/grid views) */}
      <CardEditModal
        card={editingCard}
        open={!!editingCard}
        onOpenChange={(open) => {
          if (!open) setEditingCard(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
