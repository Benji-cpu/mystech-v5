"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_READING_INTERPRETATION } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

const DISPLAY_TEXT = MOCK_READING_INTERPRETATION.slice(0, 200);
const CHAR_INTERVAL_MS = 40;

export function ReadingText({ className }: ContentViewProps) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const cursorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Typewriter effect — loops
  useEffect(() => {
    function startTyping() {
      indexRef.current = 0;
      setDisplayed("");

      typeIntervalRef.current = setInterval(() => {
        indexRef.current += 1;
        setDisplayed(DISPLAY_TEXT.slice(0, indexRef.current));

        if (indexRef.current >= DISPLAY_TEXT.length) {
          if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
          // Pause then restart
          setTimeout(() => startTyping(), 1800);
        }
      }, CHAR_INTERVAL_MS);
    }

    startTyping();

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, []);

  // Blinking cursor
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => {
      if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col items-center gap-3 p-5 w-full h-full justify-center">
        {/* Header label */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-3 h-px"
            style={{ background: MT.goldDim }}
          />
          <p
            className="text-xs tracking-widest uppercase font-semibold"
            style={{ color: MT.gold }}
          >
            Reading
          </p>
          <div
            className="w-3 h-px"
            style={{ background: MT.goldDim }}
          />
        </div>

        {/* Scrollable text area */}
        <div
          className="flex-1 min-h-0 w-full overflow-hidden relative"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${MT.border}`,
            borderRadius: "8px",
            padding: "10px",
          }}
        >
          <p
            className="text-sm leading-relaxed break-words"
            style={{ color: MT.text }}
          >
            {displayed}
            <span
              style={{
                color: MT.gold,
                opacity: showCursor ? 1 : 0,
                fontWeight: "bold",
                marginLeft: "1px",
              }}
            >
              |
            </span>
          </p>

          {/* Bottom fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${MT.bg}, transparent)`,
              borderRadius: "0 0 8px 8px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
