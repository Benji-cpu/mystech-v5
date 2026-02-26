"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { GoldButton } from "@/components/ui/gold-button";
import { LyraSigil } from "@/components/guide/lyra-sigil";
import { LYRA_CELESTIAL } from "@/components/guide/lyra-constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ZODIAC_GLYPHS,
  type ZodiacSign,
} from "@/lib/astrology/birth-chart";
import { CITIES_BY_REGION } from "@/lib/astrology/cities";
import type { AstrologyProfile } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────

const PLACEMENT_COLORS: Record<string, string> = {
  sun: "from-amber-500/30 to-yellow-500/30 border-amber-500/40",
  moon: "from-blue-400/30 to-indigo-400/30 border-blue-400/40",
  rising: "from-rose-400/30 to-pink-400/30 border-rose-400/40",
};

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h12 = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const ampm = i < 12 ? "AM" : "PM";
  return { value: String(i), label: `${h12} ${ampm}` };
});

const MINUTES = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5;
  return { value: String(m), label: String(m).padStart(2, "0") };
});

const STEP_SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// ── Types ─────────────────────────────────────────────────────────────────

type SetupStep = "intro" | "date" | "time" | "location" | "reveal";
type ViewMode = "setup" | "display" | "edit";

interface CelestialProfileProps {
  profile: AstrologyProfile | null;
  className?: string;
}

// ── Main Component ────────────────────────────────────────────────────────

export function CelestialProfile({ profile: initialProfile, className }: CelestialProfileProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [mode, setMode] = useState<ViewMode>(initialProfile ? "display" : "setup");

  const handleSaved = useCallback((p: AstrologyProfile) => {
    setProfile(p);
    setMode("display");
    // Invalidate Next.js server component cache so the profile
    // persists across navigations (router cache would otherwise
    // serve stale props with profile=null).
    router.refresh();
  }, [router]);

  if (mode === "setup") {
    return (
      <GuidedSetup
        className={className}
        onComplete={handleSaved}
      />
    );
  }

  if (mode === "edit") {
    return (
      <EditForm
        profile={profile!}
        className={className}
        onSave={handleSaved}
        onCancel={() => setMode("display")}
      />
    );
  }

  return (
    <CompactDisplay
      profile={profile!}
      className={className}
      onEdit={() => setMode("edit")}
      onSetupMissing={() => setMode("setup")}
    />
  );
}

// ── Placement Badge ───────────────────────────────────────────────────────

function PlacementBadge({
  placement,
  sign,
  animate,
  delay,
}: {
  placement: "sun" | "moon" | "rising";
  sign: string;
  animate?: boolean;
  delay?: number;
}) {
  const glyph = ZODIAC_GLYPHS[sign as ZodiacSign] ?? "";
  const labels = { sun: "Sun", moon: "Moon", rising: "Rising" };

  const content = (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-gradient-to-r border text-sm font-medium",
        PLACEMENT_COLORS[placement]
      )}
    >
      <span className="text-base">{glyph}</span>
      <span className="text-white/50">{labels[placement]}</span>
      <span className="text-white/90">{sign}</span>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: delay ?? 0,
      }}
    >
      {content}
    </motion.div>
  );
}

// ── Guided Setup ──────────────────────────────────────────────────────────

function GuidedSetup({
  className,
  onComplete,
}: {
  className?: string;
  onComplete: (profile: AstrologyProfile) => void;
}) {
  const [step, setStep] = useState<SetupStep>("intro");
  const [saving, setSaving] = useState(false);

  // Form state
  const [birthDate, setBirthDate] = useState("");
  const [knowsTime, setKnowsTime] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [cityKey, setCityKey] = useState("");
  const [revealedProfile, setRevealedProfile] = useState<AstrologyProfile | null>(null);

  // Intermediate Sun sign preview (shown after date step)
  const [sunSignPreview, setSunSignPreview] = useState<string | null>(null);

  const handleDateContinue = useCallback(() => {
    if (!birthDate) return;
    // Calculate sun sign preview from date
    const [y, m, d] = birthDate.split("-").map(Number);
    const sunSign = getSunSignFromDate(m, d);
    setSunSignPreview(sunSign);
    setTimeout(() => setStep("time"), 600);
  }, [birthDate]);

  const handleSave = useCallback(
    async (includeLocation: boolean) => {
      if (!birthDate) return;
      setSaving(true);

      const [y, m, d] = birthDate.split("-").map(Number);

      const body: Record<string, unknown> = {
        birthDate: new Date(y, m - 1, d).toISOString(),
      };

      if (knowsTime) {
        body.birthHour = parseInt(hour);
        body.birthMinute = parseInt(minute);
      }

      if (includeLocation && cityKey) {
        const allCities = Object.values(CITIES_BY_REGION).flat();
        const city = allCities.find((c) => c.name === cityKey);
        if (city) {
          body.birthLatitude = city.latitude;
          body.birthLongitude = city.longitude;
          body.birthLocationName = city.name;
        }
      }

      try {
        const res = await fetch("/api/astrology/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.success) {
          toast.error(data.error || "Failed to save profile");
          setSaving(false);
          return;
        }
        const saved = data.data as AstrologyProfile;
        setRevealedProfile(saved);
        setStep("reveal");
        toast.success("Celestial profile saved");

        // Auto-transition to display after reveal
        setTimeout(() => onComplete(saved), 3000);
      } catch {
        toast.error("Something went wrong");
      } finally {
        setSaving(false);
      }
    },
    [birthDate, knowsTime, hour, minute, cityKey, onComplete]
  );

  const handleTimeContinue = useCallback(() => {
    if (knowsTime) {
      setStep("location");
    } else {
      // Skip location, save directly
      handleSave(false);
    }
  }, [knowsTime, handleSave]);

  return (
    <GlassPanel className={cn("p-5 sm:p-6 space-y-4", className)}>
      <SectionHeader>Celestial Profile</SectionHeader>

      <AnimatePresence mode="wait">
        {/* INTRO */}
        {step === "intro" && (
          <StepWrapper key="intro">
            <LyraMessage text={LYRA_CELESTIAL.intro} />
            <GoldButton onClick={() => setStep("date")} className="w-full mt-4">
              Begin Setup
            </GoldButton>
          </StepWrapper>
        )}

        {/* DATE */}
        {step === "date" && (
          <StepWrapper key="date">
            <LyraMessage text={LYRA_CELESTIAL.sunExplain} />
            <div className="space-y-2 mt-3">
              <Label htmlFor="birth-date" className="text-white/60 text-sm">
                Birth date
              </Label>
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-white/5 border-white/10"
              />
            </div>
            {sunSignPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center mt-3"
              >
                <PlacementBadge placement="sun" sign={sunSignPreview} />
              </motion.div>
            )}
            <GoldButton
              onClick={handleDateContinue}
              disabled={!birthDate}
              className="w-full mt-4"
            >
              Continue
            </GoldButton>
          </StepWrapper>
        )}

        {/* TIME */}
        {step === "time" && (
          <StepWrapper key="time">
            <LyraMessage text={LYRA_CELESTIAL.moonExplain} />
            <div className="flex items-center gap-3 mt-3">
              <Switch
                id="knows-time"
                checked={knowsTime}
                onCheckedChange={setKnowsTime}
              />
              <Label htmlFor="knows-time" className="text-white/70 text-sm">
                I know my birth time
              </Label>
            </div>
            {knowsTime && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex gap-3 mt-3"
              >
                <div className="flex-1 space-y-1">
                  <Label className="text-white/50 text-xs">Hour</Label>
                  <Select value={hour} onValueChange={setHour}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-white/50 text-xs">Minute</Label>
                  <Select value={minute} onValueChange={setMinute}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
            {!knowsTime && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-white/40 mt-2"
              >
                {LYRA_CELESTIAL.moonSkip}
              </motion.p>
            )}
            <GoldButton onClick={handleTimeContinue} disabled={saving} className="w-full mt-4">
              {knowsTime ? "Continue" : "Save Celestial Profile"}
            </GoldButton>
          </StepWrapper>
        )}

        {/* LOCATION */}
        {step === "location" && (
          <StepWrapper key="location">
            <LyraMessage text={LYRA_CELESTIAL.risingExplain} />
            <div className="space-y-2 mt-3">
              <Label className="text-white/60 text-sm">Birth city</Label>
              <Select value={cityKey} onValueChange={setCityKey}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a city..." />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {Object.entries(CITIES_BY_REGION).map(([region, cities]) => (
                    <SelectGroup key={region}>
                      <SelectLabel>{region}</SelectLabel>
                      {cities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <GoldButton
              onClick={() => handleSave(true)}
              disabled={saving || !cityKey}
              className="w-full mt-4"
            >
              {saving ? "Saving..." : "Save Celestial Profile"}
            </GoldButton>
          </StepWrapper>
        )}

        {/* REVEAL */}
        {step === "reveal" && revealedProfile && (
          <StepWrapper key="reveal">
            <div className="flex flex-wrap justify-center gap-3 py-4">
              <PlacementBadge
                placement="sun"
                sign={revealedProfile.sunSign}
                animate
                delay={0}
              />
              {revealedProfile.moonSign && (
                <PlacementBadge
                  placement="moon"
                  sign={revealedProfile.moonSign}
                  animate
                  delay={0.3}
                />
              )}
              {revealedProfile.risingSign && (
                <PlacementBadge
                  placement="rising"
                  sign={revealedProfile.risingSign}
                  animate
                  delay={0.6}
                />
              )}
            </div>
            <LyraMessage text={LYRA_CELESTIAL.reveal} />
          </StepWrapper>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}

// ── Compact Display ───────────────────────────────────────────────────────

function CompactDisplay({
  profile,
  className,
  onEdit,
  onSetupMissing,
}: {
  profile: AstrologyProfile;
  className?: string;
  onEdit: () => void;
  onSetupMissing: () => void;
}) {
  const [showInfo, setShowInfo] = useState(false);

  const birthSummary = formatBirthSummary(profile);
  const hasPartialData = !profile.birthTimeKnown || !profile.birthLocationName;

  return (
    <GlassPanel className={cn("p-5 sm:p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <SectionHeader>Celestial Profile</SectionHeader>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1.5 rounded-md text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
            aria-label="Toggle sign explanations"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-[#c9a94e] hover:text-[#daa520] font-medium transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      {/* Big Three badges */}
      <div className="flex flex-wrap gap-2">
        <PlacementBadge placement="sun" sign={profile.sunSign} />
        {profile.moonSign && (
          <PlacementBadge placement="moon" sign={profile.moonSign} />
        )}
        {profile.risingSign && (
          <PlacementBadge placement="rising" sign={profile.risingSign} />
        )}
      </div>

      {/* Birth summary */}
      <p className="text-xs text-white/40">{birthSummary}</p>

      {/* Info panel (explanations) */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="text-xs text-white/40 space-y-1 pt-2 border-t border-white/5">
              <p><strong className="text-white/50">Sun</strong> &mdash; your core identity and life purpose</p>
              <p><strong className="text-white/50">Moon</strong> &mdash; your emotional inner world and instincts</p>
              <p><strong className="text-white/50">Rising</strong> &mdash; how you present yourself to the world</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Partial data nudge */}
      {hasPartialData && (
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-[#c9a94e]/70 hover:text-[#c9a94e] transition-colors"
        >
          {!profile.birthTimeKnown
            ? LYRA_CELESTIAL.partialNudge.noTime
            : LYRA_CELESTIAL.partialNudge.noLocation}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </GlassPanel>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────

function EditForm({
  profile,
  className,
  onSave,
  onCancel,
}: {
  profile: AstrologyProfile;
  className?: string;
  onSave: (profile: AstrologyProfile) => void;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);

  // Pre-populate from existing profile
  const profileDate = profile.birthDate instanceof Date
    ? profile.birthDate
    : new Date(profile.birthDate);

  const [birthDate, setBirthDate] = useState(
    formatDateForInput(profileDate)
  );
  const [knowsTime, setKnowsTime] = useState(profile.birthTimeKnown);
  const [hour, setHour] = useState(String(profile.birthHour ?? 12));
  const [minute, setMinute] = useState(
    String(roundToNearest5(profile.birthMinute ?? 0))
  );
  const [cityKey, setCityKey] = useState(profile.birthLocationName ?? "");

  const handleSave = useCallback(async () => {
    if (!birthDate) return;
    setSaving(true);

    const [y, m, d] = birthDate.split("-").map(Number);

    const body: Record<string, unknown> = {
      birthDate: new Date(y, m - 1, d).toISOString(),
    };

    if (knowsTime) {
      body.birthHour = parseInt(hour);
      body.birthMinute = parseInt(minute);
    }

    if (knowsTime && cityKey) {
      const allCities = Object.values(CITIES_BY_REGION).flat();
      const city = allCities.find((c) => c.name === cityKey);
      if (city) {
        body.birthLatitude = city.latitude;
        body.birthLongitude = city.longitude;
        body.birthLocationName = city.name;
      }
    }

    try {
      const res = await fetch("/api/astrology/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Failed to update profile");
        setSaving(false);
        return;
      }
      toast.success("Celestial profile updated");
      onSave(data.data as AstrologyProfile);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }, [birthDate, knowsTime, hour, minute, cityKey, onSave]);

  return (
    <GlassPanel className={cn("p-5 sm:p-6 space-y-4", className)}>
      <SectionHeader>Edit Celestial Profile</SectionHeader>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-birth-date" className="text-white/60 text-sm">
          Birth date
        </Label>
        <Input
          id="edit-birth-date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Time toggle + selects */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch
            id="edit-knows-time"
            checked={knowsTime}
            onCheckedChange={setKnowsTime}
          />
          <Label htmlFor="edit-knows-time" className="text-white/70 text-sm">
            I know my birth time
          </Label>
        </div>
        {knowsTime && (
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <Label className="text-white/50 text-xs">Hour</Label>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-white/50 text-xs">Minute</Label>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Location — only when time is known */}
      {knowsTime && (
        <div className="space-y-1.5">
          <Label className="text-white/60 text-sm">Birth city</Label>
          <Select value={cityKey} onValueChange={setCityKey}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select a city..." />
            </SelectTrigger>
            <SelectContent className="max-h-[280px]">
              {Object.entries(CITIES_BY_REGION).map(([region, cities]) => (
                <SelectGroup key={region}>
                  <SelectLabel>{region}</SelectLabel>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
        >
          Cancel
        </button>
        <GoldButton
          onClick={handleSave}
          disabled={saving || !birthDate}
          className="flex-1"
        >
          {saving ? "Saving..." : "Save Changes"}
        </GoldButton>
      </div>
    </GlassPanel>
  );
}

// ── Shared Sub-components ─────────────────────────────────────────────────

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={STEP_SPRING}
    >
      {children}
    </motion.div>
  );
}

function LyraMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <LyraSigil size="sm" state="attentive" className="mt-0.5 shrink-0" />
      <p className="text-sm text-white/50 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDateForInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function roundToNearest5(n: number): number {
  return Math.round(n / 5) * 5;
}

function formatBirthSummary(profile: AstrologyProfile): string {
  const date = profile.birthDate instanceof Date
    ? profile.birthDate
    : new Date(profile.birthDate);

  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  let summary = `Born ${dateStr}`;

  if (profile.birthTimeKnown && profile.birthHour != null) {
    const h = profile.birthHour;
    const m = profile.birthMinute ?? 0;
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";
    summary += ` at ${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  if (profile.birthLocationName) {
    summary += ` \u00B7 ${profile.birthLocationName}`;
  }

  return summary;
}

/**
 * Rough Sun sign from month/day (tropical zodiac).
 * Used only for the inline preview during setup — the real calculation
 * happens server-side via the API.
 */
function getSunSignFromDate(month: number, day: number): string {
  const signs: [number, number, string][] = [
    [1, 20, "Capricorn"], [2, 19, "Aquarius"], [3, 20, "Pisces"],
    [4, 20, "Aries"], [5, 21, "Taurus"], [6, 21, "Gemini"],
    [7, 23, "Cancer"], [8, 23, "Leo"], [9, 23, "Virgo"],
    [10, 23, "Libra"], [11, 22, "Scorpio"], [12, 22, "Sagittarius"],
  ];

  for (let i = signs.length - 1; i >= 0; i--) {
    const [m, d, sign] = signs[i];
    if (month > m || (month === m && day >= d)) return sign;
  }
  return "Capricorn";
}
