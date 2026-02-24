"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GildedQuillProps {
  text: string;
  isPlaying: boolean;
  speed?: number;
  onComplete?: () => void;
}

interface TextSegment {
  char: string;
  globalIndex: number;
  isBold: boolean;
  isFirstOfParagraph: boolean;
  paragraphIndex: number;
}

// ─── Parser ─────────────────────────────────────────────────────────────────

function parseText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const paragraphs = text.split("\n\n");
  let globalIndex = 0;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    let isBold = false;
    let isFirstVisible = true;
    let i = 0;

    while (i < para.length) {
      // Check for bold marker **
      if (para[i] === "*" && para[i + 1] === "*") {
        isBold = !isBold;
        i += 2;
        continue;
      }

      segments.push({
        char: para[i],
        globalIndex,
        isBold,
        isFirstOfParagraph: isFirstVisible && para[i].trim() !== "",
        paragraphIndex: pIdx,
      });

      if (isFirstVisible && para[i].trim() !== "") {
        isFirstVisible = false;
      }

      globalIndex++;
      i++;
    }

    // Add paragraph break marker (not rendered as visible, but increments index)
    if (pIdx < paragraphs.length - 1) {
      segments.push({
        char: "\n",
        globalIndex,
        isBold: false,
        isFirstOfParagraph: false,
        paragraphIndex: pIdx,
      });
      globalIndex++;
    }
  }

  return segments;
}

// Group segments by paragraph for rendering
function groupByParagraph(
  segments: TextSegment[]
): Map<number, TextSegment[]> {
  const groups = new Map<number, TextSegment[]>();
  for (const seg of segments) {
    if (seg.char === "\n") continue; // skip paragraph break markers
    const existing = groups.get(seg.paragraphIndex) ?? [];
    existing.push(seg);
    groups.set(seg.paragraphIndex, existing);
  }
  return groups;
}

// ─── Gold trail decay distance ──────────────────────────────────────────────

const TRAIL_LENGTH = 20;

// ─── Component ──────────────────────────────────────────────────────────────

export function GildedQuill({
  text,
  isPlaying,
  speed = 25,
  onComplete,
}: GildedQuillProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const rafRef = useRef<number>(0);
  const countRef = useRef(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref current
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Parse text into segments once
  const segments = useMemo(() => parseText(text), [text]);
  const paragraphs = useMemo(() => groupByParagraph(segments), [segments]);
  const totalChars = segments.filter((s) => s.char !== "\n").length;

  // Reset when text changes
  useEffect(() => {
    countRef.current = 0;
    completedRef.current = false;
    setRevealedCount(0);
  }, [text]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    // If we already completed, don't restart
    if (completedRef.current) return;

    let lastTime = 0;

    const tick = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      if (elapsed >= speed) {
        lastTime = timestamp;
        countRef.current++;
        setRevealedCount(countRef.current);

        if (countRef.current >= segments.length) {
          completedRef.current = true;
          setTimeout(() => onCompleteRef.current?.(), 300);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, speed, segments]);

  // Sorted paragraph indices
  const paraIndices = useMemo(
    () => Array.from(paragraphs.keys()).sort((a, b) => a - b),
    [paragraphs]
  );

  return (
    <div
      className="relative"
      style={{
        fontFamily: "var(--font-manuscript), serif",
        color: "#f0e6d2",
        lineHeight: 1.8,
        fontSize: "1rem",
      }}
    >
      {paraIndices.map((pIdx) => {
        const paraSegments = paragraphs.get(pIdx)!;
        return (
          <p key={pIdx} className="mb-4">
            {paraSegments.map((seg) => {
              const revealed = seg.globalIndex < revealedCount;
              const isCursor = seg.globalIndex === revealedCount;
              const distanceFromCursor = revealedCount - seg.globalIndex;
              const inTrail =
                revealed && distanceFromCursor <= TRAIL_LENGTH;

              // Illuminated initial cap
              if (seg.isFirstOfParagraph) {
                return (
                  <span key={seg.globalIndex} className="relative inline">
                    <span
                      style={{
                        float: "left",
                        fontSize: "1.8em",
                        fontWeight: 700,
                        lineHeight: 1,
                        marginRight: "0.15em",
                        marginTop: "0.05em",
                        color: revealed ? "#8b2020" : "transparent",
                        transition: "color 0.05s ease",
                        fontFamily: "var(--font-manuscript), serif",
                      }}
                    >
                      {seg.char}
                    </span>
                    {isCursor && <QuillCursor />}
                  </span>
                );
              }

              // Regular characters
              return (
                <span key={seg.globalIndex} className="relative inline">
                  <span
                    style={{
                      opacity: revealed || isCursor ? 1 : 0,
                      transform:
                        revealed || isCursor ? "scale(1)" : "scale(0.8)",
                      display: "inline",
                      transition:
                        "opacity 0.05s ease, transform 0.05s ease, color 0.5s ease",
                      color: isCursor
                        ? "#c9a94e"
                        : inTrail
                          ? lerpColor(
                              "#c9a94e",
                              seg.isBold ? "#e0c65c" : "#f0e6d2",
                              distanceFromCursor / TRAIL_LENGTH
                            )
                          : seg.isBold
                            ? "#e0c65c"
                            : "#f0e6d2",
                      fontWeight: seg.isBold ? 600 : undefined,
                      textShadow: isCursor
                        ? "0 0 8px rgba(201, 169, 78, 0.8)"
                        : inTrail
                          ? `0 0 ${Math.max(0, 4 - (distanceFromCursor / TRAIL_LENGTH) * 4)}px rgba(201, 169, 78, ${Math.max(0, 0.4 - (distanceFromCursor / TRAIL_LENGTH) * 0.4)})`
                          : "none",
                      whiteSpace: seg.char === " " ? "pre" : undefined,
                    }}
                  >
                    {seg.char}
                  </span>
                  {isCursor && <QuillCursor />}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

// ─── Quill Cursor ───────────────────────────────────────────────────────────

function QuillCursor() {
  return (
    <motion.span
      className="inline-block relative"
      style={{
        color: "#c9a94e",
        fontWeight: 400,
        textShadow: "0 0 8px rgba(201, 169, 78, 0.8)",
        marginLeft: "-1px",
        marginRight: "-1px",
        width: 0,
        overflow: "visible",
      }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        repeat: Infinity,
        duration: 0.8,
        ease: "easeInOut",
      }}
    >
      |
    </motion.span>
  );
}

// ─── Color interpolation helper ─────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function lerpColor(from: string, to: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}
