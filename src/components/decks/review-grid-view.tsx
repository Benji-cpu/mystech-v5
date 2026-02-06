"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, RefreshCw, Undo2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftCard } from "@/types";

interface ReviewGridViewProps {
  cards: DraftCard[];
  onEdit: (cardNumber: number, instruction: string) => Promise<void>;
  onRegenerate: (cardNumber: number) => Promise<void>;
  onUndo: (cardNumber: number) => Promise<void>;
}

export function ReviewGridView({
  cards,
  onEdit,
  onRegenerate,
  onUndo,
}: ReviewGridViewProps) {
  const [selectedCard, setSelectedCard] = useState<DraftCard | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [loadingCard, setLoadingCard] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState<"edit" | "regenerate" | "undo" | null>(null);

  async function handleEdit() {
    if (!selectedCard || !editInstruction.trim()) return;

    setLoadingCard(selectedCard.cardNumber);
    setLoadingAction("edit");
    try {
      await onEdit(selectedCard.cardNumber, editInstruction.trim());
      setEditInstruction("");
    } finally {
      setLoadingCard(null);
      setLoadingAction(null);
    }
  }

  async function handleRegenerate() {
    if (!selectedCard) return;

    setLoadingCard(selectedCard.cardNumber);
    setLoadingAction("regenerate");
    try {
      await onRegenerate(selectedCard.cardNumber);
    } finally {
      setLoadingCard(null);
      setLoadingAction(null);
    }
  }

  async function handleUndo() {
    if (!selectedCard) return;

    setLoadingCard(selectedCard.cardNumber);
    setLoadingAction("undo");
    try {
      await onUndo(selectedCard.cardNumber);
    } finally {
      setLoadingCard(null);
      setLoadingAction(null);
    }
  }

  const isLoading = loadingCard !== null;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {cards.map((card) => {
          const isSelected = selectedCard?.cardNumber === card.cardNumber;
          const hasUndo = !!card.previousVersion;

          return (
            <button
              key={card.cardNumber}
              onClick={() => setSelectedCard(isSelected ? null : card)}
              className={cn(
                "text-left p-4 rounded-lg border transition-all",
                isSelected
                  ? "ring-2 ring-[#c9a94e] bg-[#c9a94e]/10"
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Card {card.cardNumber}
                </span>
                {hasUndo && (
                  <span className="text-xs text-[#c9a94e]">Modified</span>
                )}
              </div>
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {card.meaning}
              </p>
            </button>
          );
        })}
      </div>

      {/* Card Detail Panel */}
      {selectedCard && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg p-4 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Card {selectedCard.cardNumber}
                  </span>
                  {selectedCard.previousVersion && (
                    <span className="text-xs text-[#c9a94e]">Modified</span>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{selectedCard.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedCard.previousVersion && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={isLoading}
                  >
                    {loadingAction === "undo" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Undo2 className="w-4 h-4 mr-2" />
                    )}
                    Undo
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                >
                  {loadingAction === "regenerate" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Regenerate
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCard(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-muted-foreground">Meaning:</span>
                <p className="text-sm mt-1">{selectedCard.meaning}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Guidance:</span>
                <p className="text-sm mt-1">{selectedCard.guidance}</p>
              </div>
            </div>

            {/* Edit Input */}
            <div className="flex gap-2">
              <Input
                placeholder="How should this card change?"
                value={editInstruction}
                onChange={(e) => setEditInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                onClick={handleEdit}
                disabled={!editInstruction.trim() || isLoading}
              >
                {loadingAction === "edit" ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Pencil className="w-4 h-4 mr-2" />
                )}
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
