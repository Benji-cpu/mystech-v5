'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Wand2, Loader2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { compressImage } from '@/lib/images/compress-image';
import type { StyleExtraction } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

interface ReferenceUploadProps {
  onStyleExtracted: (extraction: StyleExtraction) => void;
  maxImages?: number;
  className?: string;
}

interface UploadedImage {
  id: string;
  previewUrl: string;
  url: string | null;
  uploading: boolean;
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

function deleteBlobUrls(urls: string[]) {
  if (urls.length === 0) return;
  // Fire-and-forget. keepalive lets it survive page navigation.
  try {
    fetch('/api/studio/reference-upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function ReferenceUpload({
  onStyleExtracted,
  maxImages = 3,
  className,
}: ReferenceUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extraction, setExtraction] = useState<StyleExtraction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep a ref of the current image list so unmount cleanup can read latest state
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup on unmount: revoke object URLs and best-effort delete any uploaded blobs
  useEffect(() => {
    return () => {
      const current = imagesRef.current;
      const urls: string[] = [];
      for (const img of current) {
        URL.revokeObjectURL(img.previewUrl);
        if (img.url) urls.push(img.url);
      }
      deleteBlobUrls(urls);
    };
  }, []);

  const canAddMore = images.length < maxImages;

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const remaining = maxImages - imagesRef.current.length;
      if (remaining <= 0) return;
      setError(null);

      const fileArray = Array.from(files).slice(0, remaining);
      const validFiles = fileArray.filter((f) => f.type.startsWith('image/'));

      if (validFiles.length === 0) {
        setError('Please upload image files (JPG, PNG, WebP).');
        return;
      }

      // Clear any prior extraction when new images are added
      setExtraction(null);

      await Promise.all(
        validFiles.map(async (file) => {
          const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`;

          let previewUrl = '';
          try {
            const compressed = await compressImage(file);
            previewUrl = URL.createObjectURL(compressed);

            // Optimistic placeholder so user sees the thumbnail immediately
            setImages((prev) =>
              prev.length >= maxImages
                ? prev
                : [...prev, { id, previewUrl, url: null, uploading: true }],
            );

            const form = new FormData();
            form.append('file', compressed, file.name.replace(/\.[^.]+$/, '.jpg'));

            const res = await fetch('/api/studio/reference-upload', {
              method: 'POST',
              body: form,
            });

            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              throw new Error(data.error ?? `Upload failed (${res.status})`);
            }

            const data = await res.json();
            const url: string | undefined = data.data?.url ?? data.url;
            if (!url) throw new Error('Upload succeeded but no URL returned');

            setImages((prev) =>
              prev.map((img) =>
                img.id === id ? { ...img, url, uploading: false } : img,
              ),
            );
          } catch (err) {
            URL.revokeObjectURL(previewUrl);
            setImages((prev) => prev.filter((img) => img.id !== id));
            setError(err instanceof Error ? err.message : 'Upload failed.');
          }
        }),
      );
    },
    [maxImages],
  );

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
        if (target.url) deleteBlobUrls([target.url]);
      }
      return prev.filter((img) => img.id !== id);
    });
    setExtraction(null);
    setError(null);
  }, []);

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
      e.target.value = '';
    }
  }

  const uploadedUrls = images
    .filter((img) => !img.uploading && img.url)
    .map((img) => img.url as string);
  const anyUploading = images.some((img) => img.uploading);
  const canExtract = uploadedUrls.length > 0 && !anyUploading;

  async function handleExtract() {
    if (uploadedUrls.length === 0) return;
    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch('/api/studio/extract-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: uploadedUrls }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error: ${res.status}`);
      }

      const data = await res.json();
      const result: StyleExtraction = data.data ?? data;
      setExtraction(result);

      // Server has deleted the blobs — drop them from state and revoke previews
      setImages((prev) => {
        prev.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        return [];
      });
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
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className="relative group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={`Reference ${i + 1}`}
                  className="w-20 h-20 rounded-xl object-cover border border-white/10"
                />
                {img.uploading && (
                  <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(img.id);
                  }}
                  className={cn(
                    'absolute -top-1.5 -right-1.5',
                    'w-5 h-5 rounded-full',
                    'bg-background border border-white/20',
                    'flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-destructive/80 hover:border-destructive/60',
                    'min-w-[20px] min-h-[20px]',
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
          disabled={isExtracting || !canExtract}
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
          ) : anyUploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading…
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
