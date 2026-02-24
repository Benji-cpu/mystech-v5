"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { SPRING, TIMING } from "./lyra-journey-theme";
import type { ParticleHandle } from "./lyra-particles";

interface ContentMaterializerProps {
  children: ReactNode;
  /** Whether this content block is visible */
  visible: boolean;
  /** Ref to the particle system for dispatching commands */
  particleRef: React.RefObject<ParticleHandle | null>;
  /** Delay before DOM content fades in (ms) — allows particles to arrive first */
  delay?: number;
  /** CSS class for the wrapper */
  className?: string;
  /** Unique key for tracking enter/exit */
  id?: string;
}

export function ContentMaterializer({
  children,
  visible,
  particleRef,
  delay = TIMING.contentFadeIn,
  className = "",
  id,
}: ContentMaterializerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    const particles = particleRef.current;
    if (!el || !particles) return;

    if (visible && !wasVisibleRef.current) {
      // Entering — dispatch converge command
      const rect = el.getBoundingClientRect();
      particles.executeCommand({ type: "converge", targetRect: rect });
    } else if (!visible && wasVisibleRef.current) {
      // Exiting — dispatch burst command
      const rect = el.getBoundingClientRect();
      particles.executeCommand({ type: "burst", sourceRect: rect });
    }

    wasVisibleRef.current = visible;
  }, [visible, particleRef]);

  return (
    <motion.div
      ref={containerRef}
      data-materializer={id}
      className={className}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 12,
        scale: visible ? 1 : 0.97,
      }}
      transition={{
        ...SPRING,
        delay: visible ? delay / 1000 : 0,
      }}
      style={{
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {children}
    </motion.div>
  );
}
