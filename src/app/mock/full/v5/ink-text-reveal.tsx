"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";

interface InkTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  charDelay?: number; // delay between chars, default 0.03s
  glowColor?: string; // default cyan
  as?: "p" | "h1" | "h2" | "h3" | "span";
  once?: boolean; // only animate once when in view
  animate?: boolean; // external control, default true
}

const charVariants = {
  hidden: {
    opacity: 0,
    y: 4,
    filter: "blur(3px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

export function InkTextReveal({
  text,
  className = "",
  delay = 0,
  charDelay = 0.03,
  glowColor = "rgba(0, 229, 255, 0.12)",
  as: Tag = "p",
  once = true,
  animate: externalAnimate,
}: InkTextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10%" });
  const shouldAnimate = externalAnimate !== undefined ? externalAnimate : isInView;

  // For long text, split into words rather than individual characters
  const isLong = text.length > 200;

  if (isLong) {
    return (
      <InkParagraphReveal
        text={text}
        className={className}
        delay={delay}
        glowColor={glowColor}
        Tag={Tag}
        animate={shouldAnimate}
        containerRef={ref}
      />
    );
  }

  const chars = useMemo(() => text.split(""), [text]);

  return (
    <Tag ref={ref as never} className={`${className} inline`}>
      {chars.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          variants={charVariants}
          initial="hidden"
          animate={shouldAnimate ? "visible" : "hidden"}
          transition={{
            duration: 0.35,
            delay: delay + i * charDelay,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
            textShadow: shouldAnimate
              ? `0 0 8px ${glowColor}`
              : "none",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </Tag>
  );
}

// For long text: reveal word-by-word instead of char-by-char
function InkParagraphReveal({
  text,
  className,
  delay,
  glowColor,
  Tag,
  animate,
  containerRef,
}: {
  text: string;
  className: string;
  delay: number;
  glowColor: string;
  Tag: "p" | "h1" | "h2" | "h3" | "span";
  animate: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);

  return (
    <Tag ref={containerRef as never} className={className}>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) {
          return <span key={i}>{" "}</span>;
        }
        return (
          <motion.span
            key={`${i}-${word}`}
            initial={{ opacity: 0, y: 3, filter: "blur(2px)" }}
            animate={
              animate
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 3, filter: "blur(2px)" }
            }
            transition={{
              duration: 0.3,
              delay: delay + i * 0.015,
              ease: [0.22, 0.61, 0.36, 1],
            }}
            style={{
              display: "inline-block",
              textShadow: animate ? `0 0 6px ${glowColor}` : "none",
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </Tag>
  );
}

// Streaming text reveal — for reading interpretation
interface InkStreamRevealProps {
  text: string;
  isStreaming: boolean;
  className?: string;
  glowColor?: string;
}

export function InkStreamReveal({
  text,
  isStreaming,
  className = "",
  glowColor = "rgba(0, 229, 255, 0.1)",
}: InkStreamRevealProps) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);

  return (
    <p className={className}>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{" "}</span>;
        return (
          <motion.span
            key={`${i}-${word}`}
            initial={{ opacity: 0, filter: "blur(2px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25, delay: 0.01 * i }}
            style={{
              display: "inline-block",
              textShadow: `0 0 6px ${glowColor}`,
            }}
          >
            {word}
          </motion.span>
        );
      })}
      {isStreaming && (
        <motion.span
          className="inline-block w-2 h-4 ml-1 bg-cyan-400 rounded-sm align-middle"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </p>
  );
}

export default InkTextReveal;
