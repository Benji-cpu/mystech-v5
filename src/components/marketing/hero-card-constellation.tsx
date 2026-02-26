'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardEntry {
  src: string;
  alt: string;
  left: string;
  top: string;
  opacity: number;
  duration: number;
  delay: number;
  rotation: number;
}

const DESKTOP_CARDS: CardEntry[] = [
  {
    src: '/mock/cards/the-dreamer.png',
    alt: 'The Dreamer oracle card',
    left: '8%',
    top: '25%',
    opacity: 0.4,
    duration: 6.2,
    delay: 0,
    rotation: -8,
  },
  {
    src: '/mock/cards/the-alchemist.png',
    alt: 'The Alchemist oracle card',
    left: '22%',
    top: '12%',
    opacity: 0.45,
    duration: 7.5,
    delay: 1.2,
    rotation: -3,
  },
  {
    src: '/mock/cards/the-flame.png',
    alt: 'The Flame oracle card',
    left: '48%',
    top: '35%',
    opacity: 0.3,
    duration: 5.8,
    delay: 0.6,
    rotation: 2,
  },
  {
    src: '/mock/cards/the-mirror.png',
    alt: 'The Mirror oracle card',
    left: '72%',
    top: '15%',
    opacity: 0.4,
    duration: 8.0,
    delay: 1.8,
    rotation: 5,
  },
  {
    src: '/mock/cards/the-wanderer.png',
    alt: 'The Wanderer oracle card',
    left: '88%',
    top: '30%',
    opacity: 0.35,
    duration: 6.8,
    delay: 0.4,
    rotation: 9,
  },
];

const MOBILE_CARDS: CardEntry[] = [
  {
    src: '/mock/cards/the-dreamer.png',
    alt: 'The Dreamer oracle card',
    left: '5%',
    top: '15%',
    opacity: 0.35,
    duration: 6.2,
    delay: 0,
    rotation: -8,
  },
  {
    src: '/mock/cards/the-flame.png',
    alt: 'The Flame oracle card',
    left: '40%',
    top: '30%',
    opacity: 0.25,
    duration: 5.8,
    delay: 0.6,
    rotation: 2,
  },
  {
    src: '/mock/cards/the-wanderer.png',
    alt: 'The Wanderer oracle card',
    left: '75%',
    top: '18%',
    opacity: 0.35,
    duration: 6.8,
    delay: 0.4,
    rotation: 9,
  },
];

interface HeroCardConstellationProps {
  className?: string;
}

export function HeroCardConstellation({ className }: HeroCardConstellationProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        className,
      )}
      aria-hidden="true"
    >
      {/* Desktop cards (md+) */}
      {DESKTOP_CARDS.map((card) => (
        <FloatingCard
          key={`desktop-${card.src}`}
          card={card}
          className="hidden md:block"
          cardSize="md:w-[130px] md:h-[195px]"
        />
      ))}

      {/* Mobile cards — bigger images for small screens */}
      {MOBILE_CARDS.map((card) => (
        <FloatingCard
          key={`mobile-${card.src}`}
          card={card}
          className="block md:hidden"
          cardSize="w-[90px] h-[135px]"
        />
      ))}
    </div>
  );
}

interface FloatingCardProps {
  card: CardEntry;
  className?: string;
  cardSize?: string;
}

function FloatingCard({ card, className, cardSize = "w-[90px] h-[135px] md:w-[130px] md:h-[195px]" }: FloatingCardProps) {
  return (
    <motion.div
      className={cn('absolute', className)}
      style={{
        left: card.left,
        top: card.top,
        opacity: card.opacity,
        rotate: card.rotation,
      }}
      animate={{ y: [0, -12, 0] }}
      transition={{
        duration: card.duration,
        delay: card.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className={cn("relative", cardSize)}>
        <Image
          src={card.src}
          alt={card.alt}
          fill
          sizes="(max-width: 768px) 90px, 130px"
          className="object-cover rounded-xl border border-[#c9a94e]/20 shadow-lg shadow-black/40"
        />
      </div>
    </motion.div>
  );
}
