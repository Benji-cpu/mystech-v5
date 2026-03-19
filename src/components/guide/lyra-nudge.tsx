"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { LyraSigil } from "./lyra-sigil";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";
import type { NudgeConfig } from "./nudge-config";

interface LyraNudgeProps {
  nudge: NudgeConfig;
  onDismiss: () => void;
  className?: string;
}

export function LyraNudge({ nudge, onDismiss, className }: LyraNudgeProps) {
  const isDiscovery = nudge.variant === "discovery";

  const content = (
    <GlassPanel
      className={cn(
        "p-4 flex items-start gap-3 relative",
        isDiscovery
          ? "border-[#c9a94e]/30 shadow-[0_0_20px_rgba(201,169,78,0.08)]"
          : "border-white/10",
        className
      )}
    >
      {/* Discovery shimmer effect */}
      {isDiscovery && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(201,169,78,0.06) 0%, transparent 50%, rgba(201,169,78,0.04) 100%)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="shrink-0 pt-0.5">
        <LyraSigil size="sm" state="attentive" />
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <p className="text-sm text-white/70 leading-relaxed">{nudge.message}</p>
        {nudge.cta && (
          <span className="inline-block text-sm font-medium text-[#c9a94e] hover:text-[#d4b85a] transition-colors">
            {nudge.cta.label} &rarr;
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        className="shrink-0 p-1 text-white/20 hover:text-white/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </GlassPanel>
  );

  if (nudge.cta) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Link href={nudge.cta.href}>{content}</Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {content}
    </motion.div>
  );
}
