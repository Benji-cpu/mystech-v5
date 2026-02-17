"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_READING_FLOW } from "@/components/guide/lyra-constants";
import { DeckSelector } from "./deck-selector";
import { SpreadSelector } from "./spread-selector";
import { IntentionInput } from "./intention-input";
import { CardDrawScene } from "./card-draw-scene";
import { toast } from "sonner";
import type { Deck, PlanType, SpreadType, Card } from "@/types";

interface ReadingFlowProps {
  decks: Deck[];
  userPlan?: PlanType;
  /** @deprecated Use userPlan instead */
  userRole?: string;
}

type Step = "deck" | "spread" | "intention" | "draw";

export function ReadingFlow({ decks, userPlan, userRole }: ReadingFlowProps) {
  const [step, setStep] = useState<Step>("deck");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [question, setQuestion] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [drawnCards, setDrawnCards] = useState<
    { card: Card; positionName: string }[]
  >([]);

  const selectedDeck = decks.find((d) => d.id === selectedDeckId) ?? null;

  const canProceed = (() => {
    switch (step) {
      case "deck":
        return !!selectedDeckId;
      case "spread":
        return !!selectedSpread;
      case "intention":
        return true; // question is optional
      default:
        return false;
    }
  })();

  const steps: Step[] = ["deck", "spread", "intention", "draw"];
  const currentIndex = steps.indexOf(step);

  const goBack = () => {
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const goNext = async () => {
    if (step === "intention") {
      // Create the reading via API
      await createReading();
    } else if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const createReading = async () => {
    if (!selectedDeckId || !selectedSpread) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: selectedDeckId,
          spreadType: selectedSpread,
          question: question.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to create reading");
        setIsCreating(false);
        return;
      }

      setReadingId(data.data.reading.id);
      setDrawnCards(
        data.data.cards.map(
          (rc: { card: Card; positionName: string }) => ({
            card: rc.card,
            positionName: rc.positionName,
          })
        )
      );
      setStep("draw");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const stepLabels: Record<Step, string> = {
    deck: "Select Deck",
    spread: "Choose Spread",
    intention: "Set Intention",
    draw: "Draw Cards",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicator */}
      {step !== "draw" && (
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.slice(0, 3).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <LyraSigil
                  size="sm"
                  state={
                    i < currentIndex
                      ? "attentive"
                      : i === currentIndex
                        ? "speaking"
                        : "dormant"
                  }
                />
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  i <= currentIndex
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {stepLabels[s]}
              </span>
              {i < 2 && (
                <div
                  className={`w-8 h-px ${
                    i < currentIndex ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === "deck" && (
          <DeckSelector
            decks={decks}
            selectedDeckId={selectedDeckId}
            onSelect={setSelectedDeckId}
          />
        )}

        {step === "spread" && selectedDeck && (
          <SpreadSelector
            selectedSpread={selectedSpread}
            onSelect={setSelectedSpread}
            deckCardCount={selectedDeck.cardCount}
            userPlan={userPlan}
            userRole={userRole}
          />
        )}

        {step === "intention" && (
          <IntentionInput question={question} onChange={setQuestion} />
        )}

        {step === "draw" && selectedSpread && drawnCards.length > 0 && readingId && (
          <CardDrawScene
            spreadType={selectedSpread}
            cards={drawnCards}
            readingId={readingId}
          />
        )}
      </div>

      {/* Navigation buttons */}
      {step !== "draw" && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={goNext}
            disabled={!canProceed || isCreating}
            className="gap-2"
          >
            {isCreating ? (
              <>
                <LyraSigil size="sm" state="speaking" />
                {LYRA_READING_FLOW.drawingButton}
              </>
            ) : step === "intention" ? (
              <>
                <LyraSigil size="sm" state="attentive" />
                {LYRA_READING_FLOW.drawButton}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
