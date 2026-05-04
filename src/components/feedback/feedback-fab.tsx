"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoldButton } from "@/components/ui/gold-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

export function FeedbackFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) {
      setMessage("");
      setEmail("");
    }
  }, [open]);

  function handleSubmit() {
    const trimmed = message.trim();
    if (!trimmed) return;
    const payload = {
      message: trimmed,
      pageUrl: pathname,
      email: email.trim() || undefined,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
    setOpen(false);
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] text-white/50 hover:text-white/80 hover:bg-white/[0.12] transition-colors shadow-lg backdrop-blur-sm"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-base">Send Feedback</DialogTitle>
            <DialogDescription className="text-sm text-white/50">
              Help us improve your experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional, for follow-up)"
              className="bg-white/[0.03] border-white/[0.06] px-4 py-2.5"
            />

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
              className="min-h-[120px] resize-none bg-white/[0.03] border-white/[0.06] px-4 py-3 text-sm leading-relaxed"
              maxLength={2000}
            />

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-white/40">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
