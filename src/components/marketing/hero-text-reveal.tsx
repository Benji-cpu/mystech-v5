"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface HeroTextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function HeroTextReveal({
  children,
  className,
  as: Tag = "h1",
}: HeroTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const words = containerRef.current.querySelectorAll(".word");

    if (prefersReducedMotion) {
      gsap.set(words, {
        opacity: 1,
        y: 0,
        color: "rgba(201,169,78,1)",
        textShadow: "0 0 4px rgba(201,169,78,0.3)",
      });
      return;
    }

    gsap.set(words, {
      opacity: 0,
      y: 16,
      color: "rgba(201,169,78,0)",
      textShadow: "0 0 0px rgba(201,169,78,0)",
    });

    gsap.to(words, {
      opacity: 1,
      y: 0,
      color: "rgba(201,169,78,1)",
      textShadow: "0 0 20px rgba(201,169,78,0.8)",
      duration: 0.3,
      stagger: 0.08,
      ease: "power2.out",
    });

    gsap.to(words, {
      textShadow: "0 0 4px rgba(201,169,78,0.3)",
      duration: 0.6,
      stagger: 0.08,
      delay: 0.8,
      ease: "power2.inOut",
    });
  }, []);

  const wordList = children.split(" ");

  return (
    <Tag ref={containerRef} className={cn(className)}>
      {wordList.map((word, i) => (
        <span
          key={i}
          className="word inline-block"
          style={{ marginRight: i < wordList.length - 1 ? "0.3em" : undefined }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
}
