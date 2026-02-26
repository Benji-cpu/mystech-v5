'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FeatureVignetteProps {
  type: 'story' | 'readings' | 'styles' | 'share';
  className?: string;
}

function CardImage({
  src,
  alt,
  style,
  className,
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-[#c9a94e]/20',
        className,
      )}
      style={style}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="120px"
      />
    </div>
  );
}

function StoryVignette() {
  return (
    <div className="relative flex items-center justify-center h-full w-full">
      {/* Left card */}
      <CardImage
        src="/mock/cards/the-dreamer.png"
        alt="The Dreamer"
        className="w-[clamp(70px,30%,110px)] aspect-[2/3] absolute"
        style={{
          transform: 'rotate(-10deg) translateX(-65%)',
          zIndex: 1,
        }}
      />
      {/* Center card */}
      <CardImage
        src="/mock/cards/the-flame.png"
        alt="The Flame"
        className="w-[clamp(70px,30%,110px)] aspect-[2/3] relative"
        style={{ zIndex: 3 }}
      />
      {/* Right card */}
      <CardImage
        src="/mock/cards/the-garden.png"
        alt="The Garden"
        className="w-[clamp(70px,30%,110px)] aspect-[2/3] absolute"
        style={{
          transform: 'rotate(10deg) translateX(65%)',
          zIndex: 2,
        }}
      />
    </div>
  );
}

function ReadingsVignette() {
  return (
    <div className="flex flex-col items-center gap-2 h-full justify-center w-full">
      <CardImage
        src="/mock/cards/the-oracle.png"
        alt="The Oracle"
        className="w-[clamp(80px,32%,120px)] aspect-[2/3]"
        style={{
          boxShadow: '0 0 30px rgba(201,169,78,0.3)',
        }}
      />
      <p
        className="text-xs sm:text-sm text-[#c9a94e]/60 animate-pulse"
        style={{ animationDuration: '3s' }}
      >
        A moment of clarity awaits...
      </p>
    </div>
  );
}

function StylesVignette() {
  const cards = [
    { src: '/mock/cards/the-alchemist.png', alt: 'The Alchemist', filter: 'none' },
    { src: '/mock/cards/the-wanderer.png', alt: 'The Wanderer', filter: 'hue-rotate(60deg)' },
    { src: '/mock/cards/the-storm.png', alt: 'The Storm', filter: 'saturate(1.5) brightness(1.1)' },
    { src: '/mock/cards/the-weaver.png', alt: 'The Weaver', filter: 'sepia(0.6)' },
  ];

  return (
    <div className="grid grid-cols-2 gap-1.5 place-items-center w-[clamp(120px,55%,220px)]">
      {cards.map(({ src, alt, filter }) => (
        <CardImage
          key={alt}
          src={src}
          alt={alt}
          className="w-full aspect-[2/3]"
          style={{ filter }}
        />
      ))}
    </div>
  );
}

function ShareVignette() {
  return (
    <div className="relative flex items-center justify-center h-full w-full">
      <div
        className="absolute w-[50px] h-[50px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,78,0.1) 0%, transparent 70%)',
          filter: 'blur(8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      />
      <CardImage
        src="/mock/cards/the-bridge.png"
        alt="The Bridge"
        className="w-[clamp(70px,28%,110px)] aspect-[2/3] relative"
        style={{ zIndex: 2 }}
      />
      <CardImage
        src="/mock/cards/the-compass.png"
        alt="The Compass"
        className="w-[clamp(70px,28%,110px)] aspect-[2/3] relative"
        style={{
          marginLeft: '-6%',
          zIndex: 3,
        }}
      />
    </div>
  );
}

const vignettes = {
  story: StoryVignette,
  readings: ReadingsVignette,
  styles: StylesVignette,
  share: ShareVignette,
} as const;

export function FeatureVignette({ type, className }: FeatureVignetteProps) {
  const Vignette = vignettes[type];

  return (
    <div
      className={cn(
        'relative h-[240px] sm:h-[180px] flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      <Vignette />
    </div>
  );
}
