"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { VoicePreferences as VoicePrefs, VoiceSpeed } from "@/types";

const SPEED_OPTIONS: { value: VoiceSpeed; label: string }[] = [
  { value: "0.75", label: "0.75x" },
  { value: "1.0", label: "1.0x" },
  { value: "1.25", label: "1.25x" },
  { value: "1.5", label: "1.5x" },
];

interface VoicePreferencesProps {
  initialPrefs: VoicePrefs;
  initialGuidanceEnabled?: boolean;
  className?: string;
}

export function VoicePreferences({ initialPrefs, initialGuidanceEnabled = true, className }: VoicePreferencesProps) {
  const [prefs, setPrefs] = useState<VoicePrefs>(initialPrefs);
  const [guidanceEnabled, setGuidanceEnabled] = useState(initialGuidanceEnabled);
  const [saving, setSaving] = useState(false);

  async function patchVoice(body: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        toast.error("Failed to update voice setting");
        return false;
      }
      const data = await res.json();
      if (data.voice) setPrefs(data.voice);
      toast.success("Voice setting updated");
      return true;
    } catch {
      toast.error("Something went wrong");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function handleToggleEnabled() {
    const newVal = !prefs.enabled;
    setPrefs((p) => ({ ...p, enabled: newVal }));
    patchVoice({ voiceEnabled: newVal });
  }

  function handleToggleAutoplay() {
    const newVal = !prefs.autoplay;
    setPrefs((p) => ({ ...p, autoplay: newVal }));
    patchVoice({ voiceAutoplay: newVal });
  }

  function handleToggleGuidance() {
    const newVal = !guidanceEnabled;
    setGuidanceEnabled(newVal);
    patchVoice({ guidanceEnabled: newVal });
  }

  function handleSpeedChange(speed: VoiceSpeed) {
    if (speed === prefs.speed) return;
    setPrefs((p) => ({ ...p, speed }));
    patchVoice({ voiceSpeed: speed });
  }

  return (
    <GlassPanel className={cn("p-6", className)}>
      <SectionHeader className="mb-1">Voice</SectionHeader>
      <p className="text-sm text-white/40 mb-4">
        Configure Lyra&apos;s voice narration for readings and conversations.
      </p>
      <div className="space-y-4">
        {/* Voice enabled toggle */}
        <button
          onClick={handleToggleEnabled}
          disabled={saving}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
            prefs.enabled
              ? "border-[#c9a94e]/50 bg-[#c9a94e]/5"
              : "border-white/10 hover:border-[#c9a94e]/30 hover:bg-white/[0.02]"
          )}
        >
          <div>
            <span className="font-medium text-white/90">Voice Narration</span>
            <p className="text-sm text-white/40">
              Lyra speaks readings and card reveals aloud.
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            prefs.enabled ? "bg-[#c9a94e]/20 text-[#c9a94e]" : "bg-white/5 text-white/40"
          )}>
            {prefs.enabled ? "On" : "Off"}
          </span>
        </button>

        {/* Auto-play toggle */}
        <button
          onClick={handleToggleAutoplay}
          disabled={saving || !prefs.enabled}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
            !prefs.enabled && "opacity-50 cursor-not-allowed",
            prefs.autoplay && prefs.enabled
              ? "border-[#c9a94e]/50 bg-[#c9a94e]/5"
              : "border-white/10 hover:border-[#c9a94e]/30 hover:bg-white/[0.02]"
          )}
        >
          <div>
            <span className="font-medium text-white/90">Auto-Play</span>
            <p className="text-sm text-white/40">
              Automatically narrate when interpretations stream in.
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            prefs.autoplay && prefs.enabled ? "bg-[#c9a94e]/20 text-[#c9a94e]" : "bg-white/5 text-white/40"
          )}>
            {prefs.autoplay ? "On" : "Off"}
          </span>
        </button>

        {/* Speed */}
        <div className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <p className="text-sm font-medium text-white/60 mb-3">Speed</p>
          <div className="grid grid-cols-4 gap-2">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                disabled={saving || !prefs.enabled}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  prefs.speed === option.value
                    ? "border-[#c9a94e]/50 bg-[#c9a94e]/5 text-white/90"
                    : "border-white/10 text-white/40 hover:border-[#c9a94e]/30 hover:bg-white/[0.02]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guidance toggle */}
        <button
          onClick={handleToggleGuidance}
          disabled={saving}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
            guidanceEnabled
              ? "border-[#c9a94e]/50 bg-[#c9a94e]/5"
              : "border-white/10 hover:border-[#c9a94e]/30 hover:bg-white/[0.02]"
          )}
        >
          <div>
            <span className="font-medium text-white/90">Lyra&apos;s Guidance</span>
            <p className="text-sm text-white/40">
              Voiced explanations at key progression milestones.
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            guidanceEnabled ? "bg-[#c9a94e]/20 text-[#c9a94e]" : "bg-white/5 text-white/40"
          )}>
            {guidanceEnabled ? "On" : "Off"}
          </span>
        </button>
      </div>
    </GlassPanel>
  );
}
