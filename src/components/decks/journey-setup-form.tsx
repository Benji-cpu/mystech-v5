"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StylePickerGrid } from "@/components/art-styles/style-picker-grid";
import { cn } from "@/lib/utils";
import { MessageCircle, Loader2, AlertCircle } from "lucide-react";
import type { ArtStyle } from "@/types";

interface JourneySetupFormProps {
  presets: ArtStyle[];
  customStyles: ArtStyle[];
  atLimit: boolean;
}

// Spiritual numbers for journey mode
const CARD_COUNT_PRESETS = [5, 10, 15, 20];

export function JourneySetupForm({
  presets,
  customStyles,
  atLimit,
}: JourneySetupFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [artStyleId, setArtStyleId] = useState<string>(presets[0]?.id ?? "");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    !atLimit && !isCreating && title.trim().length > 0 && theme.trim().length > 0 && artStyleId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsCreating(true);
    setError(null);

    try {
      // Create a draft deck for the journey
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          theme: theme.trim(),
          cardCount,
          artStyleId,
          status: "draft",
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to create deck");
        setIsCreating(false);
        return;
      }

      // Navigate to the chat page
      router.push(`/decks/new/journey/${data.data.id}/chat`);
    } catch {
      setError("Failed to create deck. Please try again.");
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Begin Your Journey</h1>
        <p className="text-muted-foreground mt-1">
          Through guided conversation, we&apos;ll explore your theme together
          and craft a deeply personal oracle deck.
        </p>
      </div>

      {atLimit && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          You&apos;ve reached the free tier limit of 2 decks. Upgrade to Pro for
          unlimited decks.
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Deck Name</Label>
        <Input
          id="title"
          placeholder='e.g. "Paths of Healing"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isCreating}
          maxLength={100}
        />
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label htmlFor="theme">What would you like to explore?</Label>
        <Textarea
          id="theme"
          placeholder="My journey through grief and finding peace... The lessons from my first year of parenthood... Navigating a major career change..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={isCreating}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          This is just a starting point — we&apos;ll explore deeper together.
        </p>
      </div>

      {/* Card Count */}
      <div className="space-y-2">
        <Label>Target Number of Cards</Label>
        <div className="flex flex-wrap gap-2">
          {CARD_COUNT_PRESETS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setCardCount(count)}
              disabled={isCreating}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors border",
                cardCount === count
                  ? "bg-[#c9a94e]/20 border-[#c9a94e] text-[#c9a94e]"
                  : "border-border hover:border-[#c9a94e]/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          The conversation will guide you to gather enough material for this
          many cards.
        </p>
      </div>

      {/* Art Style */}
      <div className="space-y-2">
        <Label>Art Style</Label>
        <StylePickerGrid
          presets={presets}
          customStyles={customStyles}
          selectedStyleId={artStyleId}
          onSelect={setArtStyleId}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Starting Journey...
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4 mr-2" />
            Begin Journey
          </>
        )}
      </Button>
    </form>
  );
}
