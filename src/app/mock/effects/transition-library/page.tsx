"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MockCardFront } from "@/components/mock/mock-card";
import { MOCK_CARDS } from "@/components/mock/mock-data";
import { cn } from "@/lib/utils";

// Transition definitions
interface TransitionDef {
  id: string;
  category: "css" | "framer" | "spring" | "gsap" | "creative";
  label: string;
  description: string;
  initial: Record<string, any>;
  animate: Record<string, any>;
  transition: Record<string, any>;
}

const TRANSITIONS: TransitionDef[] = [
  // CSS
  {
    id: "fade-scale",
    category: "css",
    label: "Fade Scale",
    description: "Classic opacity + scale entrance",
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  },
  {
    id: "slide-up",
    category: "css",
    label: "Slide Up",
    description: "Slide from below with spring",
    initial: { opacity: 0, y: 200 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  {
    id: "3d-flip",
    category: "css",
    label: "3D Flip",
    description: "Card flip on Y axis",
    initial: { rotateY: -180, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  {
    id: "clip-reveal",
    category: "css",
    label: "Clip Path Reveal",
    description: "Circular clip-path expansion",
    initial: { clipPath: "circle(0% at 50% 50%)", opacity: 0 },
    animate: { clipPath: "circle(75% at 50% 50%)", opacity: 1 },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  {
    id: "blur-in",
    category: "css",
    label: "Blur In",
    description: "Blur to focus transition",
    initial: { filter: "blur(20px)", opacity: 0 },
    animate: { filter: "blur(0px)", opacity: 1 },
    transition: { duration: 0.6 },
  },
  {
    id: "perspective",
    category: "css",
    label: "Perspective Tilt",
    description: "3D perspective entrance",
    initial: { rotateX: -30, rotateY: 15, opacity: 0, scale: 0.8 },
    animate: { rotateX: 0, rotateY: 0, opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },

  // Framer
  {
    id: "spring-bouncy",
    category: "framer",
    label: "Spring Bouncy",
    description: "High stiffness, low damping bounce",
    initial: { y: -200, opacity: 0, scale: 0.5 },
    animate: { y: 0, opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 300, damping: 10 },
  },
  {
    id: "spring-smooth",
    category: "framer",
    label: "Spring Smooth",
    description: "Low stiffness, high damping glide",
    initial: { y: -200, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
  {
    id: "spring-heavy",
    category: "framer",
    label: "Spring Heavy",
    description: "High mass, weighty entrance",
    initial: { y: -200, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 15, mass: 3 },
  },
  {
    id: "stagger-cascade",
    category: "framer",
    label: "Stagger Cascade",
    description: "Multiple cards with staggered timing",
    initial: { opacity: 0, y: 50, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  {
    id: "morph",
    category: "framer",
    label: "Shape Morph",
    description: "Smooth shape transformation",
    initial: { borderRadius: "50%", scale: 0.5, opacity: 0, rotate: 180 },
    animate: { borderRadius: "12px", scale: 1, opacity: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  {
    id: "flip-card",
    category: "framer",
    label: "Flip Card",
    description: "Classic card flip reveal",
    initial: { rotateY: 180, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },

  // Spring
  {
    id: "wobble",
    category: "spring",
    label: "Spring Wobble",
    description: "Oscillating wobble entrance",
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 180, damping: 8 },
  },
  {
    id: "trail",
    category: "spring",
    label: "Trail Stagger",
    description: "Sequential trail animation",
    initial: { opacity: 0, x: -100, scale: 0.5 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
  {
    id: "chain",
    category: "spring",
    label: "Chain Sequence",
    description: "Chained multi-step animation",
    initial: { opacity: 0, y: 100, rotateX: -45 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    transition: { type: "spring", stiffness: 150, damping: 15, mass: 2 },
  },

  // GSAP
  {
    id: "timeline",
    category: "gsap",
    label: "Timeline Sequence",
    description: "Multi-step choreographed timeline",
    initial: { opacity: 0, scale: 0.3, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  {
    id: "gsap-flip",
    category: "gsap",
    label: "GSAP Flip",
    description: "Layout-aware flip animation",
    initial: { rotateY: -180, scale: 0.5, opacity: 0 },
    animate: { rotateY: 0, scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 180, damping: 20 },
  },
  {
    id: "gsap-stagger",
    category: "gsap",
    label: "GSAP Stagger",
    description: "Grid stagger with elastic ease",
    initial: { opacity: 0, scale: 0, rotate: -90 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 200, damping: 12 },
  },
  {
    id: "text-reveal",
    category: "gsap",
    label: "Text Reveal",
    description: "Character-by-character text reveal",
    initial: { opacity: 0, x: -50, skewX: 10 },
    animate: { opacity: 1, x: 0, skewX: 0 },
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },

  // Creative
  {
    id: "deck-deal",
    category: "creative",
    label: "Deck Deal",
    description: "Cards dealt from a deck",
    initial: { x: 0, y: -300, rotate: -15, opacity: 0 },
    animate: { x: 0, y: 0, rotate: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
  {
    id: "smoke-dissolve",
    category: "creative",
    label: "Smoke Dissolve",
    description: "Ethereal smoke-like appearance",
    initial: { opacity: 0, scale: 1.5, filter: "blur(30px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    transition: { duration: 1.2, ease: "easeOut" },
  },
  {
    id: "shatter",
    category: "creative",
    label: "Shatter",
    description: "Fragment reassembly effect",
    initial: { opacity: 0, scale: 0.3, rotate: 720 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 100, damping: 10, mass: 2 },
  },
  {
    id: "glitch",
    category: "creative",
    label: "Glitch Digital",
    description: "Digital glitch-style entrance",
    initial: { opacity: 0, x: -20, skewX: 10 },
    animate: { opacity: 1, x: 0, skewX: 0 },
    transition: { duration: 0.5 },
  },
  {
    id: "page-turn",
    category: "creative",
    label: "Page Turn",
    description: "Book page turn effect",
    initial: { rotateY: -90, transformOrigin: "left center", opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
  {
    id: "elastic",
    category: "creative",
    label: "Elastic Rubber",
    description: "Stretchy elastic bounce",
    initial: { scaleX: 0, scaleY: 2, opacity: 0 },
    animate: { scaleX: 1, scaleY: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 300, damping: 8 },
  },
  {
    id: "magnetic",
    category: "creative",
    label: "Magnetic Pull",
    description: "Attracted by invisible force",
    initial: { x: 300, rotate: 45, opacity: 0, scale: 0.5 },
    animate: { x: 0, rotate: 0, opacity: 1, scale: 1 },
    transition: { type: "spring", stiffness: 150, damping: 15 },
  },
  {
    id: "stardust",
    category: "creative",
    label: "Stardust Gather",
    description: "Particles coalescing into form",
    initial: { opacity: 0, scale: 0, filter: "blur(10px) brightness(2)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" },
    transition: { duration: 1.5, ease: "easeOut" },
  },
  {
    id: "lightning",
    category: "creative",
    label: "Lightning Reveal",
    description: "Flash of light reveals card",
    initial: { opacity: 0, filter: "brightness(3) contrast(2)", scale: 1.2 },
    animate: { opacity: 1, filter: "brightness(1) contrast(1)", scale: 1 },
    transition: { duration: 0.3 },
  },
  {
    id: "portal",
    category: "creative",
    label: "Portal Vortex",
    description: "Emerging from a portal",
    initial: { scale: 0, rotate: 360, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    transition: { type: "spring", stiffness: 100, damping: 12, mass: 1.5 },
  },
  {
    id: "golden-unfold",
    category: "creative",
    label: "Golden Unfold",
    description: "Majestic golden unfolding",
    initial: { scaleY: 0, opacity: 0, transformOrigin: "top center" },
    animate: { scaleY: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
];

const CATEGORIES = ["css", "framer", "spring", "gsap", "creative"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  css: "CSS",
  framer: "Framer",
  spring: "Spring",
  gsap: "GSAP",
  creative: "Creative",
};

export default function TransitionLibraryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("css");
  const [activeTransitionId, setActiveTransitionId] = useState<string>(TRANSITIONS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0);

  const categoryTransitions = TRANSITIONS.filter((t) => t.category === activeCategory);
  const activeTransition = TRANSITIONS.find((t) => t.id === activeTransitionId) || TRANSITIONS[0];

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    const first = TRANSITIONS.find((t) => t.category === cat);
    if (first) {
      setActiveTransitionId(first.id);
      setIsPlaying(false);
      setKey((k) => k + 1);
    }
  }, []);

  const handleTransitionChange = useCallback((id: string) => {
    setActiveTransitionId(id);
    setIsPlaying(false);
    setKey((k) => k + 1);
  }, []);

  const handlePlay = () => {
    setIsPlaying(false);
    setKey((k) => k + 1);
    requestAnimationFrame(() => setIsPlaying(true));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setKey((k) => k + 1);
  };

  const card = MOCK_CARDS[0];

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="shrink-0 p-3 sm:p-6 pb-0">
        <Link
          href="/mock/effects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Effects
        </Link>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Transition Library</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Single card demo — pick a transition, press Play.
        </p>
      </div>

      {/* Category tabs - horizontal scrollable */}
      <div className="shrink-0 px-3 sm:px-6 pt-3 sm:pt-4">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
              )}
            >
              {CATEGORY_LABELS[cat]} ({TRANSITIONS.filter((t) => t.category === cat).length})
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs for transitions within category - horizontal scrollable */}
      <div className="shrink-0 px-3 sm:px-6 pt-2">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {categoryTransitions.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTransitionChange(t.id)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                activeTransitionId === t.id
                  ? "bg-[#c9a94e]/20 text-[#c9a94e] border border-[#c9a94e]/40"
                  : "bg-white/5 text-muted-foreground hover:text-foreground border border-transparent"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card demo area */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-3 sm:px-6" style={{ perspective: 1000 }}>
        <motion.div
          key={key}
          initial={isPlaying ? activeTransition.initial : activeTransition.initial}
          animate={isPlaying ? activeTransition.animate : activeTransition.initial}
          transition={activeTransition.transition}
        >
          <MockCardFront card={card} size="lg" />
        </motion.div>
      </div>

      {/* Controls */}
      <div className="shrink-0 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <button
            onClick={handlePlay}
            className="px-6 py-2 rounded-lg bg-[#c9a94e] text-black text-sm font-medium hover:bg-[#b89840] transition-colors"
          >
            Play
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Description */}
        <div className="text-center">
          <p className="text-sm font-medium text-white/90">{activeTransition.label}</p>
          <p className="text-xs text-muted-foreground">{activeTransition.description}</p>
        </div>
      </div>
    </div>
  );
}
