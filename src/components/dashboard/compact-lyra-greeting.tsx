"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LyraNarration } from "@/components/guide/lyra-narration";
import { cn } from "@/lib/utils";
import type { Invitation } from "@/lib/dashboard/resolve-invitation";

interface CompactLyraGreetingProps {
  invitation: Invitation;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

export function CompactLyraGreeting({
  invitation,
  className,
}: CompactLyraGreetingProps) {
  const [sigilState, setSigilState] = useState<"attentive" | "speaking">(
    "attentive"
  );

  return (
    <motion.div
      className={cn(
        "flex items-start gap-4 p-5 rounded-2xl",
        "bg-white/[0.03] border border-white/[0.06]",
        className
      )}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="shrink-0 mt-0.5">
        <LyraSigil size="md" state={sigilState} />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <LyraNarration
          text={invitation.greeting}
          speed={18}
          onStart={() => setSigilState("speaking")}
          onComplete={() => setSigilState("attentive")}
          className="text-base font-display leading-relaxed"
        />
        {invitation.subtitle && (
          <p className="text-xs text-white/40 truncate">
            {invitation.subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
