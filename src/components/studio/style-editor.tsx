"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PreviewGrid } from "@/components/studio/preview-grid";
import { ReferenceUpload } from "@/components/studio/reference-upload";
import { ParameterControls, type StudioParameters } from "@/components/studio/parameter-controls";
import type { ArtStyle, PlanType, StyleExtraction } from "@/types";

interface StyleEditorProps {
  style: ArtStyle;
  isOwner: boolean;
  plan: PlanType;
  userId: string;
}

export function StyleEditor({ style, isOwner, plan, userId }: StyleEditorProps) {
  const router = useRouter();
  const isPro = plan === "pro" || plan === "admin";

  // Editable state
  const [name, setName] = useState(style.name);
  const [description, setDescription] = useState(style.description);
  const [stylePrompt, setStylePrompt] = useState(style.stylePrompt);
  const [parameters, setParameters] = useState<StudioParameters>(
    (style.parameters as StudioParameters) ?? {}
  );
  const [showProControls, setShowProControls] = useState(false);

  // Preview state
  const [previews, setPreviews] = useState<string[]>(style.previewImages ?? []);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);

  const handleParameterChange = useCallback(
    (update: Partial<StudioParameters>) => {
      setParameters((prev) => ({ ...prev, ...update }));
    },
    []
  );

  const handleStyleExtracted = useCallback(
    (extraction: StyleExtraction) => {
      setStylePrompt(extraction.stylePrompt);
      toast.success("Style prompt extracted from reference images");
    },
    []
  );

  const handleGeneratePreview = useCallback(async () => {
    setIsGeneratingPreview(true);
    try {
      const res = await fetch("/api/studio/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stylePrompt,
          parameters: {
            cfgScale: parameters.cfgScale,
            sampler: parameters.sampler,
            stabilityPreset: parameters.stabilityPreset,
            negativePrompt: parameters.negativePrompt,
          },
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.imageUrl) {
        setPreviews((prev) => [json.data.imageUrl, ...prev].slice(0, 4));
        toast.success("Preview generated");
      } else {
        toast.error(json.error ?? "Failed to generate preview");
      }
    } catch {
      toast.error("Failed to generate preview");
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [stylePrompt, parameters]);

  const handleSave = useCallback(
    async (saveAsNew: boolean) => {
      setIsSaving(true);
      try {
        const body = {
          name,
          description,
          stylePrompt,
          category: style.category,
          parameters: {
            seed: parameters.seed,
            cfgScale: parameters.cfgScale,
            sampler: parameters.sampler,
            stabilityPreset: parameters.stabilityPreset,
            negativePrompt: parameters.negativePrompt,
          },
        };

        if (saveAsNew || style.isPreset || !isOwner) {
          // Create new custom style
          const res = await fetch("/api/studio/styles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const json = await res.json();
          if (json.success) {
            toast.success("Style saved as new custom style");
            router.push(`/studio/styles/${json.data.id}`);
          } else {
            toast.error(json.error ?? "Failed to save style");
          }
        } else {
          // Update existing custom style
          const res = await fetch(`/api/studio/styles/${style.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const json = await res.json();
          if (json.success) {
            toast.success("Style updated");
            router.refresh();
          } else {
            toast.error(json.error ?? "Failed to update style");
          }
        }
      } catch {
        toast.error("Failed to save style");
      } finally {
        setIsSaving(false);
      }
    },
    [name, description, stylePrompt, style, parameters, isOwner, router]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 sm:px-6 border-b border-white/5">
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href="/studio/styles">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {style.isPreset ? `Customize: ${style.name}` : style.name}
          </h1>
          {style.isPreset && (
            <p className="text-xs text-muted-foreground">
              Preset styles are saved as new custom styles
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {isOwner && !style.isPreset && (
            <Button
              size="sm"
              variant="outline"
              className="border-white/10"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-1">Save</span>
            </Button>
          )}
          <Button
            size="sm"
            className="bg-gradient-to-r from-[#c9a94e] to-[#daa520] text-black font-semibold"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="ml-1">Save as New</span>
          </Button>
        </div>
      </div>

      {/* Split screen */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Preview area */}
        <motion.div
          layout
          className={cn(
            "lg:w-1/2 p-4 sm:p-6 overflow-y-auto",
            "border-b lg:border-b-0 lg:border-r border-white/5"
          )}
        >
          <div className="space-y-4">
            <PreviewGrid
              previews={previews}
              isLoading={isGeneratingPreview}
              onGenerate={handleGeneratePreview}
            />
          </div>
        </motion.div>

        {/* Controls area */}
        <div className="lg:w-1/2 p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Name & Description */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">
                Style Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="mt-1 bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="mt-1 bg-white/5 border-white/10"
              />
            </div>
          </div>

          {/* Style Prompt */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Style Prompt
            </Label>
            <Textarea
              value={stylePrompt}
              onChange={(e) => setStylePrompt(e.target.value)}
              rows={4}
              maxLength={2000}
              className="mt-1 bg-white/5 border-white/10 resize-none"
              placeholder="Describe the artistic style in detail..."
            />
            <p className="text-xs text-muted-foreground/50 mt-1">
              {stylePrompt.length}/2000
            </p>
          </div>

          {/* Reference Images */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Reference Images
            </Label>
            <ReferenceUpload
              onStyleExtracted={handleStyleExtracted}
              maxImages={3}
            />
          </div>

          {/* Parameter Controls */}
          <ParameterControls
            parameters={parameters}
            onChange={handleParameterChange}
            isPro={isPro}
            showProControls={showProControls}
            onToggleProControls={() => setShowProControls((p) => !p)}
          />
        </div>
      </div>
    </div>
  );
}
