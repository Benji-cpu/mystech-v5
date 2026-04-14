"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LYRA_READING_DETAIL } from "@/components/guide/lyra-constants";
import type { ReadingFeedback as FeedbackType } from "@/types";

interface ReadingFeedbackProps {
  readingId: string;
  existingFeedback: FeedbackType | null;
}

export function ReadingFeedback({
  readingId,
  existingFeedback,
}: ReadingFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackType | null>(
    existingFeedback
  );
  const [loading, setLoading] = useState(false);

  async function handleFeedback(value: FeedbackType) {
    setLoading(true);
    try {
      if (feedback === value) {
        // Remove feedback
        const res = await fetch(`/api/readings/${readingId}/feedback`, {
          method: "DELETE",
        });
        if (res.ok) setFeedback(null);
      } else {
        // Set feedback
        const res = await fetch(`/api/readings/${readingId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback: value }),
        });
        if (res.ok) setFeedback(value);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1 mt-3">
      <span className="text-xs text-muted-foreground mr-1">
        {LYRA_READING_DETAIL.feedbackPrompt}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${
          feedback === "positive"
            ? "text-gold hover:text-gold"
            : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}
        onClick={() => handleFeedback("positive")}
        disabled={loading}
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${
          feedback === "negative"
            ? "text-gold hover:text-gold"
            : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}
        onClick={() => handleFeedback("negative")}
        disabled={loading}
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
