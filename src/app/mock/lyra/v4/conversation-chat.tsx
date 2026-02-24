"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LyraNarration } from "../v3/lyra-v3-narration";
import type { ConversationLine } from "./lyra-v4-data";
import type { Anchor } from "./lyra-v4-data";
import { AnchorStrip } from "./anchor-strip";
import { SPRINGS } from "./lyra-v4-theme";

interface ConversationChatProps {
  messages: ConversationLine[];
  visibleCount: number;
  typingIndex: number;
  anchors: Anchor[];
  highlightedAnchorId: string | null;
  onMessageComplete?: (index: number) => void;
  onAnchorTap?: (anchorId: string) => void;
  className?: string;
}

export function ConversationChat({
  messages,
  visibleCount,
  typingIndex,
  anchors,
  highlightedAnchorId,
  onMessageComplete,
  onAnchorTap,
  className,
}: ConversationChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, typingIndex]);

  const handleComplete = useCallback(
    (index: number) => {
      onMessageComplete?.(index);
    },
    [onMessageComplete]
  );

  const readiness = Math.min(100, (anchors.length / 6) * 100);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Anchor strip at top */}
      <AnchorStrip
        anchors={anchors}
        maxSlots={6}
        readinessPercent={readiness}
        highlightedAnchorId={highlightedAnchorId}
        onAnchorTap={onAnchorTap ?? (() => {})}
        className="shrink-0 py-2"
      />

      {/* Scrollable chat area */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 px-1 py-2"
      >
        {/* Spacer to push messages to bottom */}
        <div className="mt-auto" />

        <AnimatePresence>
          {messages.slice(0, visibleCount).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRINGS.gentle}
              className={cn(
                "flex",
                msg.speaker === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5",
                  msg.speaker === "lyra"
                    ? "bg-white/5 backdrop-blur border border-white/10"
                    : "bg-amber-900/20 backdrop-blur border border-amber-500/20"
                )}
              >
                {msg.speaker === "lyra" && i === typingIndex ? (
                  <LyraNarration
                    text={msg.text}
                    speed={12}
                    onComplete={() => handleComplete(i)}
                    isLyra
                  />
                ) : (
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      msg.speaker === "lyra"
                        ? "text-amber-200/90 italic font-serif"
                        : "text-white/80"
                    )}
                  >
                    {msg.text}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input placeholder */}
      <div className="shrink-0 px-1 pb-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3">
          <span className="text-sm text-white/25 italic">Share your story...</span>
        </div>
      </div>
    </div>
  );
}
