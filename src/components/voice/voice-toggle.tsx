"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useVoicePreferences } from "@/hooks/use-voice-preferences";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VoiceToggle() {
  const { preferences, loading, update } = useVoicePreferences();

  async function handleToggle() {
    const newEnabled = !preferences.enabled;
    const success = await update({ enabled: newEnabled });
    if (success) {
      toast.success(newEnabled ? "Voice enabled" : "Voice disabled");
    } else {
      toast.error("Failed to update voice setting");
    }
  }

  if (loading) return null;

  const Icon = preferences.enabled ? Volume2 : VolumeX;

  return (
    <button
      onClick={handleToggle}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        "hover:bg-white/10",
        preferences.enabled && "text-[#c9a94e]",
        !preferences.enabled && "text-muted-foreground"
      )}
      aria-label={preferences.enabled ? "Disable voice" : "Enable voice"}
    >
      <Icon className="h-4 w-4" />
      {preferences.enabled && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#c9a94e] animate-pulse" />
      )}
    </button>
  );
}
