"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  Loader2,
  Save,
  Layers,
  Lock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ParameterControls,
  type StudioParameters,
} from "@/components/studio/parameter-controls";
import type { PlanType, StyleCategory } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

interface CardData {
  id: string;
  deckId: string;
  title: string;
  meaning: string;
  guidance: string;
  imageUrl: string | null;
  imagePrompt: string | null;
  imageStatus: "pending" | "generating" | "completed" | "failed";
  cardNumber: number;
}

interface CardRefinementProps {
  card: CardData;
  deckTitle: string;
  artStyle: {
    id: string;
    name: string;
    stylePrompt: string;
    parameters: Record<string, unknown> | null;
    category: StyleCategory | null;
  } | null;
  existingOverride: {
    id: string;
    imagePrompt: string | null;
    parameters: Record<string, unknown> | null;
  } | null;
  plan: PlanType;
}

type DisclosureLevel = "simple" | "refine" | "pro";

// ── Quick feedback chips ───────────────────────────────────────────────────

const FEEDBACK_CHIPS = [
  { label: "More vibrant", modifier: ", with more vivid saturated colors" },
  { label: "Less busy", modifier: ", cleaner composition with fewer elements" },
  { label: "More detail", modifier: ", with intricate fine details" },
  { label: "Darker", modifier: ", darker mood with deeper shadows" },
  { label: "Lighter", modifier: ", lighter and more luminous atmosphere" },
] as const;

// ── Component ──────────────────────────────────────────────────────────────

export function CardRefinement({
  card,
  deckTitle,
  artStyle,
  existingOverride,
  plan,
}: CardRefinementProps) {
  const router = useRouter();
  const isPro = plan === "pro" || plan === "admin";

  // Disclosure level
  const [level, setLevel] = useState<DisclosureLevel>("simple");

  // Image state
  const [currentImageUrl, setCurrentImageUrl] = useState(card.imageUrl);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Editable state
  const [imagePrompt, setImagePrompt] = useState(
    existingOverride?.imagePrompt ?? card.imagePrompt ?? ""
  );
  const [parameters, setParameters] = useState<StudioParameters>(
    (existingOverride?.parameters as StudioParameters) ?? {}
  );
  const [showProControls, setShowProControls] = useState(false);

  // Loading states
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRegenerate = useCallback(
    async (promptModifier?: string) => {
      setIsRegenerating(true);
      try {
        const finalPrompt = promptModifier
          ? (imagePrompt || card.imagePrompt || "") + promptModifier
          : imagePrompt || undefined;

        const res = await fetch(`/api/studio/cards/${card.id}/refine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imagePrompt: finalPrompt,
            parameters: {
              seed: parameters.seed,
              cfgScale: parameters.cfgScale,
              sampler: parameters.sampler,
              negativePrompt: parameters.negativePrompt,
            },
          }),
        });

        const json = await res.json();
        if (json.success && json.data?.imageUrl) {
          setPreviousImageUrl(currentImageUrl);
          setCurrentImageUrl(json.data.imageUrl);
          toast.success("Card image regenerated");
        } else {
          toast.error(json.error ?? "Failed to regenerate");
        }
      } catch {
        toast.error("Failed to regenerate card image");
      } finally {
        setIsRegenerating(false);
      }
    },
    [card.id, card.imagePrompt, imagePrompt, parameters, currentImageUrl]
  );

  const handleSaveOverride = useCallback(async () => {
    setIsSavingOverride(true);
    try {
      const res = await fetch(`/api/studio/cards/${card.id}/override`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePrompt: imagePrompt || null,
          parameters: {
            seed: parameters.seed,
            cfgScale: parameters.cfgScale,
            sampler: parameters.sampler,
            negativePrompt: parameters.negativePrompt,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Card overrides saved");
      } else {
        toast.error(json.error ?? "Failed to save overrides");
      }
    } catch {
      toast.error("Failed to save overrides");
    } finally {
      setIsSavingOverride(false);
    }
  }, [card.id, imagePrompt, parameters]);

  const handleParameterChange = useCallback(
    (update: Partial<StudioParameters>) => {
      setParameters((prev) => ({ ...prev, ...update }));
    },
    []
  );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 sm:px-6 border-b border-white/5">
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={`/decks/${card.deckId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {card.title}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            Card #{card.cardNumber} · {deckTitle}
            {artStyle && (
              <span className="text-primary/60"> · {artStyle.name}</span>
            )}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 shrink-0"
          onClick={handleSaveOverride}
          disabled={isSavingOverride}
        >
          {isSavingOverride ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="hidden sm:inline ml-1">Save Override</span>
        </Button>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Card preview area */}
        <div
          className={cn(
            "lg:w-1/2 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center",
            "border-b lg:border-b-0 lg:border-r border-white/5"
          )}
        >
          <div className="relative w-full max-w-sm mx-auto">
            {/* Comparison toggle */}
            {previousImageUrl && (
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => setShowComparison((p) => !p)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    showComparison
                      ? "bg-primary/20 text-primary"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  <Layers className="h-3 w-3" />
                  {showComparison ? "Showing Previous" : "Compare"}
                </button>
              </div>
            )}

            {/* Card image */}
            <motion.div
              layout
              className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10"
            >
              {(showComparison ? previousImageUrl : currentImageUrl) ? (
                <motion.img
                  key={showComparison ? "prev" : "current"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={
                    (showComparison ? previousImageUrl : currentImageUrl) ?? ""
                  }
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-white/10" />
                </div>
              )}
              {isRegenerating && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              )}
            </motion.div>

            {/* Card info */}
            <div className="mt-3 text-center">
              <h2 className="text-base font-semibold text-foreground">
                {card.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {card.meaning}
              </p>
            </div>
          </div>
        </div>

        {/* Controls area */}
        <div className="lg:w-1/2 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Level 1: Simple — always visible */}
          <div className="space-y-4">
            {/* Regenerate button */}
            <Button
              onClick={() => handleRegenerate()}
              disabled={isRegenerating}
              className="w-full bg-gradient-to-r from-[#c9a94e] to-[#daa520] text-black font-semibold"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Regenerate</span>
            </Button>

            {/* Feedback chips */}
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleRegenerate(chip.modifier)}
                  disabled={isRegenerating}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20 transition-colors disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Like/Dislike */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 hover:border-green-500/30 hover:text-green-400"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="ml-1">Like</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/10 hover:border-red-500/30 hover:text-red-400"
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="ml-1">Dislike</span>
              </Button>
            </div>
          </div>

          {/* Level 2: Refine — tap to reveal */}
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() =>
                setLevel((l) => (l === "refine" || l === "pro" ? "simple" : "refine"))
              }
              className="flex items-center justify-between w-full p-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">
                Refine
              </span>
              <motion.div
                animate={{
                  rotate: level === "refine" || level === "pro" ? 180 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {(level === "refine" || level === "pro") && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 space-y-4 border-t border-white/5">
                    {/* Image prompt */}
                    <div className="pt-3">
                      <Label className="text-xs text-muted-foreground">
                        Image Prompt
                      </Label>
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        rows={3}
                        className="mt-1 bg-white/5 border-white/10 resize-none text-sm"
                        placeholder="Describe the scene for this card..."
                      />
                    </div>

                    {/* Basic sliders */}
                    <ParameterControls
                      parameters={parameters}
                      onChange={handleParameterChange}
                      isPro={false}
                      showProControls={false}
                    />

                    {/* Generate Variation */}
                    <Button
                      onClick={() => handleRegenerate()}
                      disabled={isRegenerating}
                      variant="outline"
                      className="w-full border-white/10"
                    >
                      {isRegenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2">Generate Variation</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Level 3: Pro Controls — behind toggle */}
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => {
                if (!isPro) return;
                setLevel((l) => (l === "pro" ? "refine" : "pro"));
              }}
              className={cn(
                "flex items-center justify-between w-full p-3 transition-colors",
                isPro
                  ? "hover:bg-white/5"
                  : "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Pro Controls
                </span>
                {!isPro && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-primary/30 text-primary"
                  >
                    <Lock className="h-2.5 w-2.5 mr-0.5" />
                    Pro
                  </Badge>
                )}
              </div>
              {isPro && (
                <motion.div
                  animate={{ rotate: level === "pro" ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}
            </button>

            <AnimatePresence>
              {level === "pro" && isPro && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 border-t border-white/5">
                    <div className="pt-3">
                      <ParameterControls
                        parameters={parameters}
                        onChange={handleParameterChange}
                        isPro={true}
                        showProControls={true}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
