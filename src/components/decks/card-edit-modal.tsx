"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import type { DraftCard } from "@/types";

interface CardEditModalProps {
  card: DraftCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (edited: { title: string; meaning: string; guidance: string }) => void;
}

export function CardEditModal({
  card,
  open,
  onOpenChange,
  onSave,
}: CardEditModalProps) {
  const [title, setTitle] = useState("");
  const [meaning, setMeaning] = useState("");
  const [guidance, setGuidance] = useState("");

  const titleVoice = useVoiceInput({ value: title, onChange: setTitle, maxLength: 100 });
  const meaningVoice = useVoiceInput({ value: meaning, onChange: setMeaning, maxLength: 500 });
  const guidanceVoice = useVoiceInput({ value: guidance, onChange: setGuidance, maxLength: 500 });

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setMeaning(card.meaning);
      setGuidance(card.guidance);
    }
  }, [card]);

  if (!card) return null;

  function handleSave() {
    onSave({
      title: title.trim(),
      meaning: meaning.trim(),
      guidance: guidance.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/50 bg-background/95 backdrop-blur">
        <DialogTitle>Edit Card #{card.cardNumber}</DialogTitle>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <div className="flex gap-1 items-center">
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="flex-1"
              />
              <MicrophoneButton onTranscript={titleVoice.handleTranscript} onListeningChange={titleVoice.handleListeningChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-meaning">Meaning</Label>
            <div className="relative">
              <Textarea
                id="edit-meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                rows={4}
                maxLength={500}
                className="pr-14"
              />
              <div className="absolute right-2 bottom-2">
                <MicrophoneButton onTranscript={meaningVoice.handleTranscript} onListeningChange={meaningVoice.handleListeningChange} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-guidance">Guidance</Label>
            <div className="relative">
              <Textarea
                id="edit-guidance"
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                rows={3}
                maxLength={500}
                className="pr-14"
              />
              <div className="absolute right-2 bottom-2">
                <MicrophoneButton onTranscript={guidanceVoice.handleTranscript} onListeningChange={guidanceVoice.handleListeningChange} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !meaning.trim() || !guidance.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
