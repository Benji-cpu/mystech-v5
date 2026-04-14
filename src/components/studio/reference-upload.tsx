'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Wand2, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { StyleExtraction } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

interface ReferenceUploadProps {
  onStyleExtracted: (extraction: StyleExtraction) => void;
  maxImages?: number;
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface PaletteSwatchesProps {
  palette: StyleExtraction['palette'];
}

function PaletteSwatches({ palette }: PaletteSwatchesProps) {
  const swatches = [
    { label: 'Primary', color: palette.primary },
    { label: 'Secondary', color: palette.secondary },
    { label: 'Accent', color: palette.accent },
  ];

  return (
    <div className="flex gap-2">
      {swatches.map(({ label, color }) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div
            className="w-8 h-8 rounded-lg border border-white/20 shadow-sm"
            style={{ backgroundColor: color }}
            title={`${label}: ${color}`}
          />
          <span className="text-[10px] text-muted-foreground/60">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const itemVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15 },
  },
};

const resultVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function ReferenceUpload({
  onStyleExtracted,
  maxImages = 3,
  className,
}: ReferenceUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extraction, setExtraction] = useState<StyleExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < maxImages;

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!canAddMore) return;
      setError(null);

      const fileArray = Array.from(files).slice(0, maxImages - images.length);
      const validFiles = fileArray.filter((f) => f.type.startsWith('image/'));

      if (validFiles.length === 0) {
        setError('Please upload image files (JPG, PNG, WebP).');
        return;
      }

      try {
        const dataUrls = await Promise.all(validFiles.map(fileToDataUrl));
        setImages((prev) => [...prev, ...dataUrls].slice(0, maxImages));
        // Clear any prior extraction when new images are added
        setExtraction(null);
      } catch {
        setError('Failed to read image files.');
      }
    },
    [canAddMore, images.length, maxImages],
  );

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setExtraction(null);
    setError(null);
  }

  // Drag-and-drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      // Reset so the same file can be re-selected
      e.target.value = '';
    }
  }

  async function handleExtract() {
    if (images.length === 0) return;
    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch('/api/studio/extract-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error: ${res.status}`);
      }

      const data = await res.json();
      const result: StyleExtraction = data.data ?? data;
      setExtraction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed.');
    } finally {
      setIsExtracting(false);
    }
  }

  function handleUseStyle() {
    if (extraction) {
      onStyleExtracted(extraction);
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => canAddMore && fileInputRef.current?.click()}
        role="button"
        tabIndex={canAddMore ? 0 : -1}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && canAddMore) {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center gap-3',
          'min-h-[120px] p-5',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          canAddMore ? 'cursor-pointer' : 'cursor-default opacity-60',
          isDragging
            ? 'border-primary/60 bg-primary/5 scale-[1.01]'
            : canAddMore
              ? 'border-white/20 bg-white/[0.03] hover:border-primary/40 hover:bg-white/5'
              : 'border-white/10 bg-white/[0.02]',
        )}
      >
        <div
          className={cn(
            'rounded-full p-2.5 transition-colors',
            isDragging ? 'bg-primary/20' : 'bg-white/10',
          )}
        >
          {canAddMore ? (
            <ImagePlus className="size-5 text-muted-foreground" />
          ) : (
            <Upload className="size-5 text-muted-foreground/40" />
          )}
        </div>

        {canAddMore ? (
          <div className="text-center space-y-0.5">
            <p className="text-sm text-muted-foreground">
              {isDragging ? 'Drop images here' : 'Drop images or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground/50">
              {images.length}/{maxImages} images — JPG, PNG, WebP
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/50">
            Maximum {maxImages} image{maxImages !== 1 ? 's' : ''} reached
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={maxImages > 1}
        onChange={handleFileInput}
        className="sr-only"
        aria-label="Upload reference images"
      />

      {/* Preview thumbnails */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <motion.div
            key="thumbnails"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3"
          >
            {images.map((src, i) => (
              <motion.div
                key={src.slice(0, 40) + i}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className="relative group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Reference ${i + 1}`}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className={cn(
                    'absolute -top-1.5 -right-1.5',
                    'w-5 h-5 rounded-full',
                    'bg-background border border-white/20',
                    'flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-destructive/80 hover:border-destructive/60',
                    'min-w-[20px] min-h-[20px]', // touch target via group
                  )}
                  aria-label={`Remove image ${i + 1}`}
                >
                  <X className="size-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive/80"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Extract button */}
      {images.length > 0 && !extraction && (
        <Button
          type="button"
          onClick={handleExtract}
          disabled={isExtracting}
          className={cn(
            'w-full h-11',
            'bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20',
            'shadow-[0_0_16px_rgba(201,169,78,0.15)]',
          )}
        >
          {isExtracting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Analysing style…
            </>
          ) : (
            <>
              <Wand2 className="size-4" />
              Extract Style
            </>
          )}
        </Button>
      )}

      {/* Extraction results */}
      <AnimatePresence>
        {extraction && (
          <motion.div
            key="extraction-result"
            variants={resultVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]',
              'p-4 space-y-4',
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
                Extracted Style
              </p>
              <button
                type="button"
                onClick={() => setExtraction(null)}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                aria-label="Clear extraction"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Palette swatches */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">
                Palette
              </p>
              <PaletteSwatches palette={extraction.palette} />
            </div>

            {/* Descriptors */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { key: 'medium', label: 'Medium', value: extraction.medium },
                { key: 'mood', label: 'Mood', value: extraction.mood },
                { key: 'lineQuality', label: 'Line Quality', value: extraction.lineQuality },
                { key: 'texture', label: 'Texture', value: extraction.texture },
                { key: 'composition', label: 'Composition', value: extraction.composition },
              ].map(({ key, label, value }) => (
                <div key={key} className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-xs text-foreground/80 capitalize">{value}</p>
                </div>
              ))}
            </div>

            {/* Style prompt preview */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">
                Style Prompt
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {extraction.stylePrompt}
              </p>
            </div>

            {/* Accept button */}
            <Button
              type="button"
              onClick={handleUseStyle}
              className={cn(
                'w-full h-11',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'shadow-[0_0_20px_rgba(201,169,78,0.3)]',
              )}
            >
              <Wand2 className="size-4" />
              Use as Style Prompt
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
