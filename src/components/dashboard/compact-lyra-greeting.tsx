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
        "flex items-center gap-4 p-4 rounded-2xl",
        "bg-white/5 backdrop-blur-xl border border-white/10",
        className
      )}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
    >
      <div className="shrink-0">
        <LyraSigil size="md" state={sigilState} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <LyraNarration
          text={invitation.greeting}
          speed={18}
          onStart={() => setSigilState("speaking")}
          onComplete={() => setSigilState("attentive")}
          className="text-sm"
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
