"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StylePickerGrid } from "@/components/art-styles/style-picker-grid";
import { useDeckGeneration } from "@/hooks/use-deck-generation";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import type { ArtStyle } from "@/types";

interface SimpleCreateFormProps {
  presets: ArtStyle[];
  customStyles: ArtStyle[];
  atLimit: boolean;
}

// Spiritual numbers: trinity, chakras, zodiac, major arcana
const CARD_COUNT_PRESETS = [3, 7, 12, 22];

export function SimpleCreateForm({
  presets,
  customStyles,
  atLimit,
}: SimpleCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cardCount, setCardCount] = useState(3);
  const [isCustomCount, setIsCustomCount] = useState(false);
  const [customCountInput, setCustomCountInput] = useState("");
  const [artStyleId, setArtStyleId] = useState<string>(presets[0]?.id ?? "");

  const { generate, isGenerating, error } = useDeckGeneration();

  const canSubmit =
    !atLimit &&
    !isGenerating &&
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    artStyleId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    await generate({
      title: title.trim(),
      description: description.trim(),
      cardCount,
      artStyleId,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quick Create a Deck</h1>
        <p className="text-muted-foreground mt-1">
          Describe your deck theme and we&apos;ll generate it for you.
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
          placeholder='e.g. "Grandmother&apos;s Garden"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isGenerating}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Describe your deck theme</Label>
        <Textarea
          id="description"
          placeholder="A deck inspired by my grandmother's garden and the seasons of life. The flowers, the herbs, the changing light through the year..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isGenerating}
          rows={4}
          maxLength={1000}
        />
      </div>

      {/* Card Count */}
      <div className="space-y-2">
        <Label>Number of Cards</Label>
        <div className="flex flex-wrap gap-2">
          {CARD_COUNT_PRESETS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => {
                setCardCount(count);
                setIsCustomCount(false);
                setCustomCountInput("");
              }}
              disabled={isGenerating}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors border",
                !isCustomCount && cardCount === count
                  ? "bg-[#c9a94e]/20 border-[#c9a94e] text-[#c9a94e]"
                  : "border-border hover:border-[#c9a94e]/30 text-muted-foreground hover:text-foreground"
              )}
            >
              {count}
            </button>
          ))}
          {isCustomCount ? (
            <Input
              type="number"
              min={1}
              max={30}
              value={customCountInput}
              onChange={(e) => {
                const val = e.target.value;
                setCustomCountInput(val);
                const num = parseInt(val, 10);
                if (!isNaN(num) && num >= 1 && num <= 30) {
                  setCardCount(num);
                }
              }}
              onBlur={() => {
                if (!customCountInput || parseInt(customCountInput, 10) < 1) {
                  setIsCustomCount(false);
                  setCardCount(3);
                }
              }}
              disabled={isGenerating}
              className="w-20"
              autoFocus
              placeholder="1-30"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsCustomCount(true)}
              disabled={isGenerating}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors border border-border hover:border-[#c9a94e]/30 text-muted-foreground hover:text-foreground"
            >
              Custom
            </button>
          )}
        </div>
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

      {/* Credit Preview */}
      <div className="text-sm text-muted-foreground">
        This will use {cardCount} card credits and {cardCount} image credits.
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!canSubmit}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate My Deck
          </>
        )}
      </Button>
    </form>
  );
}
