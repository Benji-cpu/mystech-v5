"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepChatPreviewProps {
  className?: string;
}

export function StepChatPreview({ className }: StepChatPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-4",
        "max-w-[320px]",
        "flex flex-col gap-3",
        className
      )}
    >
      {/* User bubble */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white/10 rounded-2xl rounded-br-sm px-3 py-2 text-sm text-foreground/80 ml-auto max-w-[85%]"
      >
        I keep thinking about my grandmother&apos;s garden... it was my safe
        place growing up
      </motion.div>

      {/* AI response bubble */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.4,
        }}
        className="bg-gold/10 border border-gold/20 rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gold/80 max-w-[85%]"
      >
        A garden of memory and safety... let&apos;s weave that into a card that
        honors where you found peace.
      </motion.div>
    </div>
  );
}
