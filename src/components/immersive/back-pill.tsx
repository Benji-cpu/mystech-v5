"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useImmersive } from "./immersive-provider";
import { cn } from "@/lib/utils";

export function BackPill({ className }: { className?: string }) {
  const { state } = useImmersive();
  const { currentDepth, backTarget, backLabel } = state;

  const show = currentDepth >= 2 && backTarget;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`back-${backTarget}`}
          className={cn(
            "fixed z-50 bottom-[calc(1.5rem+56px+8px)] left-1/2 -translate-x-1/2",
            className
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <PillButton href={backTarget!} label={backLabel!} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PillButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 text-sm text-foreground/80 shadow-lg shadow-purple-900/20 transition-colors hover:bg-white/20"
    >
      <ChevronLeft className="h-4 w-4 text-gold" />
      <span>{label}</span>
    </Link>
  );
}
