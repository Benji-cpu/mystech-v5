"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReadingLength } from "@/types";

const LENGTH_OPTIONS: { value: ReadingLength; label: string; description: string }[] = [
  {
    value: "brief",
    label: "Brief",
    description: "Punchy and direct. Gets straight to the heart of what the cards reveal.",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Balanced depth. Enough room for nuance without over-explaining.",
  },
  {
    value: "deep",
    label: "Deep",
    description: "Rich and expansive. Layered symbolism and deeper exploration of themes.",
  },
];

interface ReadingPreferencesProps {
  initialLength: ReadingLength;
  className?: string;
}

export function ReadingPreferences({ initialLength, className }: ReadingPreferencesProps) {
  const [selected, setSelected] = useState<ReadingLength>(initialLength);
  const [saving, setSaving] = useState(false);

  async function handleSelect(value: ReadingLength) {
    if (value === selected) return;
    const previous = selected;
    setSelected(value);
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readingLength: value }),
      });
      if (!res.ok) {
        setSelected(previous);
        toast.error("Failed to update preference");
        return;
      }
      toast.success("Reading length updated");
    } catch {
      setSelected(previous);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className={cn("p-4", className)}>
      <SectionHeader className="mb-1">Reading Length</SectionHeader>
      <p className="text-sm text-white/40 mb-4">
        Choose how detailed your reading interpretations should be.
      </p>
      <div className="grid gap-4">
        {LENGTH_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            disabled={saving}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              selected === option.value
                ? "border-gold/50 bg-gold/5"
                : "border-white/10 hover:border-gold/30 hover:bg-white/[0.02]"
            )}
          >
            <span className="font-medium text-white/90">{option.label}</span>
            <span className="text-sm text-white/40">
              {option.description}
            </span>
          </button>
        ))}
      </div>
    </GlassPanel>
  );
}
