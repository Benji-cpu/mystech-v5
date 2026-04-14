'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Particle {
  top: string;
  left: string;
  delay: number;
  duration: number;
}

const PARTICLES: Particle[] = [
  { top: '5%',  left: '15%',  delay: 0,    duration: 3.2 },
  { top: '12%', left: '78%',  delay: 0.8,  duration: 4.1 },
  { top: '25%', left: '5%',   delay: 1.6,  duration: 3.8 },
  { top: '30%', left: '90%',  delay: 2.4,  duration: 5.0 },
  { top: '55%', left: '8%',   delay: 0.4,  duration: 4.5 },
  { top: '60%', left: '85%',  delay: 3.2,  duration: 3.5 },
  { top: '75%', left: '20%',  delay: 1.2,  duration: 4.8 },
  { top: '80%', left: '72%',  delay: 2.0,  duration: 3.9 },
  { top: '88%', left: '48%',  delay: 4.0,  duration: 4.2 },
  { top: '18%', left: '55%',  delay: 5.0,  duration: 3.6 },
];

interface CtaCardRevealProps {
  className?: string;
}

export function CtaCardReveal({ className }: CtaCardRevealProps) {
  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* Floating gold particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-gold rounded-full absolute"
          style={{ top: p.top, left: p.left }}
          animate={{
            opacity: [0.15, 0.7, 0.15],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Perspective wrapper for 3D card flip */}
      <div
        className="perspective-1000"
        style={{ perspective: '1000px' }}
        aria-hidden="true"
      >
        {/* Flipping card container */}
        <div
          className="relative w-[120px] h-[180px] sm:w-[150px] sm:h-[225px] animate-card-flip"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Back face */}
          <div
            className={cn(
              'absolute inset-0',
              'w-full h-full',
              'bg-gradient-to-b from-[#180428] to-[#0d0020]',
              'border border-gold/40 rounded-xl',
              'flex items-center justify-center',
            )}
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Inner border */}
            <div className="absolute inset-[3px] rounded-[9px] border border-gold/20" />

            {/* Sacred geometry */}
            <div className="relative flex items-center justify-center">
              {/* Outer circle */}
              <div className="absolute w-16 h-16 rounded-full border border-gold/20" />
              {/* Inner circle */}
              <div className="absolute w-10 h-10 rounded-full border border-gold/30" />
              {/* Diamond */}
              <div className="w-12 h-12 border border-gold/25 rotate-45" />
            </div>
          </div>

          {/* Front face — pre-rotated 180deg so it shows on back side of flip */}
          <div
            className={cn(
              'absolute inset-0',
              'w-full h-full',
              'rounded-xl border border-gold/40 overflow-hidden',
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Image
              src="/mock/cards/the-oracle.png"
              alt="The Oracle oracle card"
              fill
              sizes="(max-width: 640px) 120px, 150px"
              className="object-cover"
            />

            {/* Gold corner accents */}
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-gold/60" />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-gold/60" />
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-gold/60" />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-gold/60" />

            {/* Title overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
              <p className="text-xs text-gold text-center font-medium tracking-wide">
                The Oracle
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
