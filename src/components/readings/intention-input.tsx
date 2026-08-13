"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { MicrophoneButton } from "@/components/voice/microphone-button";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowUp } from "lucide-react";

interface IntentionInputProps {
  question: string;
  onChange: (question: string) => void;
  className?: string;
  collapsible?: boolean;
  /** Controlled expanded state — overrides internal behavior when provided */
  expanded?: boolean;
  /** Callback when header is clicked in controlled mode */
  onToggleExpanded?: () => void;
  /**
   * Called on Enter (Shift+Enter still breaks the line) and on the send
   * button. Without it the field has no way out but hunting for the CTA.
   */
  onSubmit?: () => void;
  /** Disables the send button and swallows Enter — with a reason why. */
  submitDisabledReason?: string | null;
  submitLabel?: string;
  /** Suppress the built-in caption when the container already titles this step. */
  hideLabel?: boolean;
}

export function IntentionInput({
  question,
  onChange,
  className,
  collapsible,
  expanded = true,
  onToggleExpanded,
  onSubmit,
  submitDisabledReason,
  submitLabel = "Begin reading",
  hideLabel,
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

  const canSubmit = !!onSubmit && !submitDisabledReason;

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    // Enter means "I'm done writing" everywhere else on a phone; here it used
    // to mean a blank line the reader couldn't see the end of.
    event.preventDefault();
    if (!canSubmit) return;
    event.currentTarget.blur();
    onSubmit?.();
  }

  /** Sits under the mic so the field always shows its own way forward. */
  const sendButton = onSubmit ? (
    <motion.button
      type="button"
      onClick={() => {
        if (canSubmit) onSubmit();
      }}
      disabled={!canSubmit}
      whileTap={canSubmit ? { scale: 0.94 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      aria-label={submitDisabledReason ?? submitLabel}
      title={submitDisabledReason ?? submitLabel}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        canSubmit
          ? "bg-primary text-primary-foreground"
          : "bg-white/5 text-white/25 cursor-not-allowed"
      )}
    >
      <ArrowUp className="h-4 w-4" />
    </motion.button>
  ) : null;

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
                    onKeyDown={handleKeyDown}
                    placeholder="What's been on your mind lately?"
                    className="bg-white/5 border-white/10 resize-none text-sm pr-14 min-h-[80px]"
                    maxLength={500}
                  />
                  <div className="absolute right-2 bottom-2 flex flex-col items-center gap-2">
                    <MicrophoneButton onTranscript={handleTranscript} onListeningChange={handleListeningChange} />
                    {sendButton}
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
      {!hideLabel && (
        <label className="text-sm font-medium text-white/70 mb-2 block">
          What brings you to the cards?
        </label>
      )}

      <div className="relative">
        <Textarea
          value={question}
          onChange={(e) => onChange(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder="What's been on your mind lately?"
          className="bg-white/5 border-white/10 resize-none text-sm pr-14 min-h-[80px]"
          maxLength={500}
        />
        <div className="absolute right-2 bottom-2 flex flex-col items-center gap-2">
          <MicrophoneButton
            onTranscript={handleTranscript}
            onListeningChange={handleListeningChange}
          />
          {sendButton}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-xs text-white/30">
          {submitDisabledReason ?? (onSubmit ? "Enter to begin · Shift+Enter for a new line" : "")}
        </p>
        {question.length > 0 && (
          <p className="shrink-0 text-xs text-white/30">{question.length}/500</p>
        )}
      </div>
    </div>
  );
}
