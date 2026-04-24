"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FEEDBACK_CHIPS } from "@/components/studio/refinement-chips";

interface QuickRefineChipsProps {
  cardId: string;
  currentImagePrompt?: string | null;
  onRefineComplete?: (newImageUrl: string) => void;
  disabled?: boolean;
  /** Show 3 chips (compact) or all 5 (full). Default: false */
  compact?: boolean;
  className?: string;
}

export function QuickRefineChips({
  cardId,
  currentImagePrompt,
  onRefineComplete,
  disabled = false,
  compact = false,
  className,
}: QuickRefineChipsProps) {
  const [loadingChip, setLoadingChip] = useState<string | null>(null);

  const chips = compact ? FEEDBACK_CHIPS.slice(0, 3) : FEEDBACK_CHIPS;

  const handleChipClick = useCallback(
    async (label: string, modifier: string) => {
      setLoadingChip(label);
      try {
        const finalPrompt = (currentImagePrompt ?? "") + modifier;
        const res = await fetch(`/api/studio/cards/${cardId}/refine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagePrompt: finalPrompt }),
        });

        const json = await res.json();
        if (json.success && json.data?.imageUrl) {
          toast.success("Card image refined");
          onRefineComplete?.(json.data.imageUrl);
        } else {
          toast.error(json.error ?? "Failed to refine");
        }
      } catch {
        toast.error("Failed to refine card image");
      } finally {
        setLoadingChip(null);
      }
    },
    [cardId, currentImagePrompt, onRefineComplete]
  );

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {chips.map((chip) => (
        <button
          key={chip.label}
          onClick={(e) => {
            e.stopPropagation();
            handleChipClick(chip.label, chip.modifier);
          }}
          disabled={disabled || loadingChip !== null}
          className={cn(
            "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
            "bg-white/5 border border-white/10 text-muted-foreground",
            "hover:bg-white/10 hover:text-foreground hover:border-white/20",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {loadingChip === chip.label ? (
            <Loader2 className="h-3 w-3 animate-spin inline" />
          ) : (
            chip.label
          )}
        </button>
      ))}
    </div>
  );
}
