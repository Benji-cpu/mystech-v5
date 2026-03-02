import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { ZodiacSign } from "@/lib/astrology/birth-chart";
import {
  MOON_PHASE_EMOJI,
  MOON_TRANSIT_NOTES,
  ZODIAC_GLYPHS,
  getElementAlignment,
} from "@/lib/astrology/celestial-text";

interface TodayCelestialCardProps {
  moonPhase: string;
  moonSign: string;
  sunSign?: string | null;
  className?: string;
}

export function TodayCelestialCard({
  moonPhase,
  moonSign,
  sunSign,
  className,
}: TodayCelestialCardProps) {
  const emoji = MOON_PHASE_EMOJI[moonPhase] ?? "\u{1F315}";
  const glyph = ZODIAC_GLYPHS[moonSign as ZodiacSign] ?? "";
  const transitNote = MOON_TRANSIT_NOTES[moonSign] ?? "";
  const alignment = sunSign ? getElementAlignment(sunSign, moonSign) : null;

  return (
    <GlassPanel
      className={cn(
        "p-4 border-l-2 border-l-[#c9a94e]/40",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-sm font-medium text-white/80">
            {moonPhase}
          </span>
          <span className="text-xs text-white/40">
            in {moonSign} {glyph}
          </span>
        </div>

        {transitNote && (
          <p className="text-sm text-white/50 leading-relaxed">
            {transitNote}
          </p>
        )}

        {alignment?.note && (
          <p className="text-xs text-[#c9a94e]/70 leading-relaxed">
            {alignment.note}
          </p>
        )}
      </div>
    </GlassPanel>
  );
}
