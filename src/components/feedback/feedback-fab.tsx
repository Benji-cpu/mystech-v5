"use client";

import { MessageSquarePlus } from "lucide-react";
import { FeedbackProvider, useFeedback } from "./feedback-provider";
import { FeedbackSheet } from "./feedback-sheet";

/**
 * Unified feedback FAB. Wraps the trigger button + bottom-sheet + provider
 * so any layout can drop a single `<FeedbackFab />` in and get the full
 * standardised feedback UX (with screenshot capture + activity trail).
 *
 * The immersive shell mounts FeedbackProvider/Sheet directly because its
 * navigation has its own feedback button — see immersive-shell.tsx.
 */
export function FeedbackFab() {
  return (
    <FeedbackProvider>
      <FeedbackFabTrigger />
      <FeedbackSheet />
    </FeedbackProvider>
  );
}

function FeedbackFabTrigger() {
  const { open } = useFeedback();
  return (
    <button
      type="button"
      onClick={open}
      data-event="feedback-fab"
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] text-white/50 hover:text-white/80 hover:bg-white/[0.12] transition-colors shadow-lg backdrop-blur-sm"
      aria-label="Send feedback"
    >
      <MessageSquarePlus className="w-5 h-5" />
    </button>
  );
}
