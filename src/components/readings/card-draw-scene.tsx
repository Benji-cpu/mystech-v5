"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { SpreadLayout } from "./spread-layout";
import { ReadingInterpretation } from "./reading-interpretation";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { getCardNarration, CARD_REVEAL_INITIAL } from "@/components/guide/lyra-constants";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import type { Card, SpreadType } from "@/types";

function renderBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface CardDrawSceneProps {
  spreadType: SpreadType;
  cards: { card: Card; positionName: string }[];
  readingId: string;
}

export function CardDrawScene({
  spreadType,
  cards,
  readingId,
}: CardDrawSceneProps) {
  const interpretationRef = useRef<HTMLDivElement>(null);
  const { cardStates, isRevealing, allRevealed, startReveal } = useCardReveal({
    cardCount: cards.length,
    revealDuration: 2000,
    delayBetween: 1500,
  });

  const { preferences: voicePrefs } = useVoicePreferences();
  const tts = useTextToSpeech({
    voiceId: voicePrefs.voiceId ?? undefined,
    speed: voicePrefs.speed,
    enabled: voicePrefs.enabled,
  });

  // Pre-fetch card narration audio
  const [preFetchedAudio, setPreFetchedAudio] = useState<string[]>([]);
  const preFetchTriggered = useRef(false);

  useEffect(() => {
    if (!voicePrefs.enabled || preFetchTriggered.current) return;
    preFetchTriggered.current = true;

    const narrations = cards.map(({ card, positionName }) =>
      getCardNarration(positionName, card.title)
    );

    fetch("/api/voice/tts-batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        texts: narrations,
        voiceId: voicePrefs.voiceId,
        speed: voicePrefs.speed,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.audio) {
          setPreFetchedAudio(data.audio);
        }
      })
      .catch(() => {
        // Pre-fetch failed, narration will be skipped
      });
  }, [voicePrefs.enabled, voicePrefs.voiceId, voicePrefs.speed, cards]);

  // Auto-start card reveal on mount
  useEffect(() => {
    startReveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play pre-cached audio on card reveal
  const lastPlayedRef = useRef(-1);
  useEffect(() => {
    if (!voicePrefs.enabled || preFetchedAudio.length === 0) return;

    const revealingIdx = cardStates.findIndex((s) => s === "revealing");
    if (revealingIdx >= 0 && revealingIdx > lastPlayedRef.current) {
      lastPlayedRef.current = revealingIdx;
      const base64Audio = preFetchedAudio[revealingIdx];
      if (base64Audio) {
        // Decode base64 to ArrayBuffer
        const binaryStr = atob(base64Audio);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        // Use speak method would create new request; instead directly speak the narration
        const narration = getCardNarration(
          cards[revealingIdx].positionName,
          cards[revealingIdx].card.title
        );
        tts.speak(narration);
      }
    }
  }, [cardStates, voicePrefs.enabled, preFetchedAudio, cards, tts]);

  // Scroll interpretation into view once all cards are revealed
  useEffect(() => {
    if (allRevealed && interpretationRef.current) {
      // Small delay to let the interpretation component render
      const timer = setTimeout(() => {
        interpretationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allRevealed]);

  // Find the currently revealing card for narration
  const revealingIndex = cardStates.findIndex((s) => s === "revealing");
  const narrationText = useMemo(() => {
    if (revealingIndex >= 0 && cards[revealingIndex]) {
      const { card, positionName } = cards[revealingIndex];
      return getCardNarration(positionName, card.title);
    }
    if (!isRevealing && !allRevealed) return CARD_REVEAL_INITIAL;
    return null;
  }, [revealingIndex, cards, isRevealing, allRevealed]);

  return (
    <div className="flex flex-col items-center gap-8 pb-28">
      {/* Lyra narration during reveal */}
      {(isRevealing || (!allRevealed && narrationText)) && (
        <div className="flex flex-col items-center gap-3 text-center">
          <LyraSigil size="md" state={isRevealing || tts.isPlaying ? "speaking" : "attentive"} />
          <AnimatePresence mode="wait">
            {narrationText && (
              <motion.p
                key={narrationText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="text-sm text-muted-foreground italic max-w-md"
              >
                {renderBoldMarkdown(narrationText)}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Spread display */}
      <div className="py-4">
        <SpreadLayout
          spreadType={spreadType}
          cards={cards}
          cardStates={cardStates}
        />
      </div>

      {/* Inline interpretation — starts streaming immediately */}
      <div ref={interpretationRef} className="w-full max-w-xl">
        <ReadingInterpretation
          readingId={readingId}
          existingInterpretation={null}
        />
      </div>

    </div>
  );
}
