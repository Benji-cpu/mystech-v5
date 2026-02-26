"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface IntentionInputProps {
  question: string;
  onChange: (question: string) => void;
  className?: string;
  collapsible?: boolean;
  /** Controlled expanded state — overrides internal behavior when provided */
  expanded?: boolean;
  /** Callback when header is clicked in controlled mode */
  onToggleExpanded?: () => void;
}

export function IntentionInput({
  question,
  onChange,
  className,
  collapsible,
  expanded = true,
  onToggleExpanded,
}: IntentionInputProps) {
  const { handleTranscript, handleListeningChange } = useVoiceInput({
    value: question,
    onChange,
    maxLength: 500,
  });

  const summaryText = question.trim()
    ? question.trim().length > 40
      ? question.trim().slice(0, 40) + "..."
      : question.trim()
    : "(optional)";

  if (collapsible) {
    return (
      <div className={cn(className)}>
        <button
          onClick={() => onToggleExpanded?.()}
          className="w-full flex items-center justify-between py-2 px-1 text-left group"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/70">
              Your Question
            </span>
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
              <div className="pb-2">
                <div className="relative">
                  <Textarea
                    value={question}
                    onChange={(e) => onChange(e.target.value.slice(0, 500))}
                    placeholder="What's been on your mind lately?"
                    className="bg-white/5 border-white/10 resize-none text-sm pr-14 min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="absolute right-2 bottom-2">
                    <MicrophoneButton onTranscript={handleTranscript} onListeningChange={handleListeningChange} />
                  </div>
                </div>
                {question.length > 0 && (
                  <p className="text-xs text-white/30 mt-1 text-right">
                    {question.length}/500
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn(className)}>
      <label className="text-sm font-medium text-white/70 mb-2 block">
        What brings you to the cards?
      </label>

      <div className="relative">
        <Textarea
          value={question}
          onChange={(e) => onChange(e.target.value.slice(0, 500))}
          placeholder="What's been on your mind lately?"
          className="bg-white/5 border-white/10 resize-none text-sm pr-14 min-h-[80px]"
          maxLength={500}
        />
        <div className="absolute right-2 bottom-2">
          <MicrophoneButton onTranscript={handleTranscript} />
        </div>
      </div>

      {question.length > 0 && (
        <p className="text-xs text-white/30 mt-1 text-right">
          {question.length}/500
        </p>
      )}
    </div>
  );
}
