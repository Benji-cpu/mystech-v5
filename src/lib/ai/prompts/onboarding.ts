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
  reasoning: z.string().describe("One sentence explaining why this style fits this person's situation"),
  artStyleName: z.enum(PRESET_ART_STYLE_NAMES),
});

const ART_STYLE_DESCRIPTIONS: Record<PresetArtStyleName, string> = {
  "Tarot Classic": "traditional, rich symbolism, timeless imagery — choose ONLY for situations relating to tradition, history, or classic symbolic archetypes",
  "Watercolor Dream": "soft, fluid, emotional, pastel tones — for emotional processing, grief, relationships, gentle transitions",
  "Celestial": "cosmic, stars, moon, constellations, deep space — for cosmic questions, spirituality, big life changes, wonder",
  "Botanical": "nature, plants, growth, organic forms, earthy — for growth, healing, grounding, connection to nature",
  "Abstract Mystic": "symbolic, geometric, non-literal, intuitive — for complex inner states, transformation, the unknowable",
  "Dark Gothic": "introspective, shadow, depth, intensity — for shadow work, loss, intensity, deep psychological exploration",
  "Art Nouveau": "ornate, flowing, decorative, art-inspired — for beauty, creativity, artistic expression, elegance",
  "Ethereal Light": "luminous, soft, transcendent, angelic — for hope, spirituality, clarity, divine connection",
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function buildArtStyleSystemPrompt(): string {
  const shuffledNames = shuffleArray([...PRESET_ART_STYLE_NAMES]);
  const styleList = shuffledNames
    .map((name) => `- ${name}: ${ART_STYLE_DESCRIPTIONS[name]}`)
    .join("\n");

  return `You are Lyra, a mystical oracle guide. Your task is to choose the single most resonant visual art style for a new oracle deck based on what a user has shared about their life situation.

The available styles are:
${styleList}

Think carefully about the person's emotional tone and life themes before choosing. Consider what visual language would feel most personally meaningful — not generic — for their specific situation. Each style should resonate like a mirror for their journey.`;
}

/** @deprecated Use buildArtStyleSystemPrompt() for shuffled ordering */
export const ONBOARDING_ART_STYLE_SYSTEM_PROMPT = buildArtStyleSystemPrompt();

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
