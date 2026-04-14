'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Settings2,
  Crown,
  Flower2,
  Diamond,
  BookOpen,
  Shield,
  Eye,
  Sun,
  Waves,
  Hexagon,
  Circle,
  Zap,
  Globe,
  TreePine,
  Triangle,
  Compass,
  Target,
  Feather,
  Leaf,
  Droplets,
  Heart,
  Square,
  Paintbrush,
  Brush,
  Star,
  Scissors,
  Gem,
  Palette,
  Camera,
  Moon,
  Anchor,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ART_STYLE_GRADIENTS } from '@/lib/constants';

// ── Types ──────────────────────────────────────────────────────────────────

interface StyleCardStyle {
  id: string;
  name: string;
  description: string;
  category?: string | null;
  previewImages?: string[];
}

interface StyleCardProps {
  style: StyleCardStyle;
  isSelected?: boolean;
  onSelect?: () => void;
  onCustomize?: () => void;
  className?: string;
}

// ── Icon map ───────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<LucideProps>;

const ICON_MAP: Record<string, IconComponent> = {
  Crown,
  Flower2,
  Diamond,
  BookOpen,
  Shield,
  Eye,
  Sun,
  Waves,
  Hexagon,
  Circle,
  Shapes: Square, // fallback — Shapes not always exported
  Zap,
  Globe,
  TreePine,
  Sparkles,
  Layers: Gem,    // Layers fallback
  Triangle,
  Compass,
  Orbit: Circle, // fallback
  Target,
  Feather,
  Leaf,
  Droplets,
  Heart,
  Square,
  Paintbrush,
  Brush,
  Star,
  Scissors,
  Gem,
  Palette,
  Camera,
  Moon,
  Anchor,
  Rainbow: Sparkles, // fallback
  CloudSun: Sun,    // fallback
  Skull: Shield,    // fallback
};

function StyleIcon({ iconName, className }: { iconName: string; className?: string }) {
  const IconComponent = ICON_MAP[iconName] ?? Sparkles;
  return <IconComponent className={className} />;
}

// ── Gradient placeholder ───────────────────────────────────────────────────

function GradientPlaceholder({
  styleId,
  className,
}: {
  styleId: string;
  className?: string;
}) {
  const meta = ART_STYLE_GRADIENTS[styleId];
  const gradient = meta?.gradient ?? 'from-purple-900 via-indigo-800 to-purple-800';
  const iconName = meta?.icon ?? 'Sparkles';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        `bg-gradient-to-br ${gradient}`,
        className,
      )}
    >
      <StyleIcon
        iconName={iconName}
        className="size-8 text-white/30 drop-shadow-sm"
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const cardVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
  tap: { scale: 0.98, transition: { type: 'spring' as const, stiffness: 400, damping: 28 } },
};

const selectedRingVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 },
  },
};

export function StyleCard({
  style,
  isSelected = false,
  onSelect,
  onCustomize,
  className,
}: StyleCardProps) {
  const previewSrc = useMemo(
    () => (style.previewImages && style.previewImages.length > 0 ? style.previewImages[0] : null),
    [style.previewImages],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.();
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover={onSelect ? 'hover' : 'rest'}
      whileTap={onSelect ? 'tap' : 'rest'}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.03] backdrop-blur-sm border',
        'transition-colors duration-200',
        isSelected
          ? 'border-primary/60 shadow-[0_0_0_1px_rgba(201,169,78,0.4),0_0_20px_rgba(201,169,78,0.12)]'
          : 'border-white/10 hover:border-white/20',
        onSelect && 'cursor-pointer',
        className,
      )}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? isSelected : undefined}
    >
      {/* Gold selection ring indicator */}
      {isSelected && (
        <motion.div
          variants={selectedRingVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 rounded-2xl pointer-events-none z-10 ring-2 ring-primary/50"
        />
      )}

      {/* Preview image / gradient placeholder */}
      <div className="aspect-[2/3] w-full overflow-hidden">
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt={style.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <GradientPlaceholder styleId={style.id} className="w-full h-full" />
        )}
      </div>

      {/* Card body */}
      <div className="p-3 space-y-2">
        {/* Name + category badge */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold leading-tight">{style.name}</p>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="shrink-0 mt-0.5"
              >
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 10 10"
                  >
                    <path
                      d="M2 5.5L4 7.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </div>
          {style.category && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0.5 h-auto capitalize bg-white/10 text-muted-foreground border-transparent"
            >
              {style.category}
            </Badge>
          )}
        </div>

        {/* Description — clamped to 2 lines */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {style.description}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
          {onSelect && (
            <Button
              type="button"
              size="sm"
              onClick={onSelect}
              className={cn(
                'flex-1 h-9 text-xs',
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(201,169,78,0.25)]'
                  : 'bg-white/10 hover:bg-white/15 text-foreground border border-white/10',
              )}
            >
              {isSelected ? 'Selected' : 'Use'}
            </Button>
          )}
          {onCustomize && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onCustomize}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10"
              title="Customize style"
            >
              <Settings2 className="size-3.5" />
              <span className="sr-only">Customize</span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
