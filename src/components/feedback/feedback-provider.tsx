"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type FeedbackPhase = "idle" | "capturing" | "open";

interface FeedbackContextValue {
  phase: FeedbackPhase;
  screenshotDataUrl: string | null;
  open: () => void;
  close: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used within FeedbackProvider");
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<FeedbackPhase>("idle");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);

  const open = useCallback(async () => {
    setPhase("capturing");
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
  }, []);

  return (
    <FeedbackContext.Provider value={{ phase, screenshotDataUrl, open, close }}>
      {children}
    </FeedbackContext.Provider>
  );
}
