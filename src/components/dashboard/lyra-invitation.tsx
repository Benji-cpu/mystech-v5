"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LyraNarration } from "@/components/guide/lyra-narration";
import { cn } from "@/lib/utils";
import type { Invitation } from "@/lib/dashboard/resolve-invitation";

interface LyraInvitationProps {
  invitation: Invitation;
  userName: string;
  hasBelowFold: boolean;
  className?: string;
}

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

export function LyraInvitation({
  invitation,
  userName,
  hasBelowFold,
  className,
}: LyraInvitationProps) {
  const [sigilState, setSigilState] = useState<"attentive" | "speaking">(
    "attentive"
  );
  const [narrationDone, setNarrationDone] = useState(false);

  return (
    <div
      className={cn(
        "min-h-[calc(100dvh-6rem)] flex flex-col items-center justify-center px-6",
        className
      )}
    >
      <div className="flex flex-col items-center gap-5 max-w-md text-center">
        {/* Sigil */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={spring}
        >
          <LyraSigil size="xl" state={sigilState} />
        </motion.div>

        {/* Label */}
        <motion.p
          className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          Lyra
        </motion.p>

        {/* Narration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <LyraNarration
            text={invitation.greeting}
            speed={20}
            onStart={() => setSigilState("speaking")}
            onComplete={() => {
              setSigilState("attentive");
              setNarrationDone(true);
            }}
            className="min-h-[3rem]"
          />
        </motion.div>

        {/* Subtitle */}
        {invitation.subtitle && (
          <motion.p
            className="text-xs text-white/40 tracking-wide"
            initial={{ opacity: 0 }}
            animate={narrationDone ? { opacity: 1 } : {}}
            transition={{ duration: 0.4 }}
          >
            {invitation.subtitle}
          </motion.p>
        )}

        {/* CTA */}
        {invitation.ctaHref && (
          <motion.a
            href={invitation.ctaHref}
            className="mt-2 inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-primary/90 to-amber-600/90 text-black font-semibold text-sm tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={narrationDone ? { opacity: 1, y: 0 } : {}}
            transition={{ ...spring, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {invitation.ctaLabel}
          </motion.a>
        )}

        {/* Scroll indicator */}
        {hasBelowFold && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={narrationDone ? { opacity: 0.4, y: [0, 6, 0] } : {}}
            transition={{
              opacity: { delay: 0.5, duration: 0.4 },
              y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            }}
          >
            <ChevronDown className="h-5 w-5 text-white/40" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
