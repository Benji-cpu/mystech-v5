"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface StepReadingPreviewProps {
  className?: string;
}

const cards = [
  { name: "The Dreamer", image: "/mock/cards/the-dreamer.png", delay: 0.3 },
  { name: "The Oracle", image: "/mock/cards/the-oracle.png", delay: 0.8 },
  { name: "The Flame", image: "/mock/cards/the-flame.png", delay: 1.3 },
];

interface FlipCardProps {
  name: string;
  image: string;
  flipDelay: number;
  triggerFlip: boolean;
}

function FlipCard({ name, image, flipDelay, triggerFlip }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!triggerFlip) return;
    const t = setTimeout(() => setFlipped(true), flipDelay * 1000);
    return () => clearTimeout(t);
  }, [triggerFlip, flipDelay]);

  return (
    <div
      className="relative w-[72px] h-[108px]"
      style={{ perspective: "1000px" }}
    >
      {/* Back face */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl overflow-hidden",
          "border border-[#c9a94e]/40",
          "bg-gradient-to-b from-[#180428] to-[#0d0020]"
        )}
        animate={{ rotateY: flipped ? -180 : 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
        }}
        style={{ backfaceVisibility: "hidden" }}
      >
        {/* Sacred geometry */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border border-[#c9a94e]/30 rotate-45" />
          <div className="absolute w-6 h-6 border border-[#c9a94e]/20 rounded-full" />
          <div className="absolute w-10 h-10 border border-[#c9a94e]/10 rounded-full" />
        </div>
        <div className="absolute inset-[3px] rounded-[9px] border border-[#c9a94e]/20 pointer-events-none" />
      </motion.div>

      {/* Front face — pre-rotated 180deg so it faces forward after flip */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl overflow-hidden",
          "border border-[#c9a94e]/40",
          "shadow-lg shadow-purple-900/30"
        )}
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
        }}
        style={{ backfaceVisibility: "hidden" }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-1">
          <p className="text-center text-[9px] font-medium text-[#c9a94e] tracking-wide truncate">
            {name}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function StepReadingPreview({ className }: StepReadingPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });
  const [showInterpretation, setShowInterpretation] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    // Show interpretation text after all three cards have flipped (~1.3s delay + flip duration)
    const t = setTimeout(() => setShowInterpretation(true), 2200);
    return () => clearTimeout(t);
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className={cn("max-w-[280px] mx-auto flex flex-col items-center", className)}
    >
      {/* Three-card spread */}
      <div className="flex gap-2 items-center justify-center">
        {cards.map((card) => (
          <FlipCard
            key={card.name}
            name={card.name}
            image={card.image}
            flipDelay={card.delay}
            triggerFlip={isInView}
          />
        ))}
      </div>

      {/* Interpretation text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={
          showInterpretation ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }
        }
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="text-sm text-[#c9a94e]/70 text-center italic mt-3"
      >
        The Dreamer asks you to trust what&apos;s emerging...
      </motion.p>
    </div>
  );
}
