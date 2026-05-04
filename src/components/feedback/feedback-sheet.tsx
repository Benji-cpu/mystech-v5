"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { GoldButton } from "@/components/ui/gold-button";
import { Textarea } from "@/components/ui/textarea";
import { useFeedback } from "./feedback-provider";
import { Camera, Check } from "lucide-react";
import { toast } from "sonner";

const SUCCESS_HOLD_MS = 1100;

export function FeedbackSheet() {
  const { phase, screenshotDataUrl, close } = useFeedback();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [sent, setSent] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== "open") {
      // Reset on close so reopening starts fresh
      setMessage("");
      setSent(false);
      setShowScreenshot(false);
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  async function handleSubmit() {
    if (!message.trim() || submitting || sent) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          pageUrl: pathname,
          screenshotDataUrl: screenshotDataUrl ?? undefined,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit");
      }
      setSent(true);
      closeTimer.current = setTimeout(() => {
        close();
      }, SUCCESS_HOLD_MS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) close();
  }

  return (
    <Sheet open={phase === "open"} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-card max-h-[85dvh] gap-0"
      >
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-base">Send Feedback</SheetTitle>
          <SheetDescription className="sr-only">
            Submit feedback about the current page
          </SheetDescription>
        </SheetHeader>

        <div className="px-5 pb-6 pb-safe space-y-4">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 py-10 justify-center text-sm text-muted-foreground"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>Thanks — feedback sent</span>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {screenshotDataUrl && (
                  <button
                    type="button"
                    onClick={() => setShowScreenshot((v) => !v)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Screenshot of this page is included</span>
                    <span className="text-muted-foreground/60">
                      {showScreenshot ? "hide" : "preview"}
                    </span>
                  </button>
                )}

                {showScreenshot && screenshotDataUrl && (
                  <div className="rounded-lg overflow-hidden border border-border max-h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotDataUrl}
                      alt="Page screenshot"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}

                <Textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Tell us what's on your mind…"
                  className="min-h-[120px] resize-none bg-muted/60 border-border px-4 py-3 text-sm leading-relaxed"
                  maxLength={2000}
                  disabled={submitting}
                />

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-muted-foreground/70">
                    Enter to send · Shift + Enter for newline
                  </p>
                  <GoldButton
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    loading={submitting}
                    className="px-5 py-2.5 text-sm"
                  >
                    Send
                  </GoldButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
