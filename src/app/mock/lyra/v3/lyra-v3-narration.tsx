"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LyraNarrationProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  onStart?: () => void;
  isLyra?: boolean;
  className?: string;
}

export function LyraNarration({
  text,
  speed = 20,
  onComplete,
  onStart,
  isLyra = true,
  className,
}: LyraNarrationProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  // Store callbacks in refs so they don't trigger effect re-runs
  const onCompleteRef = useRef(onComplete);
  const onStartRef = useRef(onStart);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onStartRef.current = onStart; }, [onStart]);

  // Cursor blink
  useEffect(() => {
    const blink = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blink);
  }, []);

  // Type text character by character — re-runs when text or speed changes
  useEffect(() => {
    if (!text) {
      setDisplayText("");
      setIsTyping(false);
      return;
    }

    setDisplayText("");
    indexRef.current = 0;
    setIsTyping(true);
    onStartRef.current?.();

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      const nextText = text.slice(0, indexRef.current);
      setDisplayText(nextText);

      if (indexRef.current >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsTyping(false);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed]);

  // Tap-to-skip: instantly complete the current narration
  const handleSkip = useCallback(() => {
    if (!isTyping || !text) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayText(text);
    setIsTyping(false);
    onCompleteRef.current?.();
  }, [isTyping, text]);

  if (!text) return null;

  return (
    <div
      className={cn("relative cursor-pointer", className)}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleSkip(); }}
    >
      <p
        className={cn(
          "text-sm leading-relaxed tracking-wide",
          isLyra
            ? "text-amber-200/90 italic font-serif"
            : "text-white/80 font-sans"
        )}
      >
        {displayText}
        <span
          className={cn(
            "inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom transition-opacity",
            isLyra ? "bg-amber-300/80" : "bg-white/60",
            showCursor && isTyping ? "opacity-100" : "opacity-0"
          )}
        />
      </p>
    </div>
  );
}

// ── Chat-style narration for Phase 3 ────────────────────────────────────

interface ChatMessage {
  speaker: "lyra" | "user";
  text: string;
}

interface LyraChatNarrationProps {
  messages: ChatMessage[];
  visibleCount: number;
  typingIndex: number; // Which message is currently typing (-1 = none)
  onMessageComplete?: (index: number) => void;
  footer?: React.ReactNode;
  className?: string;
}

export function LyraChatNarration({
  messages,
  visibleCount,
  typingIndex,
  onMessageComplete,
  footer,
  className,
}: LyraChatNarrationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, typingIndex]);

  const handleComplete = useCallback(
    (index: number) => {
      onMessageComplete?.(index);
    },
    [onMessageComplete]
  );

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex flex-col gap-3 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10",
        className
      )}
    >
      {/* Spacer pushes messages to bottom when few */}
      <div className="mt-auto" />
      <AnimatePresence>
        {messages.slice(0, visibleCount).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                  isLyra={true}
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
      {footer}
      <div ref={bottomRef} />
    </div>
  );
}

// ── Anchor pill for extracted themes ────────────────────────────────────

interface AnchorPillProps {
  name: string;
  isNew?: boolean;
  className?: string;
}

export function AnchorPill({ name, isNew, className }: AnchorPillProps) {
  return (
    <motion.div
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs",
        "bg-amber-500/10 border border-amber-500/20 text-amber-200/90",
        isNew && "ring-1 ring-amber-400/30",
        className
      )}
    >
      <span className="text-amber-400">&#x2605;</span>
      {name}
    </motion.div>
  );
}
