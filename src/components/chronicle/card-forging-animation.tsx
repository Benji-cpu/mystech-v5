'use client';

import { cn } from '@/lib/utils';
import { LyraForging } from '@/components/guide/lyra-forging';

interface CardForgingAnimationProps {
  className?: string;
}

export function CardForgingAnimation({ className }: CardForgingAnimationProps) {
  return <LyraForging message="Forging your card..." className={cn('h-full', className)} />;
}
