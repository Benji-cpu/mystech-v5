"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MockImmersiveShell } from "@/components/mock/mock-immersive-shell";
import { useMockImmersive } from "@/components/mock/mock-immersive-provider";
import { MockCardFront, MockCardBack } from "@/components/mock/mock-card";
import { MOCK_CARDS } from "@/components/mock/mock-data";
import { useCardReveal } from "@/hooks/use-card-reveal";
import { Button } from "@/components/ui/button";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  alpha: number;
  size: number;
}

interface StardustCanvasProps {
  width: number;
  height: number;
  isActive: boolean;
  onComplete: () => void;
}

function StardustCanvas({ width, height, isActive, onComplete }: StardustCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduce particles on mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const particleCount = isMobile ? 60 : 150;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Random starting position (scattered across canvas)
      const x = Math.random() * width;
      const y = Math.random() * height;

      // Target positions along the card border
      const side = Math.floor(Math.random() * 4);
      let targetX: number, targetY: number;

      switch (side) {
        case 0: // Top edge
          targetX = Math.random() * width;
          targetY = 0;
          break;
        case 1: // Right edge
          targetX = width;
          targetY = Math.random() * height;
          break;
        case 2: // Bottom edge
          targetX = Math.random() * width;
          targetY = height;
          break;
        default: // Left edge
          targetX = 0;
          targetY = Math.random() * height;
      }

      particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        targetX,
        targetY,
        alpha: Math.random() * 0.5 + 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    particlesRef.current = particles;

    // Animation loop
    let arrived = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) {
          arrived++;
          return;
        }

        // Accelerate as they get closer
        const speed = 2 + (1 - distance / (width + height)) * 3;
        p.vx = (dx / distance) * speed;
        p.vy = (dy / distance) * speed;

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle with golden glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(201, 169, 78, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${p.alpha * 0.5})`);
        gradient.addColorStop(1, "rgba(201, 169, 78, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      });

      if (arrived >= particles.length * 0.9) {
        // Most particles arrived, complete
        onComplete();
      } else {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, width, height, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}

interface FlipCardProps {
  card: typeof MOCK_CARDS[0];
  state: "hidden" | "revealing" | "revealed";
  onRevealComplete: () => void;
  cardWidth: number;
  cardHeight: number;
}

function FlipCard({ card, state, onRevealComplete, cardWidth, cardHeight }: FlipCardProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (state === "revealing") {
      setShowParticles(true);
    }
  }, [state]);

  const handleParticlesComplete = () => {
    setShowParticles(false);
    setIsFlipped(true);
    setTimeout(() => {
      onRevealComplete();
    }, 1200);
  };

  return (
    <div className="relative" style={{ width: cardWidth, height: cardHeight }}>
      {/* Particle canvas overlay */}
      <StardustCanvas
        width={cardWidth}
        height={cardHeight}
        isActive={showParticles}
        onComplete={handleParticlesComplete}
      />

      {/* Card border (appears after particles gather) */}
      <AnimatePresence>
        {!showParticles && state !== "hidden" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-xl border border-[#c9a94e]/60 pointer-events-none z-0"
            style={{
              boxShadow: state === "revealed" ? "0 0 30px rgba(201,169,78,0.3)" : "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* 3D flip container */}
      <motion.div
        className="relative w-full h-full"
        style={{ perspective: 1000 }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
      >
        <div
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Back face */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
          >
            <MockCardBack width={cardWidth} height={cardHeight} />
          </div>

          {/* Front face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <MockCardFront card={card} width={cardWidth} height={cardHeight} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MaterializationContent() {
  const { setMood } = useMockImmersive();
  const cards = MOCK_CARDS.slice(0, 3);

  // Responsive card sizing
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const cardWidth = isMobile ? 90 : 140;
  const cardHeight = isMobile ? 135 : 210;

  const { cardStates, isRevealing, allRevealed, startReveal, reset } = useCardReveal({
    cardCount: 3,
    revealDuration: 2000,
    delayBetween: 1500,
    onAllRevealed: () => {
      setTimeout(() => {
        setMood({ primaryHue: 290, sparkleColor: "#c9a94e" });
      }, 800);
    },
  });

  const handleRevealComplete = (index: number) => {
    if (index === 0 || index === 1 || index === 2) {
      setMood({ primaryHue: 50, sparkleColor: "#ffd700" });
    }
  };

  const handleStart = () => {
    startReveal();
  };

  const handleReset = () => {
    reset();
    setMood({ primaryHue: 285, sparkleColor: "#c9a94e" });
  };

  const currentCard = cardStates.findIndex((s) => s === "revealing");
  const statusText = isRevealing
    ? `Card ${currentCard + 1} of 3 materializing...`
    : allRevealed
    ? "All cards revealed"
    : "Ready to begin";

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {/* Back link */}
      <div className="shrink-0 p-3 sm:p-6">
        <Link
          href="/mock/reading"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors"
        >
          <span>←</span>
          <span className="hidden sm:inline">Back to Reading Mocks</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Title */}
      <div className="shrink-0 text-center px-3 sm:px-6 pb-2 sm:pb-4">
        <h1 className="text-xl sm:text-4xl font-light text-white mb-1 sm:mb-4 tracking-wide">
          Materialization Ceremony
        </h1>
        <p className="text-white/60 text-xs sm:text-lg max-w-3xl mx-auto">
          Watch as three cards gather from stardust and reveal their wisdom.
        </p>
      </div>

      {/* Card zone */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-3 sm:px-6">
        <div className="flex items-center justify-center gap-3 sm:gap-8">
          {cards.map((card, index) => (
            <FlipCard
              key={card.id}
              card={card}
              state={cardStates[index]}
              onRevealComplete={() => handleRevealComplete(index)}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          ))}
        </div>
      </div>

      {/* Status and controls */}
      <div className="shrink-0 text-center px-3 sm:px-6 py-4 sm:py-8 space-y-3 sm:space-y-6">
        <p className="text-white/80 text-xs sm:text-sm font-medium tracking-wide">
          {statusText}
        </p>

        <div className="flex items-center justify-center gap-4">
          {!isRevealing && !allRevealed && (
            <Button
              onClick={handleStart}
              size={isMobile ? "default" : "lg"}
              className="bg-[#c9a94e] hover:bg-[#b89840] text-black font-medium"
            >
              Start Materialization
            </Button>
          )}

          {allRevealed && (
            <Button
              onClick={handleReset}
              size={isMobile ? "default" : "lg"}
              variant="outline"
              className="border-[#c9a94e]/40 text-[#c9a94e] hover:bg-[#c9a94e]/10"
            >
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaterializationPage() {
  return (
    <MockImmersiveShell>
      <MaterializationContent />
    </MockImmersiveShell>
  );
}
