"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ConversationHeader } from "./conversation-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { FloatingDraftButton } from "./floating-draft-button";
import { DraftReviewModal } from "./draft-review-modal";
import { useReadinessTracker } from "@/hooks/use-readiness-tracker";
import { JOURNEY_OPENING_MESSAGE } from "@/lib/ai/prompts/conversation";
import type { DraftCard } from "@/types";

interface ConversationInterfaceProps {
  deckId: string;
  deckTitle: string;
  deckTheme: string;
  targetCardCount: number;
  artStyleId?: string;
  initialDraftCards: DraftCard[];
  initialAnchorsCount: number;
  initialIsReady: boolean;
}

export function ConversationInterface({
  deckId,
  deckTitle,
  deckTheme,
  targetCardCount,
  artStyleId,
  initialDraftCards,
  initialAnchorsCount,
  initialIsReady,
}: ConversationInterfaceProps) {
  const [draftCards, setDraftCards] = useState<DraftCard[]>(initialDraftCards);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [hasCardUpdates, setHasCardUpdates] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { readiness, refreshReadiness } = useReadinessTracker({
    targetCards: targetCardCount,
    initialAnchorsCount,
    initialIsReady,
    deckId,
  });

  // Create transport with the deckId in the body
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/conversation",
        body: { deckId },
      }),
    [deckId]
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onFinish: () => {
      refreshReadiness();
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Add opening message on mount if no messages
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "opening",
          role: "assistant",
          parts: [{ type: "text" as const, text: JOURNEY_OPENING_MESSAGE }],
        },
      ]);
    }
  }, [messages.length, setMessages]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    await sendMessage({ text: message });
  }, [inputValue, isLoading, sendMessage]);

  // Handle card generation
  async function handleGenerateCards() {
    if (isGeneratingCards) return;

    // Show warning if not ready
    if (!readiness.isReady) {
      const confirmed = window.confirm(
        `We've only found enough material for about ${readiness.anchorsFound} of your ${targetCardCount} cards. ` +
          `The others may feel less personal. Continue anyway?`
      );
      if (!confirmed) return;
    }

    setIsGeneratingCards(true);
    setIsModalOpen(true);

    try {
      const response = await fetch("/api/ai/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId,
          mode: "journey",
          cardCount: targetCardCount,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.draftCards) {
        setDraftCards(data.data.draftCards);
      } else {
        console.error("Failed to generate cards:", data.error);
        alert(data.error || "Failed to generate cards. Please try again.");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to generate cards:", error);
      alert("Failed to generate cards. Please try again.");
      setIsModalOpen(false);
    } finally {
      setIsGeneratingCards(false);
    }
  }

  // Handle card updates from modal
  function handleCardUpdate(updatedCards: DraftCard[]) {
    setDraftCards(updatedCards);
    setHasCardUpdates(true);
  }

  // Clear update indicator when modal opens
  function handleModalOpen() {
    setIsModalOpen(true);
    setHasCardUpdates(false);
  }

  return (
    <div className="flex flex-col h-full relative">
      <ConversationHeader
        deckTitle={deckTitle}
        readiness={readiness}
        onGenerateCards={handleGenerateCards}
        isGenerating={isGeneratingCards}
        hasDrafts={draftCards.length > 0}
      />

      <MessageList messages={messages} isLoading={isLoading} />

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        disabled={isGeneratingCards}
      />

      {draftCards.length > 0 && (
        <FloatingDraftButton
          cardCount={draftCards.length}
          hasUpdates={hasCardUpdates}
          onClick={handleModalOpen}
        />
      )}

      <DraftReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deckId={deckId}
        deckTitle={deckTitle}
        artStyleId={artStyleId}
        draftCards={draftCards}
        onCardUpdate={handleCardUpdate}
        isGenerating={isGeneratingCards}
      />
    </div>
  );
}
