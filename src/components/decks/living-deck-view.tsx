"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LivingDeckCardGenerator } from "./living-deck-card-generator";
import { OracleCard } from "@/components/cards/oracle-card";
import { CardDetailModal } from "@/components/cards/card-detail-modal";
import { CardFeedbackButton } from "@/components/cards/card-feedback-button";
import { Pen, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Card as CardType, LivingDeckGenerationMode, CardFeedbackType } from "@/types";

interface LivingDeckViewProps {
  deckId: string;
  initialCards: CardType[];
  generationMode: LivingDeckGenerationMode;
  canGenerateToday: boolean;
  feedbackMap: Record<string, CardFeedbackType>;
}

export function LivingDeckView({
  deckId,
  initialCards,
  generationMode: initialMode,
  canGenerateToday: initialCanGenerate,
  feedbackMap,
}: LivingDeckViewProps) {
  const [cards, setCards] = useState(initialCards);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [canGenerate, setCanGenerate] = useState(initialCanGenerate);
  const [mode, setMode] = useState<LivingDeckGenerationMode>(initialMode);
  const [savingMode, setSavingMode] = useState(false);

  const currentSelectedCard = selectedCard
    ? cards.find((c) => c.id === selectedCard.id) ?? selectedCard
    : null;

  async function handleModeChange(newMode: LivingDeckGenerationMode) {
    if (newMode === mode) return;
    const previous = mode;
    setMode(newMode);
    setSavingMode(true);
    try {
      const res = await fetch("/api/decks/living/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationMode: newMode }),
      });
      if (!res.ok) {
        setMode(previous);
        toast.error("Failed to update mode");
      }
    } catch {
      setMode(previous);
      toast.error("Something went wrong");
    } finally {
      setSavingMode(false);
    }
  }

  function handleCardGenerated(card: { id: string; cardNumber: number; title: string; meaning: string; guidance: string; imageUrl: string | null; imageStatus: string; createdAt: string }) {
    const newCard: CardType = {
      id: card.id,
      deckId,
      cardNumber: card.cardNumber,
      title: card.title,
      meaning: card.meaning,
      guidance: card.guidance,
      imageUrl: card.imageUrl,
      imagePrompt: null,
      imageStatus: card.imageStatus as CardType["imageStatus"],
      cardType: 'general' as const,
      originContext: null,
      createdAt: new Date(card.createdAt),
    };
    setCards((prev) => [newCard, ...prev]);
    setCanGenerate(false);
  }

  return (
    <div className="space-y-6">
      <LivingDeckCardGenerator
        generationMode={mode}
        canGenerateToday={canGenerate}
        onCardGenerated={handleCardGenerated}
      />

      {/* Mode selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generation Mode</CardTitle>
          <CardDescription>How daily cards are created</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <button
            onClick={() => handleModeChange("manual")}
            disabled={savingMode}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors flex-1",
              mode === "manual"
                ? "border-primary bg-primary/5 font-medium"
                : "border-border hover:border-primary/50"
            )}
          >
            <Pen className="h-4 w-4" />
            Manual
          </button>
          <button
            onClick={() => handleModeChange("auto")}
            disabled={savingMode}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors flex-1",
              mode === "auto"
                ? "border-primary bg-primary/5 font-medium"
                : "border-border hover:border-primary/50"
            )}
          >
            <Wand2 className="h-4 w-4" />
            Auto
          </button>
        </CardContent>
      </Card>

      {/* Card timeline */}
      {cards.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Your Cards ({cards.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {cards.map((card) => (
              <div key={card.id} className="relative group">
                <OracleCard
                  card={card}
                  size="fill"
                  onClick={() => setSelectedCard(card)}
                />
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <CardFeedbackButton
                    cardId={card.id}
                    initialFeedback={feedbackMap[card.id] ?? null}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          <p>No cards yet. Create your first card above!</p>
        </div>
      )}

      <CardDetailModal
        card={currentSelectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
        feedbackMap={feedbackMap}
      />
    </div>
  );
}
