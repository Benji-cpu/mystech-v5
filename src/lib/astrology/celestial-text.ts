import { ZODIAC_ELEMENTS, ZODIAC_GLYPHS, type ZodiacSign } from "./birth-chart";

export { ZODIAC_GLYPHS };

export const MOON_PHASE_EMOJI: Record<string, string> = {
  "New Moon": "\u{1F311}",
  "Waxing Crescent": "\u{1F312}",
  "First Quarter": "\u{1F313}",
  "Waxing Gibbous": "\u{1F314}",
  "Full Moon": "\u{1F315}",
  "Waning Gibbous": "\u{1F316}",
  "Last Quarter": "\u{1F317}",
  "Waning Crescent": "\u{1F318}",
};

export const MOON_TRANSIT_NOTES: Record<string, string> = {
  Aries: "A bold lunar energy stirs \u2014 trust decisive instincts today.",
  Taurus: "The moon seeks comfort and grounding \u2014 savor what nourishes you.",
  Gemini: "Curiosity hums through the air \u2014 follow the thread of new ideas.",
  Cancer: "Emotional tides run deep \u2014 honor what your heart already knows.",
  Leo: "A warm, expressive moon \u2014 let your creative fire speak freely.",
  Virgo: "Clarity arrives through small details \u2014 refine and organize.",
  Libra: "Harmony calls \u2014 relationships and beauty take center stage.",
  Scorpio: "Hidden truths surface under this intense moon \u2014 look beneath.",
  Sagittarius: "The moon reaches outward \u2014 explore, wander, question everything.",
  Capricorn: "Steady and purposeful energy \u2014 build something that lasts.",
  Aquarius: "An unconventional moon \u2014 embrace the spark of originality.",
  Pisces: "Intuition flows freely \u2014 dreams and symbols carry meaning now.",
};

export function getElementAlignment(
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
      note: `The ${moonElement} moon flows with your ${userElement} sun \u2014 a harmonious day.`,
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
      note: `The ${moonElement} moon supports your ${userElement} nature \u2014 use the momentum.`,
    };
  }

  return {
    label: "contrasts with",
    note: `The ${moonElement} moon contrasts your ${userElement} sun \u2014 creative tension brings insight.`,
  };
}
