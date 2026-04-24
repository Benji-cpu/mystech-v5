"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
import { Camera } from "lucide-react";
import { toast } from "sonner";

export function FeedbackSheet() {
  const { phase, screenshotDataUrl, close } = useFeedback();
  const pathname = usePathname();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
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
      toast.success("Thanks for your feedback!");
      setMessage("");
      close();
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
      <SheetContent side="bottom" className="rounded-t-2xl border-t border-white/[0.08] bg-card max-h-[85dvh]">
        <SheetHeader className="pb-3">
          <SheetTitle className="text-base">Send Feedback</SheetTitle>
          <SheetDescription className="sr-only">
            Submit feedback about the current page
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 pb-safe">
          {/* Screenshot notice */}
          {screenshotDataUrl && (
            <button
              type="button"
              onClick={() => setShowScreenshot(!showScreenshot)}
              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Screenshot of this page is included</span>
              <span className="text-white/30">{showScreenshot ? "hide" : "preview"}</span>
            </button>
          )}

          {/* Screenshot thumbnail */}
          {showScreenshot && screenshotDataUrl && (
            <div className="rounded-lg overflow-hidden border border-white/[0.06] max-h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotDataUrl}
                alt="Page screenshot"
                className="w-full h-full object-cover object-top"
              />
            </div>
          )}

          {/* Message */}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind..."
            className="min-h-[100px] resize-none bg-white/[0.03] border-white/[0.06]"
            maxLength={2000}
          />

          {/* Submit */}
          <GoldButton
            onClick={handleSubmit}
            disabled={!message.trim()}
            loading={submitting}
            className="w-full"
          >
            Send Feedback
          </GoldButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}
