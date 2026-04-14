'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollReveal } from './scroll-reveal';

interface ArtStyleMarqueeProps {
  className?: string;
}

const CARD_IMAGES = [
  { src: '/mock/cards/the-dreamer.png', alt: 'The Dreamer' },
  { src: '/mock/cards/the-alchemist.png', alt: 'The Alchemist' },
  { src: '/mock/cards/the-flame.png', alt: 'The Flame' },
  { src: '/mock/cards/the-mirror.png', alt: 'The Mirror' },
  { src: '/mock/cards/the-wanderer.png', alt: 'The Wanderer' },
  { src: '/mock/cards/the-oracle.png', alt: 'The Oracle' },
  { src: '/mock/cards/the-garden.png', alt: 'The Garden' },
  { src: '/mock/cards/the-storm.png', alt: 'The Storm' },
  { src: '/mock/cards/the-weaver.png', alt: 'The Weaver' },
  { src: '/mock/cards/the-bridge.png', alt: 'The Bridge' },
  { src: '/mock/cards/the-compass.png', alt: 'The Compass' },
  { src: '/mock/cards/the-guardian.png', alt: 'The Guardian' },
];

const ART_STYLE_FILTERS = [
  'none',
  'hue-rotate(180deg) saturate(1.2)',
  'sepia(0.8) saturate(1.4)',
  'saturate(1.8) contrast(1.1)',
  'brightness(1.2) hue-rotate(60deg)',
];

function CardItem({
  src,
  alt,
  filter,
}: {
  src: string;
  alt: string;
  filter: string;
}) {
  return (
    <motion.div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-xl',
        'w-[120px] h-[180px] sm:w-[150px] sm:h-[225px]',
        'border border-gold/20',
        'shadow-lg shadow-purple-900/20',
      )}
      whileHover={{ scale: 1.05, y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{ filter: filter !== 'none' ? filter : undefined }}
        sizes="(max-width: 640px) 120px, 150px"
      />
    </motion.div>
  );
}

export function ArtStyleMarquee({ className }: ArtStyleMarqueeProps) {
  const cardsWithFilters = CARD_IMAGES.map((card, index) => ({
    ...card,
    filter: ART_STYLE_FILTERS[index % ART_STYLE_FILTERS.length],
  }));

  return (
    <section
      className={cn(
        'py-16 sm:py-20 border-t border-border/40',
        className,
      )}
    >
      <ScrollReveal className="text-center px-6">
        <h2 className="text-2xl sm:text-3xl font-bold font-display">
          Every story deserves its own aesthetic
        </h2>
        <p className="mt-3 text-muted-foreground">
          Choose from mystical art styles — or create your own
        </p>
      </ScrollReveal>

      <div className="mt-10 overflow-hidden">
        <div
          className="flex gap-4 animate-marquee"
          style={{ width: 'max-content' }}
        >
          {cardsWithFilters.map((card) => (
            <CardItem
              key={`a-${card.alt}`}
              src={card.src}
              alt={card.alt}
              filter={card.filter}
            />
          ))}
          {cardsWithFilters.map((card) => (
            <CardItem
              key={`b-${card.alt}`}
              src={card.src}
              alt={card.alt}
              filter={card.filter}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
