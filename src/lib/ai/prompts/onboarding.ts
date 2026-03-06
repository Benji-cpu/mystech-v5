import { z } from "zod";

// The 8 preset art style names — must match what's seeded in the DB
export const PRESET_ART_STYLE_NAMES = [
  "Tarot Classic",
  "Watercolor Dream",
  "Celestial",
  "Botanical",
  "Abstract Mystic",
  "Dark Gothic",
  "Art Nouveau",
  "Ethereal Light",
] as const;

export type PresetArtStyleName = (typeof PRESET_ART_STYLE_NAMES)[number];

export const ART_STYLE_SCHEMA = z.object({
  artStyleName: z.enum(PRESET_ART_STYLE_NAMES),
});

export const ONBOARDING_ART_STYLE_SYSTEM_PROMPT = `You are Lyra, a mystical oracle guide. Your task is to choose the single most resonant visual art style for a new oracle deck based on what a user has shared about their life situation.

The available styles are:
- Tarot Classic: traditional, rich symbolism, timeless imagery
- Watercolor Dream: soft, fluid, emotional, pastel tones
- Celestial: cosmic, stars, moon, constellations, deep space
- Botanical: nature, plants, growth, organic forms, earthy
- Abstract Mystic: symbolic, geometric, non-literal, intuitive
- Dark Gothic: introspective, shadow, depth, intensity
- Art Nouveau: ornate, flowing, decorative, art-inspired
- Ethereal Light: luminous, soft, transcendent, angelic

Choose the style that would create the most meaningful visual language for this particular person's journey. Trust your intuition.

Respond with only the art style name — nothing else.`;

export function buildArtStyleSelectionPrompt(userInput: string): string {
  return `The seeker has shared this about their current life situation:

"${userInput}"

Which of the 8 art styles would speak most deeply to this person's journey right now?`;
}

export function buildOnboardingDeckPrompt(userInput: string): string {
  return `Create 3 oracle cards for a seeker who has shared this about their life:

"${userInput}"

This is their very first oracle deck — the cards should feel immediately personal and meaningful, not generic.

First, generate a short, evocative deck title (2-5 words) that captures the essence of what they shared.

Then write a poetic 1-2 sentence description of the deck's theme and purpose.

Then generate exactly 3 cards. The three cards should mirror a journey:
1. A foundation card — what underlies their current situation
2. A clarity card — what is being asked of them right now
3. A horizon card — what is possible ahead

Each card's imagePrompt should:
- Describe a symbolic scene for an oracle card (2-3 sentences)
- Focus on concrete visual subjects — figures, objects, nature, symbols
- Describe ONLY the subject and composition — do NOT describe art technique or style`;
}
