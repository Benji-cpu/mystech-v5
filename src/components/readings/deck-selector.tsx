"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Layers, ChevronDown } from "lucide-react";
import { LyraEmptyState } from "@/components/guide/lyra-empty-state";
import { LYRA_READING_FLOW } from "@/components/guide/lyra-constants";
import type { Deck } from "@/types";

interface DeckSelectorProps {
  decks: Deck[];
  /** Multi-select: array of selected deck IDs */
  selectedDeckIds?: string[];
  /** Multi-select: toggle a deck in/out */
  onToggle?: (deckId: string) => void;
  /** @deprecated Single-select mode — use selectedDeckIds + onToggle */
  selectedDeckId?: string | null;
  /** @deprecated Single-select mode — use onToggle */
  onSelect?: (deckId: string) => void;
  compact?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  /** Controlled expanded state — overrides internal state when provided */
  expanded?: boolean;
  /** Callback when header is clicked in controlled mode */
  onToggleExpanded?: () => void;
  className?: string;
}

export function DeckSelector({
  decks,
  selectedDeckIds,
  onToggle,
  selectedDeckId,
  onSelect,
  compact,
  collapsible,
  defaultExpanded = true,
  expanded: controlledExpanded,
  onToggleExpanded,
  className,
}: DeckSelectorProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  const handleToggle = () => {
    if (isControlled) {
      onToggleExpanded?.();
    } else {
      setInternalExpanded(!expanded);
    }
  };

  // Resolve multi-select vs single-select props
  const resolvedIds: string[] = selectedDeckIds ?? (selectedDeckId ? [selectedDeckId] : []);
  const handleSelect = (deckId: string) => {
    if (onToggle) {
      onToggle(deckId);
    } else if (onSelect) {
      onSelect(deckId);
    }
  };

  if (decks.length === 0) {
    return (
      <LyraEmptyState
        message={LYRA_READING_FLOW.deckSelector.emptyMessage}
        actionLabel={LYRA_READING_FLOW.deckSelector.emptyAction}
        actionHref="/decks/new"
      />
    );
  }

  // Single deck: auto-selected label
  const selectedDeck = decks.find((d) => resolvedIds.includes(d.id)) ?? null;
  if (compact && selectedDeck) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-[#1a0530] to-[#0a0118] border border-white/10 shrink-0">
          {selectedDeck.coverImageUrl ? (
            <img
              src={selectedDeck.coverImageUrl}
              alt={selectedDeck.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary/30" />
            </div>
          )}
        </div>
        <span className="text-sm text-white/60">
          Reading from: <span className="text-white/80 font-medium">{selectedDeck.title}</span>
        </span>
      </div>
    );
  }

  // Summary text for collapsed state
  const selectedDecks = decks.filter((d) => resolvedIds.includes(d.id));
  const summaryText =
    selectedDecks.length === 0
      ? "No deck selected"
      : selectedDecks.length === 1
        ? selectedDecks[0].title
        : `${selectedDecks.length} decks selected`;

  const content = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {decks.map((deck) => {
        const isSelected = resolvedIds.includes(deck.id);
        return (
          <button
            key={deck.id}
            onClick={() => handleSelect(deck.id)}
            className={cn(
              "relative rounded-xl p-3 text-left transition-all border",
              "hover:border-primary/50 hover:bg-accent/50",
              isSelected
                ? "border-primary bg-accent shadow-[0_0_20px_rgba(201,169,78,0.15)]"
                : "border-border/50 bg-card/50"
            )}
          >
            {/* Cover image or gradient */}
            <div className="aspect-[3/2] rounded-lg overflow-hidden mb-2 bg-gradient-to-br from-[#1a0530] to-[#0a0118]">
              {deck.coverImageUrl ? (
                <img
                  src={deck.coverImageUrl}
                  alt={deck.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Layers className="h-8 w-8 text-primary/30" />
                </div>
              )}
            </div>

            <p className="font-medium text-sm truncate">{deck.title}</p>
            <p className="text-xs text-muted-foreground">
              {deck.cardCount} cards
            </p>

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  if (collapsible) {
    return (
      <div className={cn(className)}>
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between py-2 px-1 text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/70">Your Decks</span>
            {!expanded && (
              <span className="text-xs text-white/40">({summaryText})</span>
            )}
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
          </motion.div>
        </button>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="pb-2">{content}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <label className="text-sm font-medium text-white/70 mb-3 block">
        Choose {onToggle ? "your decks" : "a deck"}
      </label>
      {content}
    </div>
  );
}
