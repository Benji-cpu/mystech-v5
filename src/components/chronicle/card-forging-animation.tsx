'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardForgingAnimationProps {
  className?: string;
}

// ── Orbiting particle positions ──────────────────────────────────────────

const ORBIT_PARTICLES = [
  { angle: 0,   radius: 52, size: 3, delay: 0 },
  { angle: 45,  radius: 60, size: 2, delay: 0.3 },
  { angle: 90,  radius: 48, size: 4, delay: 0.6 },
  { angle: 135, radius: 58, size: 2, delay: 0.9 },
  { angle: 180, radius: 50, size: 3, delay: 1.2 },
  { angle: 225, radius: 62, size: 2, delay: 1.5 },
  { angle: 270, radius: 46, size: 4, delay: 1.8 },
  { angle: 315, radius: 56, size: 2, delay: 2.1 },
];

// ── Rune symbols ─────────────────────────────────────────────────────────

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];

// ── Component ────────────────────────────────────────────────────────────

export function CardForgingAnimation({ className }: CardForgingAnimationProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'w-full h-full min-h-[200px]',
        className
      )}
    >
      {/* Outer ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,78,0.08) 0%, transparent 70%)',
            'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(201,169,78,0.15) 0%, transparent 70%)',
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,78,0.08) 0%, transparent 70%)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting ring */}
      <motion.div
        className="absolute"
        style={{ width: 136, height: 136 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <svg width="136" height="136" viewBox="0 0 136 136" fill="none">
          <circle
            cx="68"
            cy="68"
            r="60"
            stroke="url(#goldRing)"
            strokeWidth="0.75"
            strokeDasharray="6 4"
            opacity="0.4"
          />
          <defs>
            <linearGradient id="goldRing" x1="0" y1="0" x2="136" y2="136" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#c9a94e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#ffd700" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c9a94e" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Counter-rotating rune ring */}
      <motion.div
        className="absolute"
        style={{ width: 180, height: 180 }}
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        {RUNES.map((rune, i) => {
          const angle = (i / RUNES.length) * 360;
          const rad = (angle * Math.PI) / 180;
          const x = 90 + 78 * Math.cos(rad);
          const y = 90 + 78 * Math.sin(rad);
          return (
            <motion.span
              key={rune}
              className="absolute text-[10px] text-[#c9a94e]/40 font-mono select-none"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            >
              {rune}
            </motion.span>
          );
        })}
      </motion.div>

      {/* Orbiting gold particles */}
      {ORBIT_PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = 50 + p.radius * Math.cos(rad);
        const y = 50 + p.radius * Math.sin(rad);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#ffd700]"
            style={{
              width: p.size,
              height: p.size,
              left: `${x}%`,
              top: `${y}%`,
              translateX: '-50%',
              translateY: '-50%',
            }}
            animate={{
              opacity: [0, 0.9, 0],
              scale: [0.5, 1.4, 0.5],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Central pulsing sigil */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Core glow disc */}
        <div className="relative">
          <motion.div
            className="w-16 h-16 rounded-full"
            animate={{
              boxShadow: [
                '0 0 20px 4px rgba(201,169,78,0.3)',
                '0 0 40px 12px rgba(201,169,78,0.5)',
                '0 0 20px 4px rgba(201,169,78,0.3)',
              ],
              background: [
                'radial-gradient(circle, rgba(201,169,78,0.15) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(201,169,78,0.3) 0%, transparent 70%)',
                'radial-gradient(circle, rgba(201,169,78,0.15) 0%, transparent 70%)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inner star */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2 L17.5 13 L28 8 L19 16 L28 24 L17.5 19 L16 30 L14.5 19 L4 24 L13 16 L4 8 L14.5 13 Z"
                fill="#c9a94e"
                opacity="0.7"
              />
            </svg>
          </motion.div>
        </div>

        {/* Status text */}
        <motion.p
          className="text-[#c9a94e]/80 text-xs font-medium tracking-[0.15em] uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Forging your card...
        </motion.p>

        {/* Shimmer bar */}
        <div className="relative w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#c9a94e]/60 to-transparent"
            animate={{ left: ['-33%', '100%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
