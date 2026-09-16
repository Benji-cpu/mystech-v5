"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroTextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

const GOLD = "rgba(201,169,78,1)";
const GLOW_SETTLED = "0 0 4px rgba(201,169,78,0.3)";

/**
 * Staggered word reveal for the landing hero. Was the only gsap call site in
 * the app; framer-motion was already on this page, so gsap came down the wire
 * for eighty lines of animation nobody else used.
 */
export function HeroTextReveal({
  children,
  className,
  as: Tag = "h1",
}: HeroTextRevealProps) {
  const reduceMotion = useReducedMotion();
  const words = children.split(" ");

  return (
    <Tag className={cn(className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ marginRight: i < words.length - 1 ? "0.3em" : undefined }}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 16,
                  color: "rgba(201,169,78,0)",
                  textShadow: "0 0 0px rgba(201,169,78,0)",
                }
          }
          animate={{
            opacity: 1,
            y: 0,
            color: GOLD,
            // Flares to a bright glow on arrival, then settles.
            textShadow: reduceMotion
              ? GLOW_SETTLED
              : ["0 0 20px rgba(201,169,78,0.8)", GLOW_SETTLED],
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.3,
                  delay: i * 0.08,
                  ease: "easeOut",
                  textShadow: { duration: 0.6, delay: 0.8 + i * 0.08, times: [0, 1] },
                }
          }
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
