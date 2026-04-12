'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OracleCard } from '@/components/cards/oracle-card';
import { Loader2, Scroll, Sparkles, Milestone } from 'lucide-react';
import type { UserRetreatProgress, Card } from '@/types';

interface RetreatArtifactCardProps {
  retreatId: string;
  retreatName: string;
  retreatProgress: UserRetreatProgress;
  thresholdCard?: Card | null;
  className?: string;
}

export function RetreatArtifactCard({
  retreatId,
  retreatName,
  retreatProgress,
  thresholdCard: initialThresholdCard,
  className,
}: RetreatArtifactCardProps) {
  const [loading, setLoading] = useState(false);
  const [artifact, setArtifact] = useState<{
    summary: string;
    themes: string[];
    imageUrl: string | null;
  } | null>(
    retreatProgress.artifactSummary
      ? {
          summary: retreatProgress.artifactSummary,
          themes: retreatProgress.artifactThemes ?? [],
          imageUrl: retreatProgress.artifactImageUrl ?? null,
        }
      : null
  );
  const [thresholdCard, setThresholdCard] = useState<Card | null>(initialThresholdCard ?? null);
  const [error, setError] = useState<string | null>(null);

  // Self-fetch threshold card if we have an ID but no card data passed in
  useEffect(() => {
    if (retreatProgress.thresholdCardId && !initialThresholdCard) {
      fetch(`/api/cards/${retreatProgress.thresholdCardId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setThresholdCard(data.data);
          }
        })
        .catch(() => {}); // Silent fail
    }
  }, [retreatProgress.thresholdCardId, initialThresholdCard]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/paths/retreats/${retreatId}/artifact`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Failed to generate artifact');
      }
      setArtifact(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  // Not completed — don't show
  if (retreatProgress.status !== 'completed') return null;

  // Completed but no artifact yet — show generate button
  if (!artifact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'rounded-2xl bg-white/5 backdrop-blur-xl border border-[#c9a94e]/20 p-5',
          className,
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a94e]/15">
            <Scroll className="h-4 w-4 text-[#c9a94e]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">Chapter Complete</p>
            <p className="text-xs text-white/40">
              Generate a reflective artifact for &ldquo;{retreatName}&rdquo;
            </p>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 mb-3">{error}</p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={loading}
          size="sm"
          className="bg-[#c9a94e] text-black hover:bg-[#c9a94e]/90 shadow-[0_0_20px_rgba(201,169,78,0.3)]"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Generating...' : 'Generate Artifact'}
        </Button>
      </motion.div>
    );
  }

  // Artifact exists — display it
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'rounded-2xl overflow-hidden',
        'bg-white/5 backdrop-blur-xl',
        'border border-[#c9a94e]/20',
        'shadow-lg shadow-purple-900/20',
        className,
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#c9a94e]/10 to-purple-900/10 px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9a94e]/15">
            <Scroll className="h-4 w-4 text-[#c9a94e]" />
          </div>
          <div>
            <p className="text-xs text-[#c9a94e] font-medium uppercase tracking-wider">
              Chapter Artifact
            </p>
            <p className="text-sm font-semibold text-white/90">{retreatName}</p>
          </div>
        </div>
      </div>

      {/* Image (if generated) */}
      {artifact.imageUrl && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={artifact.imageUrl}
            alt={`Artifact for ${retreatName}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Summary */}
      <div className="p-5 space-y-4">
        <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
          {artifact.summary}
        </div>

        {/* Themes */}
        {artifact.themes.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">
              Themes
            </p>
            <div className="flex flex-wrap gap-2">
              {artifact.themes.map((theme) => (
                <span
                  key={theme}
                  className="inline-flex items-center rounded-full bg-[#c9a94e]/10 border border-[#c9a94e]/20 px-3 py-1 text-xs text-[#c9a94e]/80"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Threshold Card */}
        {thresholdCard && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Milestone className="h-3.5 w-3.5 text-[#c9a94e]" />
              <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">
                Threshold Card Earned
              </p>
            </div>
            <div className="flex justify-center">
              <OracleCard card={thresholdCard} size="sm" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
