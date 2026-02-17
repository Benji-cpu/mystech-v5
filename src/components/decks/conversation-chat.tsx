"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReadinessIndicator } from "@/components/decks/readiness-indicator";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Sparkles,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { JOURNEY_OPENING_MESSAGE } from "@/lib/ai/prompts/conversation";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import type { ConversationMessage, JourneyReadinessState } from "@/types";
import type { UIMessage } from "ai";

function getMessageText(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

const POST_GENERATION_MESSAGE = `I've crafted your cards based on our conversation! Review them and make any edits you'd like. You can always come back here if you want me to make broader changes across your deck.`;

interface ConversationChatProps {
  deckId: string;
  deckTitle: string;
  initialMessages: ConversationMessage[];
  initialReadiness: JourneyReadinessState;
  hasDraftCards?: boolean;
}

export function ConversationChat({
  deckId,
  deckTitle,
  initialMessages,
  initialReadiness,
  hasDraftCards: initialHasDraftCards = false,
}: ConversationChatProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [readiness, setReadiness] = useState<JourneyReadinessState>(initialReadiness);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [hasDraftCards, setHasDraftCards] = useState(initialHasDraftCards);
  const prevMessageCountRef = useRef(0);
  const prevStreamTextRef = useRef("");
  const { preferences: voicePrefs } = useVoicePreferences();
  const tts = useTextToSpeech({
    voiceId: voicePrefs.voiceId ?? undefined,
    speed: voicePrefs.speed,
    enabled: voicePrefs.enabled && voicePrefs.autoplay,
  });

  // Convert DB messages to UIMessage format
  const initialUIMessages: UIMessage[] = useMemo(
    () =>
      initialMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          parts: [{ type: "text" as const, text: m.content }],
        })),
    [initialMessages]
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/conversation",
        body: { deckId },
      }),
    [deckId]
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: initialUIMessages,
    onFinish: async () => {
      // Refresh readiness state after each exchange
      try {
        const res = await fetch(`/api/decks/${deckId}/conversation`);
        const json = await res.json();
        if (json.success) {
          setReadiness(json.data.readiness);
        }
      } catch {
        // Non-critical: readiness will update on next exchange
      }
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";

  // Feed streaming assistant messages to TTS
  useEffect(() => {
    if (!isStreaming || !voicePrefs.enabled || !voicePrefs.autoplay) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;

    const text = getMessageText(lastMsg);
    const prevLen = prevStreamTextRef.current.length;
    if (text.length > prevLen) {
      const delta = text.slice(prevLen);
      tts.pushToken(delta);
    }
    prevStreamTextRef.current = text;
  }, [messages, isStreaming, voicePrefs.enabled, voicePrefs.autoplay, tts]);

  // Flush TTS when streaming ends
  useEffect(() => {
    if (!isStreaming && prevStreamTextRef.current.length > 0) {
      tts.flush();
      prevStreamTextRef.current = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  // Mic transcript handler
  const handleMicTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        setInputText(text);
      }
    },
    []
  );

  // Build display messages — always prepend the opening message
  const displayMessages: Array<{ id: string; role: "user" | "assistant"; text: string }> = [
    { id: "opening", role: "assistant", text: JOURNEY_OPENING_MESSAGE },
    ...messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      text: getMessageText(m),
    })),
    ...(hasDraftCards
      ? [{ id: "post-generation", role: "assistant" as const, text: POST_GENERATION_MESSAGE }]
      : []),
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages]);

  // Handle "Generate Cards" click
  async function handleGenerate() {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/ai/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "journey", deckId }),
      });

      const json = await res.json();
      if (!json.success) {
        setGenerateError(json.error ?? "Failed to generate cards");
        return;
      }

      setHasDraftCards(true);
    } catch {
      setGenerateError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || isStreaming || isGenerating) return;
    setInputText("");
    sendMessage({ text });
  }

  // Handle Enter key (submit on Enter, newline on Shift+Enter)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/decks/new")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{deckTitle}</h1>
            <p className="text-xs text-muted-foreground">Guided Journey</p>
          </div>
        </div>
        <ReadinessIndicator readiness={readiness} />
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-4 min-h-0"
      >
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <LyraSigil
                size="sm"
                state={
                  message.id === displayMessages[displayMessages.length - 1]?.id && isStreaming
                    ? "speaking"
                    : "attentive"
                }
                className="flex-shrink-0"
              />
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-[#c9a94e]/10 text-foreground"
                  : "bg-card border border-border/50 text-foreground"
              )}
            >
              {message.text.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isStreaming && displayMessages[displayMessages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3 justify-start">
            <LyraSigil size="sm" state="speaking" className="flex-shrink-0" />
            <div className="bg-card border border-border/50 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error messages */}
      {(error || generateError) && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 mb-2">
          {error?.message || generateError}
        </div>
      )}

      {/* View Draft Cards button (when drafts exist) */}
      {hasDraftCards && !isGenerating && (
        <div className="pb-2">
          <Button
            onClick={() => router.push(`/decks/new/journey/${deckId}/review`)}
            className="w-full bg-[#c9a94e]/20 border border-[#c9a94e] text-[#c9a94e] hover:bg-[#c9a94e]/30"
            size="lg"
          >
            <Layers className="h-4 w-4 mr-2" />
            View Draft Cards
          </Button>
        </div>
      )}

      {/* Generate button (when ready but no drafts yet) */}
      {readiness.isReady && !hasDraftCards && !isGenerating && (
        <div className="pb-2">
          <Button
            onClick={handleGenerate}
            className="w-full bg-[#c9a94e]/20 border border-[#c9a94e] text-[#c9a94e] hover:bg-[#c9a94e]/30"
            size="lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate My Cards
          </Button>
        </div>
      )}

      {isGenerating && (
        <div className="pb-2">
          <Button disabled className="w-full" size="lg">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating your cards...
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share your thoughts..."
          disabled={isStreaming || isGenerating}
          rows={1}
          className="min-h-[44px] max-h-[120px] resize-none"
        />
        <MicrophoneButton onTranscript={handleMicTranscript} />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!inputText.trim() || isStreaming || isGenerating}
          className="flex-shrink-0 h-[44px] w-[44px]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
