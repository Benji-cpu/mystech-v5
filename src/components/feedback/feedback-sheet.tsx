"use client";

import { useEffect, useState } from "react";
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
import { getActivityTrail } from "@/lib/feedback/activity-trail";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export function FeedbackSheet() {
  const { phase, screenshotDataUrl, context, close } = useFeedback();
  const [message, setMessage] = useState("");
  const [showScreenshot, setShowScreenshot] = useState(false);

  useEffect(() => {
    if (phase !== "open") {
      setMessage("");
      setShowScreenshot(false);
    }
  }, [phase]);

  function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) return;
    // Optimistic close — the user shouldn't have to wait for the network.
    // Fire the fetch in the background; only surface a toast on failure.
    const payload = {
      message: trimmed,
      pageUrl: context?.pageUrl ?? window.location.pathname,
      pageTitle: context?.pageTitle,
      routeParams: context?.routeParams,
      screenshotDataUrl: screenshotDataUrl ?? undefined,
      viewportWidth: context?.viewportWidth ?? window.innerWidth,
      viewportHeight: context?.viewportHeight ?? window.innerHeight,
      userAgent: context?.userAgent,
      activityTrail: getActivityTrail(),
    };
    close();
    toast.success("Sent", { duration: 1400 });
    void fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Feedback failed to send");
        }
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Feedback failed to send", {
          duration: 4000,
        });
      });
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
          {context && (
            <p className="text-xs text-muted-foreground/70 truncate">
              <span className="opacity-70">Page:</span> {context.contextSummary}
            </p>
          )}

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
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-muted-foreground/70">
              Enter to send · Shift + Enter for newline
            </p>
            <GoldButton
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="px-5 py-2.5 text-sm"
            >
              Send
            </GoldButton>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
