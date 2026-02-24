"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FloorTransitionProps {
  isTransitioning: boolean;
  direction: "up" | "down";
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  size: number;
}

export function FloorTransition({ isTransitioning, direction }: FloorTransitionProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isTransitioning) {
      const newParticles: Particle[] = Array.from({ length: 18 }, (_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 80,
        delay: Math.random() * 0.3,
        size: 3 + Math.random() * 5,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 800);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: `${p.x}vw`,
              y: direction === "up" ? "100vh" : "0vh",
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: direction === "up" ? "-10vh" : "110vh",
              opacity: [0, 0.8, 0.6, 0],
              scale: [0, 1, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: p.delay,
              ease: "easeOut",
            }}
            style={{
              width: p.size,
              height: p.size,
            }}
            className="absolute rounded-full bg-[#c9a94e] shadow-[0_0_8px_rgba(201,169,78,0.6)]"
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
