"use client";

import { useRef, useEffect, type ReactNode } from "react";
import gsap from "gsap";
import { TIMING } from "./aurora-journey-theme";
import type { AuroraRibbonHandle } from "./aurora-ribbons";

interface GsapContentMaterializerProps {
  children: ReactNode;
  visible: boolean;
  auroraRef: React.RefObject<AuroraRibbonHandle | null>;
  delay?: number;
  className?: string;
  id?: string;
}

export function GsapContentMaterializer({
  children,
  visible,
  auroraRef,
  delay = TIMING.contentFadeIn,
  className = "",
  id,
}: GsapContentMaterializerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wasVisibleRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    const aurora = auroraRef.current;
    if (!el) return;

    tweenRef.current?.kill();

    if (visible && !wasVisibleRef.current) {
      // Entering — dispatch gather to aurora ribbons
      if (aurora) {
        const rect = el.getBoundingClientRect();
        aurora.executeCommand({ type: "gather", targetRect: rect });
      }

      // GSAP enter with back.out overshoot
      gsap.set(el, { opacity: 0, y: 12, scale: 0.97, pointerEvents: "none" });
      tweenRef.current = gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        delay: delay / 1000,
        ease: "back.out(1.2)",
        pointerEvents: "auto",
      });
    } else if (!visible && wasVisibleRef.current) {
      // Exiting — dispatch release to aurora ribbons
      if (aurora) {
        const rect = el.getBoundingClientRect();
        aurora.executeCommand({ type: "release", sourceRect: rect });
      }

      tweenRef.current = gsap.to(el, {
        opacity: 0,
        y: -8,
        scale: 0.97,
        duration: 0.3,
        ease: "power2.in",
        pointerEvents: "none",
      });
    } else if (visible) {
      // Already visible, ensure correct state
      gsap.set(el, { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" });
    } else {
      // Already hidden
      gsap.set(el, { opacity: 0, y: 0, scale: 1, pointerEvents: "none" });
    }

    wasVisibleRef.current = visible;

    return () => {
      tweenRef.current?.kill();
    };
  }, [visible, auroraRef, delay]);

  return (
    <div
      ref={containerRef}
      data-materializer={id}
      className={className}
      style={{ opacity: 0, pointerEvents: "none" }}
    >
      {children}
    </div>
  );
}
