"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  className?: string;
}

export function VoicePreferences({ initialPrefs, className }: VoicePreferencesProps) {
  const [prefs, setPrefs] = useState<VoicePrefs>(initialPrefs);
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

  function handleSpeedChange(speed: VoiceSpeed) {
    if (speed === prefs.speed) return;
    setPrefs((p) => ({ ...p, speed }));
    patchVoice({ voiceSpeed: speed });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Voice</CardTitle>
        <CardDescription>
          Configure Lyra's voice narration for readings and conversations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice enabled toggle */}
        <button
          onClick={handleToggleEnabled}
          disabled={saving}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors",
            prefs.enabled
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-white/[0.02]"
          )}
        >
          <div>
            <span className="font-medium">Voice Narration</span>
            <p className="text-sm text-muted-foreground">
              Lyra speaks readings and card reveals aloud.
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            prefs.enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {prefs.enabled ? "On" : "Off"}
          </span>
        </button>

        {/* Auto-play toggle */}
        <button
          onClick={handleToggleAutoplay}
          disabled={saving || !prefs.enabled}
          className={cn(
            "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors",
            !prefs.enabled && "opacity-50 cursor-not-allowed",
            prefs.autoplay && prefs.enabled
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-white/[0.02]"
          )}
        >
          <div>
            <span className="font-medium">Auto-Play</span>
            <p className="text-sm text-muted-foreground">
              Automatically narrate when interpretations stream in.
            </p>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded",
            prefs.autoplay && prefs.enabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {prefs.autoplay ? "On" : "Off"}
          </span>
        </button>

        {/* Speed */}
        <div className={cn(!prefs.enabled && "opacity-50 pointer-events-none")}>
          <p className="text-sm font-medium mb-3">Speed</p>
          <div className="grid grid-cols-4 gap-2">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSpeedChange(option.value)}
                disabled={saving || !prefs.enabled}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  prefs.speed === option.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:bg-white/[0.02]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
