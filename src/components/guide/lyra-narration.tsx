"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
