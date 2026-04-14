'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Compass, Flower2, Flame, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Path, UserPathProgress } from '@/types';

function PathIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  const props = { className: cn('h-5 w-5', className) };
  switch (iconKey) {
    case 'drama':
      return <Compass {...props} />;
    case 'lotus':
      return <Flower2 {...props} />;
    case 'flame':
      return <Flame {...props} />;
    default:
      return <Sparkles {...props} />;
  }
}

function statusLabel(status: UserPathProgress['status'] | null): {
  label: string;
  variant: 'default' | 'secondary' | 'outline';
  className?: string;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', variant: 'default', className: 'border-gold/50 text-gold bg-gold/10' };
    case 'completed':
      return { label: 'Completed', variant: 'outline', className: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' };
    case 'paused':
      return { label: 'Paused', variant: 'secondary' };
    default:
      return { label: 'Not Started', variant: 'outline' };
  }
}

interface PathCardProps {
  path: Path;
  progress: UserPathProgress | null;
  isActive?: boolean;
  className?: string;
}

export function PathCard({ path, progress, isActive, className }: PathCardProps) {
  const status = progress?.status ?? null;
  const badge = statusLabel(status);

  const buttonLabel =
    status === 'completed'
      ? 'View Path'
      : status === 'active'
        ? 'Continue'
        : status === 'paused'
          ? 'Resume'
          : 'Begin Path';

  // Placeholder progress percentage — in a real implementation
  // this would derive from waypoint completion counts
  const progressPct =
    status === 'completed'
      ? 100
      : status === 'active' || status === 'paused'
        ? 35
        : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/[0.03] backdrop-blur-sm',
        'border transition-colors duration-300',
        isActive
          ? 'border-gold/40 shadow-lg shadow-gold/10'
          : 'border-white/10 hover:border-purple-500/30',
        'shadow-lg shadow-purple-900/20',
        className,
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
      )}

      <div className="relative z-10 p-6 flex flex-col gap-4">
        {/* Icon + title + badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                isActive
                  ? 'bg-gold/15 text-gold'
                  : 'bg-white/10 text-white/60',
              )}
            >
              <PathIcon iconKey={path.iconKey} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white/90 leading-tight">
                {path.name}
              </h3>
              {path.themes.length > 0 && (
                <p className="text-xs text-white/40 mt-0.5">
                  {path.themes.slice(0, 2).join(' · ')}
                </p>
              )}
            </div>
          </div>

          <Badge
            variant={badge.variant}
            className={cn('shrink-0 text-[10px]', badge.className)}
          >
            {status === 'completed' && (
              <CheckCircle2 className="h-3 w-3 mr-0.5" />
            )}
            {badge.label}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-white/50 leading-relaxed line-clamp-3">
          {path.description}
        </p>

        {/* Progress bar — only when started */}
        {status && status !== null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <Progress
              value={progressPct}
              className={cn(
                'h-1.5',
                status === 'completed' && '[&>div]:bg-emerald-400',
                isActive && status === 'active' && '[&>div]:bg-gold',
              )}
            />
          </div>
        )}

        {/* CTA button */}
        <Button
          asChild
          variant={isActive ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'w-full mt-auto',
            isActive && 'bg-gold text-black hover:bg-gold/90 shadow-[0_0_20px_rgba(201,169,78,0.3)]',
          )}
        >
          <Link href={`/paths/${path.id}`}>
            {buttonLabel}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
