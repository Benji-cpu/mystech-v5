"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { Loader2, Send, X } from "lucide-react";

interface CardEditInlineProps {
  cardNumber: number;
  onSubmit: (cardNumber: number, instruction: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function CardEditInline({
  cardNumber,
  onSubmit,
  onClose,
  isLoading,
}: CardEditInlineProps) {
  const [instruction, setInstruction] = useState("");

  const instructionVoice = useVoiceInput({ value: instruction, onChange: setInstruction });

  async function handleSubmit() {
    const text = instruction.trim();
    if (!text || isLoading) return;
    await onSubmit(cardNumber, text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div className="flex gap-2 items-center w-full max-w-sm mx-auto mt-3">
      <Input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="How should this card change?"
        disabled={isLoading}
        autoFocus
        className="flex-1 text-sm"
      />
      <MicrophoneButton
        onTranscript={instructionVoice.handleTranscript}
        onListeningChange={instructionVoice.handleListeningChange}
        className="h-9 w-9 flex-shrink-0"
      />
      <Button
        size="icon"
        onClick={handleSubmit}
        disabled={!instruction.trim() || isLoading}
        className="h-9 w-9 flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onClose}
        disabled={isLoading}
        className="h-9 w-9 flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
