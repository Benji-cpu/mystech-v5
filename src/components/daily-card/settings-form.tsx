"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { EditorialCard } from "@/components/editorial";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { detectClientTimezone } from "@/lib/daily-card/timezone";
import { cn } from "@/lib/utils";

type Initial = {
  enabled: boolean;
  hour: number;
  timezone: string;
  deckId: string | null;
  streak: number;
  longestStreak: number;
};

type DeckOption = { id: string; title: string; cardCount: number };

const HOUR_OPTIONS: { value: number; label: string }[] = Array.from(
  { length: 24 },
  (_, h) => ({
    value: h,
    label: formatHour(h),
  })
);

function formatHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export function DailyCardSettingsForm({
  initial,
  decks,
}: {
  initial: Initial;
  decks: DeckOption[];
}) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const [hour, setHour] = useState(initial.hour);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [deckId, setDeckId] = useState<string | null>(initial.deckId);
  const [pending, startTransition] = useTransition();

  // Auto-detect & sync the browser timezone on first mount if it differs.
  useEffect(() => {
    const detected = detectClientTimezone();
    if (detected && detected !== timezone) {
      setTimezone(detected);
      patch({ timezone: detected }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patch(body: Record<string, unknown>) {
    return startTransition(async () => {
      const res = await fetch("/api/daily-card/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        toast.error(data?.error ?? "Couldn't save preferences");
        return;
      }
      toast.success("Saved");
    });
  }

  return (
    <div className="space-y-6">
      <EditorialCard padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label className="text-base font-medium" style={{ color: "var(--ink-strong)" }}>
              Daily card
            </Label>
            <p className="mt-1 text-sm" style={{ color: "var(--ink-mute)" }}>
              One card from your deck delivered each morning at your local time.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              patch({ enabled: checked });
            }}
            disabled={pending}
          />
        </div>
      </EditorialCard>

      <EditorialCard
        padding="md"
        className={cn("transition-opacity", !enabled && "opacity-60 pointer-events-none")}
      >
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--ink-mute)" }}>
          Delivery time
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={hour}
            onChange={(e) => {
              const v = Number(e.target.value);
              setHour(v);
              patch({ hour: v });
            }}
            disabled={pending}
            className="rounded-xl border px-3 py-2 text-sm bg-transparent hair"
            style={{ color: "var(--ink-strong)" }}
          >
            {HOUR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="text-sm" style={{ color: "var(--ink-mute)" }}>
            local time
          </span>
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--ink-mute)" }}>
          Your timezone: <strong>{timezone}</strong>
        </p>
      </EditorialCard>

      <EditorialCard
        padding="md"
        className={cn("transition-opacity", !enabled && "opacity-60 pointer-events-none")}
      >
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--ink-mute)" }}>
          Source deck
        </p>
        {decks.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ink-mute)" }}>
            You don&rsquo;t have a personal deck yet. Build one to start receiving daily cards.
          </p>
        ) : (
          <select
            value={deckId ?? ""}
            onChange={(e) => {
              const v = e.target.value || null;
              setDeckId(v);
              patch({ deckId: v });
            }}
            disabled={pending}
            className="w-full rounded-xl border px-3 py-2 text-sm bg-transparent hair"
            style={{ color: "var(--ink-strong)" }}
          >
            <option value="">Most recent (auto)</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} · {d.cardCount} cards
              </option>
            ))}
          </select>
        )}
      </EditorialCard>

      <EditorialCard padding="md" tone="warm">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--ink-mute)" }}>
              Current streak
            </p>
            <p className="mt-1 text-3xl font-light" style={{ color: "var(--ink-strong)" }}>
              {initial.streak} {initial.streak === 1 ? "day" : "days"}
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--ink-mute)" }}>
            Longest: {initial.longestStreak}
          </p>
        </div>
      </EditorialCard>

      <p className="text-xs text-center" style={{ color: "var(--ink-mute)" }}>
        We&rsquo;ll never send more than one card a day. Toggle off any time.
      </p>

      <div className="flex justify-center">
        <Button asChild variant="outline" size="sm">
          <a href="/daily">Open today&rsquo;s card</a>
        </Button>
      </div>
    </div>
  );
}
