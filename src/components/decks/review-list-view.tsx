"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, RefreshCw, Undo2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DraftCard } from "@/types";

interface ReviewListViewProps {
  cards: DraftCard[];
  onEdit: (cardNumber: number, instruction: string) => Promise<void>;
  onRegenerate: (cardNumber: number) => Promise<void>;
  onUndo: (cardNumber: number) => Promise<void>;
}

export function ReviewListView({
  cards,
  onEdit,
  onRegenerate,
  onUndo,
}: ReviewListViewProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [loadingCard, setLoadingCard] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState<"edit" | "regenerate" | "undo" | null>(null);

  async function handleEdit(cardNumber: number) {
    if (!editInstruction.trim()) return;

    setLoadingCard(cardNumber);
    setLoadingAction("edit");
    try {
      await onEdit(cardNumber, editInstruction.trim());
      setEditInstruction("");
      setExpandedCard(null);
    } finally {
      setLoadingCard(null);
      setLoadingAction(null);
    }
  }

  async function handleRegenerate(cardNumber: number) {
    setLoadingCard(cardNumber);
    setLoadingAction("regenerate");
    try {
      await onRegenerate(cardNumber);
    } finally {
      setLoadingCard(null);
      setLoadingAction(null);
    }
  }

  async function handleUndo(cardNumber: number) {
    setLoadingCard(cardNumber);
    setLoadingAction("undo");
    try {
      await onUndo(cardNumber);
    } finally {
      setLoadingCard(null);
      setLoadingAction(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {cards.map((card) => {
          const isExpanded = expandedCard === card.cardNumber;
          const isLoading = loadingCard === card.cardNumber;
          const hasUndo = !!card.previousVersion;

          return (
            <div
              key={card.cardNumber}
              className={cn(
                "border rounded-lg transition-all",
                isExpanded ? "bg-muted/50" : "hover:bg-muted/30"
              )}
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Card {card.cardNumber}
                      </span>
                      {hasUndo && (
                        <span className="text-xs text-[#c9a94e]">Modified</span>
                      )}
                    </div>
                    <h3 className="font-semibold mt-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {card.meaning}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {hasUndo && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUndo(card.cardNumber)}
                        disabled={isLoading}
                        title="Undo changes"
                      >
                        {isLoading && loadingAction === "undo" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Undo2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedCard(isExpanded ? null : card.cardNumber)
                      }
                      title="Edit card"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRegenerate(card.cardNumber)}
                      disabled={isLoading}
                      title="Regenerate card"
                    >
                      {isLoading && loadingAction === "regenerate" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setExpandedCard(isExpanded ? null : card.cardNumber)
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Full Card Content */}
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Meaning:</span>
                      <p className="mt-1">{card.meaning}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guidance:</span>
                      <p className="mt-1">{card.guidance}</p>
                    </div>
                  </div>

                  {/* Edit Input */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      placeholder="How should this card change?"
                      value={editInstruction}
                      onChange={(e) => setEditInstruction(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleEdit(card.cardNumber);
                        }
                      }}
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => handleEdit(card.cardNumber)}
                      disabled={!editInstruction.trim() || isLoading}
                    >
                      {isLoading && loadingAction === "edit" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
