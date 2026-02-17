"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StylePickerGrid } from "@/components/art-styles/style-picker-grid";
import { Sprout, Pen, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ArtStyle } from "@/types";

interface LivingDeckSetupProps {
  presetStyles: ArtStyle[];
  customStyles?: ArtStyle[];
}

export function LivingDeckSetup({ presetStyles, customStyles }: LivingDeckSetupProps) {
  const router = useRouter();
  const [artStyleId, setArtStyleId] = useState<string | null>(null);
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!artStyleId) {
      toast.error("Please select an art style");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/decks/living", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artStyleId, generationMode: mode }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Failed to create Living Deck");
        return;
      }
      toast.success("Living Deck created!");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-2">
          <Sprout className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Start Your Living Deck</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          A daily mirror of your journey. Each day, a new card captures where you are right now.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generation Mode</CardTitle>
          <CardDescription>How would you like to create your daily cards?</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <button
            onClick={() => setMode("manual")}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
              mode === "manual"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Pen className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Manual</p>
              <p className="text-sm text-muted-foreground">
                Write a daily reflection, and a card is crafted from your words.
              </p>
            </div>
          </button>
          <button
            onClick={() => setMode("auto")}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
              mode === "auto"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <Wand2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Auto</p>
              <p className="text-sm text-muted-foreground">
                Lyra reads your journey context and creates a card that speaks to where you are.
              </p>
            </div>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Art Style</CardTitle>
          <CardDescription>Choose a visual style for your Living Deck cards.</CardDescription>
        </CardHeader>
        <CardContent>
          <StylePickerGrid
            presets={presetStyles}
            customStyles={customStyles}
            selectedStyleId={artStyleId}
            onSelect={setArtStyleId}
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleCreate}
        disabled={creating || !artStyleId}
        className="w-full"
        size="lg"
      >
        {creating ? "Creating..." : "Create Living Deck"}
      </Button>
    </div>
  );
}
