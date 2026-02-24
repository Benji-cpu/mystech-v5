"use client";

import { useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { AURORA, TIMING } from "./aurora-journey-theme";

interface GsapTextRevealProps {
  text: string;
  isActive: boolean;
  onComplete?: () => void;
  className?: string;
}

export function GsapTextReveal({ text, isActive, onComplete, className = "" }: GsapTextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const buildChars = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Split text into char spans
    el.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "gs-char";
      span.style.display = "inline-block";
      span.style.opacity = "0";
      span.style.transform = "translateY(8px)";
      if (text[i] === " ") {
        span.innerHTML = "\u00A0";
      } else {
        span.textContent = text[i];
      }
      el.appendChild(span);
    }

    // Add cursor
    const cursor = document.createElement("span");
    cursor.className = "gs-cursor";
    cursor.style.display = "inline-block";
    cursor.style.width = "2px";
    cursor.style.height = "1em";
    cursor.style.marginLeft = "2px";
    cursor.style.verticalAlign = "middle";
    cursor.style.backgroundColor = AURORA.accent;
    cursor.style.opacity = "0";
    el.appendChild(cursor);
  }, [text]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Kill previous timeline
    tlRef.current?.kill();

    buildChars();

    const el = containerRef.current;
    const chars = el.querySelectorAll(".gs-char");
    const cursor = el.querySelector(".gs-cursor");

    if (chars.length === 0) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete?.();
      },
    });
    tlRef.current = tl;

    // Fade in cursor
    if (cursor) {
      tl.to(cursor, { opacity: 1, duration: 0.2 }, 0);
    }

    // Stagger char reveal with Y-wave + amber glow
    tl.to(
      chars,
      {
        opacity: 1,
        y: 0,
        stagger: TIMING.charStagger,
        duration: 0.4,
        ease: "power2.out",
      },
      0.1
    );

    // Brief golden glow on each char as it appears
    tl.to(
      chars,
      {
        textShadow: `0 0 8px ${AURORA.accentGlow}`,
        stagger: TIMING.charStagger,
        duration: 0.3,
        ease: "power2.out",
      },
      0.1
    );

    // Fade glow away
    tl.to(
      chars,
      {
        textShadow: "0 0 0px transparent",
        stagger: TIMING.charStagger,
        duration: 0.6,
        ease: "power2.inOut",
      },
      `>-${Math.max(0, (chars.length - 10) * TIMING.charStagger)}`
    );

    // Fade cursor out after text is done
    if (cursor) {
      tl.to(cursor, { opacity: 0, duration: 0.4 }, ">");
    }

    return () => {
      tl.kill();
    };
  }, [isActive, text, buildChars, onComplete]);

  // Reset when inactive
  useEffect(() => {
    if (!isActive && containerRef.current) {
      tlRef.current?.kill();
      containerRef.current.innerHTML = "";
    }
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={`font-serif text-lg sm:text-xl leading-relaxed ${className}`}
      style={{ color: AURORA.text }}
    />
  );
}
