'use client';

import { motion } from 'framer-motion';
import { Sparkles, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ── Types ──────────────────────────────────────────────────────────────────

interface PreviewGridProps {
  previews: string[];
  isLoading?: boolean;
  onGenerate?: () => void;
  className?: string;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ShimmerCell() {
  return (
    <div
      className={cn(
        'relative aspect-[2/3] rounded-xl overflow-hidden',
        'bg-white/5 border border-white/10',
      )}
    >
      {/* Animated shimmer */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      {/* Placeholder icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="size-6 text-muted-foreground/20" />
      </div>
    </div>
  );
}

function PreviewCell({ src, index }: { src: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28, delay: index * 0.06 }}
      className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10"
      whileHover={{ scale: 1.03 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Style preview ${index + 1}`}
        className="w-full h-full object-cover"
      />
      {/* Subtle inner shadow overlay */}
      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] rounded-xl pointer-events-none" />
    </motion.div>
  );
}

function EmptyCell({ index }: { index: number }) {
  return (
    <div
      key={index}
      className={cn(
        'relative aspect-[2/3] rounded-xl overflow-hidden',
        'bg-white/[0.03] border border-white/[0.06]',
        'flex items-center justify-center',
      )}
    >
      <ImageIcon className="size-5 text-muted-foreground/15" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const GRID_SIZE = 4; // 2x2

export function PreviewGrid({
  previews,
  isLoading = false,
  onGenerate,
  className,
}: PreviewGridProps) {
  // Build the 4 cells: filled, shimmer (loading), or empty
  const cells = Array.from({ length: GRID_SIZE }, (_, i) => {
    if (i < previews.length) return { type: 'preview', src: previews[i] } as const;
    if (isLoading) return { type: 'shimmer' } as const;
    return { type: 'empty' } as const;
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {cells.map((cell, i) => {
          if (cell.type === 'preview') {
            return <PreviewCell key={i} src={cell.src} index={i} />;
          }
          if (cell.type === 'shimmer') {
            return <ShimmerCell key={i} />;
          }
          return <EmptyCell key={i} index={i} />;
        })}
      </div>

      {/* Generate button */}
      {onGenerate && (
        <Button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className={cn(
            'w-full h-11',
            isLoading
              ? 'bg-white/5 border border-white/10 text-muted-foreground cursor-wait'
              : cn(
                  'bg-primary/10 hover:bg-primary/20',
                  'text-primary border border-primary/20',
                  'shadow-[0_0_16px_rgba(201,169,78,0.15)]',
                  'hover:shadow-[0_0_20px_rgba(201,169,78,0.25)]',
                  'transition-shadow',
                ),
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating previews…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              {previews.length > 0 ? 'Regenerate Previews' : 'Generate Preview'}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
