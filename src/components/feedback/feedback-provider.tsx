"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { installActivityTrail } from "@/lib/feedback/activity-trail";
import { captureFeedbackContext, type FeedbackContext } from "@/lib/feedback/capture-context";

type FeedbackPhase = "idle" | "capturing" | "open";

interface FeedbackContextValue {
  phase: FeedbackPhase;
  screenshotDataUrl: string | null;
  context: FeedbackContext | null;
  open: () => void;
  close: () => void;
}

const FeedbackContextCtx = createContext<FeedbackContextValue | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContextCtx);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<FeedbackPhase>("idle");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [context, setContext] = useState<FeedbackContext | null>(null);

  // Install the activity trail once per page-load. Captures route changes,
  // clicks, fetch failures, errors — attached to feedback on submit.
  useEffect(() => {
    installActivityTrail();
  }, []);

  const open = useCallback(async () => {
    setPhase("capturing");
    // Capture context BEFORE the screenshot so we have the user's pre-screenshot
    // route/title — useful if their action navigates while the screenshot runs.
    setContext(captureFeedbackContext());
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(document.body, {
        pixelRatio: 0.5,
        cacheBust: true,
        filter: (node) => {
          // Exclude the nav and any sheets/overlays from the screenshot
          if (node instanceof HTMLElement) {
            const tag = node.tagName?.toLowerCase();
            if (tag === "nav") return false;
            if (node.getAttribute("role") === "dialog") return false;
            if (node.dataset?.vaul === "overlay") return false;
          }
          return true;
        },
      });
      setScreenshotDataUrl(dataUrl);
    } catch {
      // Screenshot failed — proceed without it
      setScreenshotDataUrl(null);
    }
    setPhase("open");
  }, []);

  const close = useCallback(() => {
    setPhase("idle");
    setScreenshotDataUrl(null);
    setContext(null);
  }, []);

  return (
    <FeedbackContextCtx.Provider value={{ phase, screenshotDataUrl, context, open, close }}>
      {children}
    </FeedbackContextCtx.Provider>
  );
}
