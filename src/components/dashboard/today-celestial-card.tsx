import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { ZodiacSign } from "@/lib/astrology/birth-chart";
import { ZODIAC_ELEMENTS, ZODIAC_GLYPHS } from "@/lib/astrology/birth-chart";

const MOON_PHASE_EMOJI: Record<string, string> = {
  "New Moon": "\u{1F311}",
  "Waxing Crescent": "\u{1F312}",
  "First Quarter": "\u{1F313}",
  "Waxing Gibbous": "\u{1F314}",
  "Full Moon": "\u{1F315}",
  "Waning Gibbous": "\u{1F316}",
  "Last Quarter": "\u{1F317}",
  "Waning Crescent": "\u{1F318}",
};

const MOON_TRANSIT_NOTES: Record<string, string> = {
  Aries: "A bold lunar energy stirs — trust decisive instincts today.",
  Taurus: "The moon seeks comfort and grounding — savor what nourishes you.",
  Gemini: "Curiosity hums through the air — follow the thread of new ideas.",
  Cancer: "Emotional tides run deep — honor what your heart already knows.",
  Leo: "A warm, expressive moon — let your creative fire speak freely.",
  Virgo: "Clarity arrives through small details — refine and organize.",
  Libra: "Harmony calls — relationships and beauty take center stage.",
  Scorpio: "Hidden truths surface under this intense moon — look beneath.",
  Sagittarius: "The moon reaches outward — explore, wander, question everything.",
  Capricorn: "Steady and purposeful energy — build something that lasts.",
  Aquarius: "An unconventional moon — embrace the spark of originality.",
  Pisces: "Intuition flows freely — dreams and symbols carry meaning now.",
};

function getElementAlignment(
  userSunSign: string,
  moonSign: string
): { label: string; note: string } {
  const userElement = ZODIAC_ELEMENTS[userSunSign as ZodiacSign];
  const moonElement = ZODIAC_ELEMENTS[moonSign as ZodiacSign];
  if (!userElement || !moonElement) {
    return { label: "neutral", note: "" };
  }

  if (userElement === moonElement) {
    return {
      label: "flows with",
      note: `The ${moonElement} moon flows with your ${userElement} sun — a harmonious day.`,
    };
  }

  const complementary: Record<string, string> = {
    fire: "air",
    air: "fire",
    earth: "water",
    water: "earth",
  };
  if (complementary[userElement] === moonElement) {
    return {
      label: "supports",
      note: `The ${moonElement} moon supports your ${userElement} nature — use the momentum.`,
    };
  }

  return {
    label: "contrasts with",
    note: `The ${moonElement} moon contrasts your ${userElement} sun — creative tension brings insight.`,
  };
}

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
