"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CardFeedbackType } from "@/types";

interface CardFeedbackButtonProps {
  cardId: string;
  initialFeedback?: CardFeedbackType | null;
  onFeedbackChange?: (cardId: string, feedback: CardFeedbackType | null) => void;
  size?: "sm" | "md";
  className?: string;
}

export function CardFeedbackButton({
  cardId,
  initialFeedback = null,
  onFeedbackChange,
  size = "md",
  className,
}: CardFeedbackButtonProps) {
  const [feedback, setFeedback] = useState<CardFeedbackType | null>(
    initialFeedback ?? null
  );
  const [saving, setSaving] = useState(false);

  const isLoved = feedback === "loved";

  async function toggleLoved(e: React.MouseEvent) {
    e.stopPropagation();
    if (saving) return;

    const previous = feedback;
    const next = isLoved ? null : ("loved" as CardFeedbackType);
    setFeedback(next);
    setSaving(true);

    try {
      if (next === null) {
        const res = await fetch(`/api/cards/${cardId}/feedback`, {
          method: "DELETE",
        });
        if (!res.ok) {
          setFeedback(previous);
          toast.error("Failed to remove feedback");
        } else {
          onFeedbackChange?.(cardId, next);
        }
      } else {
        const res = await fetch(`/api/cards/${cardId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: next }),
        });
        if (!res.ok) {
          setFeedback(previous);
          toast.error("Failed to save feedback");
        } else {
          onFeedbackChange?.(cardId, next);
        }
      }
    } catch {
      setFeedback(previous);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={toggleLoved}
      disabled={saving}
      className={cn(
        "rounded-full p-1.5 transition-all",
        "hover:bg-white/10 active:scale-90",
        "disabled:opacity-50",
        isLoved && "text-red-400",
        !isLoved && "text-white/40 hover:text-white/70",
        className
      )}
      aria-label={isLoved ? "Remove from loved" : "Love this card"}
    >
      <Heart className={cn(iconSize, isLoved && "fill-current")} />
    </button>
  );
}
