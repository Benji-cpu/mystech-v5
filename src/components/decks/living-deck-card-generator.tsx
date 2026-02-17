"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Sun } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LivingDeckGenerationMode } from "@/types";

interface GeneratedCard {
  id: string;
  cardNumber: number;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imageStatus: string;
  createdAt: string;
}

interface LivingDeckCardGeneratorProps {
  generationMode: LivingDeckGenerationMode;
  canGenerateToday: boolean;
  todayCard?: GeneratedCard | null;
  onCardGenerated?: (card: GeneratedCard) => void;
  className?: string;
}

export function LivingDeckCardGenerator({
  generationMode,
  canGenerateToday,
  todayCard: initialTodayCard,
  onCardGenerated,
  className,
}: LivingDeckCardGeneratorProps) {
  const [reflection, setReflection] = useState("");
  const [generating, setGenerating] = useState(false);
  const [todayCard, setTodayCard] = useState<GeneratedCard | null>(initialTodayCard ?? null);

  async function handleGenerate() {
    if (generationMode === "manual" && reflection.trim().length === 0) {
      toast.error("Write a reflection first");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/decks/living/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: generationMode,
          reflection: generationMode === "manual" ? reflection.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to generate card");
        return;
      }
      setTodayCard(json.card);
      setReflection("");
      onCardGenerated?.(json.card);
      toast.success("Today's card has been created!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  if (todayCard || !canGenerateToday) {
    return (
      <Card className={cn("border-primary/20 bg-primary/5", className)}>
        <CardContent className="pt-6 text-center space-y-3">
          <Sun className="h-8 w-8 text-primary mx-auto" />
          {todayCard ? (
            <>
              <h3 className="text-lg font-semibold">{todayCard.title}</h3>
              <p className="text-sm text-muted-foreground">{todayCard.meaning}</p>
              <p className="text-sm italic text-muted-foreground/80">{todayCard.guidance}</p>
            </>
          ) : (
            <>
              <h3 className="font-medium">Today&apos;s card is ready</h3>
              <p className="text-sm text-muted-foreground">Come back tomorrow for a new card.</p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Create Today&apos;s Card</h3>
        </div>

        {generationMode === "manual" ? (
          <>
            <Textarea
              placeholder="What's alive for you today? Write a reflection and a card will be crafted from your words..."
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              maxLength={2000}
              disabled={generating}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reflection.length}/2000
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Lyra will create today&apos;s card based on your reading history, deck themes, and life context.
          </p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating || (generationMode === "manual" && reflection.trim().length === 0)}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating your card...
            </>
          ) : (
            "Create Today's Card"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
