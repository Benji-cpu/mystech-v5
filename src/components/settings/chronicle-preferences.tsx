"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { ChronicleInterests } from "@/components/chronicle/chronicle-interests";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ChronicleInterests as ChronicleInterestsType, ChronicleSettings } from "@/types";

interface ChroniclePreferencesProps {
  settings: ChronicleSettings;
  className?: string;
}

export function ChroniclePreferences({ settings, className }: ChroniclePreferencesProps) {
  const [enabled, setEnabled] = useState(settings.chronicleEnabled);
  const [interests, setInterests] = useState<ChronicleInterestsType>(
    settings.interests ?? { spiritual: [], lifeDomains: [] }
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function handleToggleEnabled() {
    const newVal = !enabled;
    setEnabled(newVal);
    patchSettings({ chronicleEnabled: newVal });
  }

  function handleInterestsChange(next: ChronicleInterestsType) {
    setInterests(next);
    setDirty(true);
  }

  async function handleSaveInterests() {
    await patchSettings({ interests });
    setDirty(false);
  }

  async function patchSettings(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/chronicle/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Failed to update Chronicle settings");
        return;
      }
      toast.success("Chronicle settings updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className={cn("p-4", className)}>
      <SectionHeader className="mb-1">Chronicle</SectionHeader>
      <p className="text-sm text-white/40 mb-4">
        Configure your daily Chronicle card and reflection preferences.
      </p>

      <div className="space-y-4">
        {/* Enable/disable toggle */}
        <button
          onClick={handleToggleEnabled}
          disabled={saving}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
            enabled
              ? "border-gold/50 bg-gold/5"
              : "border-white/10 hover:border-gold/30 hover:bg-white/[0.02]"
          )}
        >
          <div>
            <span className="font-medium text-white/90">Daily Chronicle</span>
            <p className="text-sm text-white/40">
              Receive a daily card and reflection prompt.
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            enabled ? "bg-gold/20 text-gold" : "bg-white/5 text-white/40"
          )}>
            {enabled ? "On" : "Off"}
          </span>
        </button>

        {/* Interests */}
        <div className={cn(!enabled && "opacity-50 pointer-events-none")}>
          <p className="text-sm font-medium text-white/60 mb-3">Interests</p>
          <ChronicleInterests
            selected={interests}
            onChange={handleInterestsChange}
          />
          {dirty && (
            <button
              onClick={handleSaveInterests}
              disabled={saving}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-gold/20 border border-gold/50 text-gold hover:bg-gold/30 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Interests"}
            </button>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
