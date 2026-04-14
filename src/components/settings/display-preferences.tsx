"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { useImmersiveOptional } from "@/components/immersive/immersive-provider";
import { cn } from "@/lib/utils";
import type { PerformanceTier } from "@/components/immersive/performance";

type DisplayOption = "auto" | PerformanceTier;

const DISPLAY_OPTIONS: { value: DisplayOption; label: string; description: string }[] = [
  {
    value: "auto",
    label: "Auto (recommended)",
    description: "Detects your device capabilities and adjusts effects automatically.",
  },
  {
    value: "full",
    label: "Full effects",
    description: "5000 stars, sparkles, bloom. Best on desktop with a dedicated GPU.",
  },
  {
    value: "reduced",
    label: "Reduced effects",
    description: "2000 stars, fewer sparkles, no bloom. Good for most devices.",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "No particles or animations. Maximum performance.",
  },
];

const STORAGE_KEY = "mystech-performance-tier";

interface DisplayPreferencesProps {
  className?: string;
}

export function DisplayPreferences({ className }: DisplayPreferencesProps) {
  const immersive = useImmersiveOptional();
  const [selected, setSelected] = useState<DisplayOption>("auto");

  // Read from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "full" || stored === "reduced" || stored === "minimal") {
      setSelected(stored);
    } else {
      setSelected("auto");
    }
  }, []);

  function handleSelect(value: DisplayOption) {
    if (value === selected) return;
    setSelected(value);
    if (value === "auto") {
      immersive?.setPerformanceTierOverride(null);
    } else {
      immersive?.setPerformanceTierOverride(value);
    }
  }

  return (
    <GlassPanel className={cn("p-4", className)}>
      <SectionHeader className="mb-1">Display & Performance</SectionHeader>
      <p className="text-sm text-white/40 mb-4">
        Control visual effects intensity. Changes apply immediately.
      </p>
      <div className="grid gap-4">
        {DISPLAY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              selected === option.value
                ? "border-gold/50 bg-gold/5"
                : "border-white/10 hover:border-gold/30 hover:bg-white/[0.02]"
            )}
          >
            <span className="font-medium text-white/90">{option.label}</span>
            <span className="text-sm text-white/40">{option.description}</span>
          </button>
        ))}
      </div>
    </GlassPanel>
  );
}
