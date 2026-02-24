"use client";

import {
  useSpring,
  useMotionValue,
  motion,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, type RefObject, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Hook: useMagneticCursor
// ---------------------------------------------------------------------------

interface MagneticOptions {
  strength?: number; // 0-1, default 0.3
  radius?: number; // proximity detection px, default 100
  damping?: number; // spring damping, default 25
  stiffness?: number; // spring stiffness, default 200
}

export function useMagneticCursor(
  ref: RefObject<HTMLElement | null>,
  options: MagneticOptions = {}
): { x: MotionValue<number>; y: MotionValue<number> } {
  const { strength = 0.3, radius = 100, damping = 25, stiffness = 200 } = options;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness, damping });
  const y = useSpring(rawY, { stiffness, damping });

  const isTouch = useRef(false);

  useEffect(() => {
    // Detect touch device once on mount
    if (
      typeof window !== "undefined" &&
      (window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window)
    ) {
      isTouch.current = true;
      return;
    }

    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const ratio = 1 - dist / radius; // 1 at center, 0 at edge
        rawX.set(dx * ratio * strength);
        rawY.set(dy * ratio * strength);
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [ref, strength, radius, rawX, rawY]);

  return { x, y };
}

// ---------------------------------------------------------------------------
// Component: MagneticTarget
// ---------------------------------------------------------------------------

interface MagneticTargetProps {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
  as?: "div" | "button" | "a";
  onClick?: () => void;
}

export function MagneticTarget({
  children,
  strength = 0.3,
  radius = 100,
  className,
  as = "div",
  onClick,
}: MagneticTargetProps) {
  const elRef = useRef<HTMLElement | null>(null);
  const { x, y } = useMagneticCursor(elRef, { strength, radius });

  // Detect touch once for whileTap fallback
  const isTouchDevice =
    typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window);

  const Component = motion[as] as typeof motion.div;

  return (
    <Component
      ref={elRef as React.Ref<HTMLDivElement>}
      style={{ x, y }}
      className={className}
      onClick={onClick}
      whileTap={isTouchDevice ? { scale: 0.95 } : undefined}
    >
      {children}
    </Component>
  );
}
