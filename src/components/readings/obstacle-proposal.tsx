"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { cn } from "@/lib/utils";

type ObstacleProposalData = {
  title: string;
  meaning: string;
  guidance: string;
  imagePrompt: string;
  pattern: string;
  triggerCard: string;
  retreatId: string;
};

interface ObstacleProposalProps {
  readingId: string;
  className?: string;
}

export function ObstacleProposal({ readingId, className }: ObstacleProposalProps) {
  const [proposal, setProposal] = useState<ObstacleProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forging, setForging] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [forged, setForged] = useState(false);

  useEffect(() => {
    fetch(`/api/readings/${readingId}/obstacle-check`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.proposal) {
          setProposal(data.data.proposal);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [readingId]);

  async function handleForge() {
    if (!proposal) return;
    setForging(true);
    try {
      const res = await fetch(`/api/readings/${readingId}/obstacle-forge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proposal),
      });
      const data = await res.json();
      if (data.success) {
        setForged(true);
      }
    } catch {
      // Silent fail
    } finally {
      setForging(false);
    }
  }

  if (loading || dismissed || !proposal) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "rounded-2xl overflow-hidden",
            "bg-white/5 backdrop-blur-xl",
            "border border-amber-500/20",
            "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
            className,
          )}
        >
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                <Shield className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/90">
                      A Pattern Emerges
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Lyra has noticed something...
                    </p>
                  </div>
                  {!forged && (
                    <button
                      onClick={() => setDismissed(true)}
                      className="text-white/20 hover:text-white/40 transition-colors p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lyra's message */}
            <div className="flex items-start gap-3 pl-1">
              <LyraSigil size="sm" state="attentive" />
              <p className="text-sm text-white/60 leading-relaxed italic">
                {proposal.pattern}
              </p>
            </div>

            {forged ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center"
              >
                <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-amber-300">
                  Obstacle Card Forged
                </p>
                <p className="text-xs text-white/40 mt-1">
                  &ldquo;{proposal.title}&rdquo; has been added to your deck.
                </p>
              </motion.div>
            ) : (
              <>
                {/* Card preview */}
                <div className="rounded-xl bg-white/5 border border-white/8 p-4 space-y-2">
                  <p className="text-xs text-amber-400 font-medium uppercase tracking-wider">
                    Proposed Card
                  </p>
                  <p className="text-sm font-semibold text-white/90">
                    {proposal.title}
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {proposal.meaning}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleForge}
                    disabled={forging}
                    size="sm"
                    className="flex-1 bg-amber-500/80 text-black hover:bg-amber-500/90 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  >
                    {forging ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Forge This Card
                  </Button>
                  <Button
                    onClick={() => setDismissed(true)}
                    variant="outline"
                    size="sm"
                    className="border-white/10 text-white/40 hover:text-white/60"
                  >
                    Not Now
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
