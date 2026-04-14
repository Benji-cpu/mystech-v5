"use client";

import { useState } from "react";
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
import { MessageSquarePlus, Bug, Lightbulb, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categories = [
  { value: "bug" as const, label: "Bug", icon: Bug },
  { value: "feature" as const, label: "Idea", icon: Lightbulb },
  { value: "general" as const, label: "General", icon: MessageCircle },
];

export function FeedbackFab() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"bug" | "feature" | "general">("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          pageUrl: pathname,
          email: email.trim() || undefined,
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
      setEmail("");
      setCategory("general");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.1] text-white/50 hover:text-white/80 hover:bg-white/[0.12] transition-colors shadow-lg backdrop-blur-sm"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-base">Send Feedback</DialogTitle>
            <DialogDescription className="text-sm text-white/50">
              Help us improve your experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email (optional) */}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional, for follow-up)"
              className="bg-white/[0.03] border-white/[0.06]"
            />

            {/* Category toggles */}
            <div className="flex gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const active = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/[0.12] text-white border border-white/[0.15]"
                        : "bg-white/[0.04] text-white/40 border border-transparent hover:text-white/60"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Message */}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                category === "bug"
                  ? "What went wrong?"
                  : category === "feature"
                    ? "What would you like to see?"
                    : "Tell us what's on your mind..."
              }
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
        </DialogContent>
      </Dialog>
    </>
  );
}
