"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChroniclePreferencesProps {
  settings: { chronicleEnabled: boolean; generationMode: string } | null;
  deckId: string | null;
  className?: string;
}

export function ChroniclePreferences({
  settings,
  deckId,
  className,
}: ChroniclePreferencesProps) {
  const [enabled, setEnabled] = useState(settings?.chronicleEnabled ?? false);
  const [saving, setSaving] = useState(false);

  async function handleToggle(checked: boolean) {
    const previous = enabled;
    setEnabled(checked);
    setSaving(true);
    try {
      const res = await fetch("/api/chronicle/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chronicleEnabled: checked }),
      });
      if (!res.ok) {
        setEnabled(previous);
        toast.error("Failed to update Chronicle setting");
        return;
      }
      toast.success(checked ? "Chronicle activated" : "Chronicle paused");
    } catch {
      setEnabled(previous);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className={cn("p-6", className)}>
      <SectionHeader className="mb-1">Chronicle</SectionHeader>
      <p className="text-sm text-white/40 mb-4">
        Your daily journaling oracle. Chronicle generates a personal card each
        day drawn from your life story.
      </p>

      {settings === null || deckId === null ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-white/10 p-4">
          <p className="text-sm text-white/60">
            Chronicle is not set up yet. Begin the ritual to create your
            personal oracle deck.
          </p>
          <Link
            href="/chronicle/setup"
            className={cn(
              "rounded-lg border border-gold/50 bg-gold/10 px-4 py-2",
              "text-sm font-medium text-gold",
              "transition-colors hover:bg-gold/20"
            )}
          >
            Set up Chronicle
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Enable / disable toggle */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 transition-colors",
              enabled
                ? "border-gold/50 bg-gold/5"
                : "border-white/10"
            )}
          >
            <div>
              <Label
                htmlFor="chronicle-enabled"
                className="font-medium text-white/90 cursor-pointer"
              >
                Daily Chronicle
              </Label>
              <p className="text-sm text-white/40 mt-0.5">
                Receive a new oracle card each day and log your reflections.
              </p>
            </div>
            <Switch
              id="chronicle-enabled"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={saving}
            />
          </div>

          {/* Edit interests */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 p-4">
            <div>
              <p className="font-medium text-white/90">Interests & Themes</p>
              <p className="text-sm text-white/40 mt-0.5">
                Update the topics that shape your Chronicle cards.
              </p>
            </div>
            <Link
              href="/chronicle/setup"
              className={cn(
                "shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5",
                "text-sm font-medium text-white/60",
                "transition-colors hover:border-gold/30 hover:text-white/90"
              )}
            >
              Edit
            </Link>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}
