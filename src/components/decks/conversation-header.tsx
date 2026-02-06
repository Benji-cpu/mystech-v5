"use client";

import { Button } from "@/components/ui/button";
import { ReadinessIndicator } from "./readiness-indicator";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { JourneyReadinessState } from "@/types";

interface ConversationHeaderProps {
  deckTitle: string;
  readiness: JourneyReadinessState;
  onGenerateCards: () => void;
  isGenerating: boolean;
  hasDrafts: boolean;
}

export function ConversationHeader({
  deckTitle,
  readiness,
  onGenerateCards,
  isGenerating,
  hasDrafts,
}: ConversationHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/decks/new"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-semibold">{deckTitle}</h1>
            <ReadinessIndicator readiness={readiness} className="mt-0.5" />
          </div>
        </div>
        <Button
          onClick={onGenerateCards}
          disabled={isGenerating}
          variant={readiness.isReady ? "default" : "outline"}
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : hasDrafts ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate Cards
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Cards
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
