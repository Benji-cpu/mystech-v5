'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shuffle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ── Types ──────────────────────────────────────────────────────────────────

export interface StudioParameters {
  styleStrength?: number;
  colorTemperature?: number;
  detailLevel?: number;
  mood?: number;
  seed?: number;
  cfgScale?: number;
  sampler?: string;
  stabilityPreset?: string;
  negativePrompt?: string;
}

export interface ParameterControlsProps {
  parameters: StudioParameters;
  onChange: (params: Partial<StudioParameters>) => void;
  isPro?: boolean;
  showProControls?: boolean;
  onToggleProControls?: () => void;
  className?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STABILITY_PRESETS = [
  { value: 'fantasy-art', label: 'Fantasy Art' },
  { value: 'neon-punk', label: 'Neon Punk' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'line-art', label: 'Line Art' },
  { value: 'analog-film', label: 'Analog Film' },
  { value: 'comic-book', label: 'Comic Book' },
  { value: 'photographic', label: 'Photographic' },
  { value: '3d-model', label: '3D Model' },
  { value: 'anime', label: 'Anime' },
  { value: 'enhance', label: 'Enhance' },
  { value: 'cinematic', label: 'Cinematic' },
];

const SAMPLERS = [
  { value: 'DDIM', label: 'DDIM' },
  { value: 'K_EULER', label: 'K Euler' },
  { value: 'K_DPM_2', label: 'K DPM 2' },
  { value: 'K_DPM_2_ANCESTRAL', label: 'K DPM 2 Ancestral' },
  { value: 'K_EULER_ANCESTRAL', label: 'K Euler Ancestral' },
  { value: 'K_HEUN', label: 'K Heun' },
  { value: 'K_LMS', label: 'K LMS' },
];

// ── Sub-components ─────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  onChange: (value: number) => void;
}

function SliderRow({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  leftLabel,
  rightLabel,
  onChange,
}: SliderRowProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <span className="text-xs font-mono text-primary tabular-nums">{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'w-full h-1.5 rounded-full appearance-none cursor-pointer',
            'bg-white/10',
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:bg-primary',
            '[&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(201,169,78,0.5)]',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background',
            '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary',
            '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background',
            '[&::-moz-range-thumb]:cursor-pointer',
          )}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
          }}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between">
          {leftLabel && (
            <span className="text-[10px] text-muted-foreground/60">{leftLabel}</span>
          )}
          {rightLabel && (
            <span className="text-[10px] text-muted-foreground/60">{rightLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const proSectionVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 35 },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 35 },
  },
};

export function ParameterControls({
  parameters,
  onChange,
  isPro = false,
  showProControls = false,
  onToggleProControls,
  className,
}: ParameterControlsProps) {
  const [localShowPro, setLocalShowPro] = useState(showProControls);

  const isProExpanded = isPro ? localShowPro : false;

  function handleTogglePro() {
    if (!isPro) return;
    const next = !localShowPro;
    setLocalShowPro(next);
    onToggleProControls?.();
  }

  function randomizeSeed() {
    onChange({ seed: Math.floor(Math.random() * 4_294_967_295) });
  }

  return (
    <div className={cn('space-y-5', className)}>
      {/* Basic Controls */}
      <div
        className={cn(
          'rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
          'p-4 space-y-4',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Basic Controls
        </p>

        <SliderRow
          label="Style Strength"
          value={parameters.styleStrength ?? 75}
          onChange={(v) => onChange({ styleStrength: v })}
        />

        <SliderRow
          label="Color Temperature"
          value={parameters.colorTemperature ?? 50}
          leftLabel="Cool"
          rightLabel="Warm"
          onChange={(v) => onChange({ colorTemperature: v })}
        />

        <SliderRow
          label="Detail Level"
          value={parameters.detailLevel ?? 60}
          leftLabel="Minimal"
          rightLabel="Intricate"
          onChange={(v) => onChange({ detailLevel: v })}
        />

        <SliderRow
          label="Mood"
          value={parameters.mood ?? 50}
          leftLabel="Light"
          rightLabel="Dark"
          onChange={(v) => onChange({ mood: v })}
        />
      </div>

      {/* Pro Controls Toggle */}
      <button
        type="button"
        onClick={handleTogglePro}
        className={cn(
          'w-full flex items-center justify-between',
          'rounded-2xl border px-4 py-3',
          'text-sm font-medium transition-colors',
          'min-h-[44px]',
          isPro
            ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-primary/30 cursor-pointer'
            : 'bg-white/[0.03] border-white/5 cursor-default opacity-60',
        )}
        disabled={!isPro}
        aria-expanded={isProExpanded}
      >
        <span className="flex items-center gap-2">
          {!isPro && <Lock className="size-3.5 text-muted-foreground/60" />}
          <span className={cn(isPro ? 'text-foreground' : 'text-muted-foreground')}>
            Pro Controls
          </span>
          {!isPro && (
            <span className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">
              Pro
            </span>
          )}
        </span>
        {isPro && (
          <motion.div
            animate={{ rotate: isProExpanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <ChevronDown className="size-4 text-muted-foreground" />
          </motion.div>
        )}
      </button>

      {/* Pro Controls Panel */}
      <AnimatePresence initial={false}>
        {isProExpanded && (
          <motion.div
            key="pro-controls"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={proSectionVariants}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10',
                'p-4 space-y-5',
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                Advanced Parameters
              </p>

              {/* Seed */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Seed</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={4294967295}
                    value={parameters.seed ?? ''}
                    placeholder="Random"
                    onChange={(e) =>
                      onChange({
                        seed: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                    className="h-9 flex-1 bg-white/5 border-white/10 text-sm font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={randomizeSeed}
                    className="h-9 w-9 shrink-0 border-white/10 bg-white/5 hover:bg-white/10"
                    title="Randomize seed"
                  >
                    <Shuffle className="size-4" />
                  </Button>
                </div>
              </div>

              {/* CFG Scale */}
              <SliderRow
                label="CFG Scale"
                value={parameters.cfgScale ?? 7}
                min={5}
                max={15}
                step={0.5}
                leftLabel="5 — loose"
                rightLabel="15 — strict"
                onChange={(v) => onChange({ cfgScale: v })}
              />

              {/* Stability AI Style Preset */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Style Preset</Label>
                <Select
                  value={parameters.stabilityPreset ?? ''}
                  onValueChange={(v) =>
                    onChange({ stabilityPreset: v === '' ? undefined : v })
                  }
                >
                  <SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-sm">
                    <SelectValue placeholder="Select preset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STABILITY_PRESETS.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sampler */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Sampler</Label>
                <Select
                  value={parameters.sampler ?? ''}
                  onValueChange={(v) =>
                    onChange({ sampler: v === '' ? undefined : v })
                  }
                >
                  <SelectTrigger className="w-full h-9 bg-white/5 border-white/10 text-sm">
                    <SelectValue placeholder="Select sampler…" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLERS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Negative Prompt</Label>
                <Textarea
                  value={parameters.negativePrompt ?? ''}
                  onChange={(e) =>
                    onChange({ negativePrompt: e.target.value || undefined })
                  }
                  placeholder="Elements to exclude from the image…"
                  rows={3}
                  className="resize-none bg-white/5 border-white/10 text-sm placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
