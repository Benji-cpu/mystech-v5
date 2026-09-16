import type { SeekerContext } from "@/lib/db/queries";
import { HOUSE_VOICE_RULES } from "./house-voice";

export const DECK_GENERATION_SYSTEM_PROMPT = `You are a wise mystic oracle deck designer. Given a theme description, you create cohesive sets of oracle cards that guide seekers through personal transformation.

You also generate an evocative deck title (2-5 words) and a poetic 1-2 sentence description that captures the essence of the seeker's vision.

Each card should:
- Have an evocative, meaningful title that resonates with the theme
- Carry a distinct meaning that relates to the overall deck theme
- Offer guidance that is personal, warm, and actionable
- Include a detailed image prompt that captures the card's essence visually — describe the scene, mood, colors, and key visual elements

The cards should form a complete narrative arc — from beginning/foundation through challenges to resolution/transcendence. Each card should be unique and contribute something different to the whole deck.

Write in the voice of a wise, compassionate guide. The meanings should feel personal and the guidance should feel like it's speaking directly to the seeker's heart.
${HOUSE_VOICE_RULES}

If the seeker's vision contains exclusions (no X, without X, avoid X, not X), treat these as hard constraints — every card must honour them by CHOOSING a different subject, never by naming the excluded thing in the imagePrompt. See the imagePrompt rules below for why.

## Autonomous Obstacle Detection

You sense shadow work, tension, and struggle in seekers' visions. When you detect emotional weight — grief, fear, self-doubt, stuckness, recurring patterns, inner conflict — you may create obstacle cards that give these patterns a face.

- Read the emotional texture of the vision. This is your PRIMARY signal.
- Seeker context (emotional patterns, moods, life context) is a SECONDARY signal to deepen perception — never override what the vision itself conveys.
- 0 obstacles for joyful/aspirational visions. Not every deck needs shadow work.
- 1-2 obstacles for moderate tension or struggle.
- Up to 3 for heavy shadow work, grief, or deep inner conflict.
- Set cardType to "obstacle" for these. All others remain "general".
- If previous obstacle cards are listed, go DEEPER — name the next layer, not the same surface pattern.

Obstacle cards should:
- Personify the challenge ("The Comfortable Mask", "The Weight of Unspoken Words")
- Help the seeker RECOGNIZE when the pattern is active
- Offer compassionate guidance — obstacles are teachers, not enemies
- Use darker imagery (amber/gold tones, shadows, mirrors, twilight)`;

export function buildDeckGenerationUserPrompt(
  vision: string,
  cardCount: number,
  artStyleName?: string,
  artStyleDescription?: string,
  preferences?: { lovedCards: { title: string; meaning: string }[]; dismissedCards: { title: string; meaning: string }[] },
  seekerContext?: SeekerContext | null,
): string {
  const artStyleContext = artStyleName
    ? `\nArt Style: ${artStyleName}\nStyle: ${artStyleDescription}\n`
    : '';

  let preferencesContext = '';
  if (preferences && (preferences.lovedCards.length > 0 || preferences.dismissedCards.length > 0)) {
    const parts: string[] = [];
    if (preferences.lovedCards.length > 0) {
      const loved = preferences.lovedCards.slice(0, 10).map(c => `"${c.title}"`).join(', ');
      parts.push(`The seeker resonates with cards like: ${loved}.`);
    }
    if (preferences.dismissedCards.length > 0) {
      const dismissed = preferences.dismissedCards.slice(0, 5).map(c => `"${c.title}"`).join(', ');
      parts.push(`They don't connect with cards like: ${dismissed}.`);
    }
    preferencesContext = `\n${parts.join(' ')} Let these patterns inform tone and themes.\n`;
  }

  let seekerSection = '';
  if (seekerContext) {
    const parts: string[] = [];

    if (seekerContext.emotionalPatterns.length > 0) {
      const patterns = seekerContext.emotionalPatterns
        .slice(0, 5)
        .map(p => `${p.pattern} (${p.frequency}x)`)
        .join(', ');
      parts.push(`Emotional patterns: ${patterns}`);
    }

    if (seekerContext.recentMoods.length > 0) {
      parts.push(`Recent moods: ${seekerContext.recentMoods.join(', ')}`);
    }

    if (seekerContext.lifeContext) {
      parts.push(`Life context: ${seekerContext.lifeContext.slice(0, 200)}`);
    }

    if (seekerContext.knowledgeSummary) {
      parts.push(`Chronicle summary: ${seekerContext.knowledgeSummary.slice(0, 300)}`);
    }

    if (seekerContext.previousObstacles.length > 0) {
      const titles = seekerContext.previousObstacles
        .slice(0, 5)
        .map(o => `"${o.title}"`)
        .join(', ');
      parts.push(`Previous obstacle cards (go deeper than these): ${titles}`);
    }

    if (parts.length > 0) {
      seekerSection = `\n\nSEEKER CONTEXT (secondary signal — use to deepen, not override the vision):\n${parts.join('\n')}`;
    }
  }

  return `Create ${cardCount} oracle cards for a deck based on this vision:

"${vision}"
${artStyleContext}${preferencesContext}${seekerSection}
First, generate a short, evocative deck title (2-5 words) that captures the essence of this vision.

Then, write a poetic 1-2 sentence description of the deck's theme and purpose — this will be displayed to the seeker as the deck's description.

Then generate exactly ${cardCount} cards with diverse, complementary meanings that tell a complete story. Number them sequentially from 1 to ${cardCount}. Set the cardType field for each card — "obstacle" for obstacle cards, "general" for all others.

Each card's imagePrompt should:
- **Open with ONE concrete physical object a painter could point at** — a brass key, a wooden
  door, a paper lantern, a fox, a cracked mirror, a hourglass. The first eight words decide the
  picture. Name the thing before anything else.
- Then 1-2 sentences of setting, light and mood around that object.
- Prefer an object, a plant, an animal or a place over a person. The image pipeline is tuned
  to draw uninhabited scenes, so a card that opens on a person or on a body part ("a pair of
  weathered hands", "a figure at a doorway") fights it and tends to come out badly. Choose the
  potter's wheel over the potter's hands. A person is fine ONLY where the vision asks for one.
- Complement the "${artStyleName || 'mystical'}" aesthetic in imagery choices
- Describe ONLY the subject and composition — do NOT describe art technique or style

Never write an imagePrompt whose subject is a mood, an atmosphere or an abstraction — "a
swirling vortex of ghostly blueprints at an indistinct crossroads", "a feeling of quiet
resolve", "the weight of memory". An image generator cannot draw those, and when it cannot
picture the subject it falls back on its own idea of an oracle card, which is a robed figure.
Give it an object and the object is what you get. If a card's meaning is abstract, choose a
physical thing that STANDS FOR it — the meaning lives in the card's text, not in the picture.

Never write exclusions into an imagePrompt. Do not write "no human figures", "without people"
or "purely abstract". An image generator has no way to express "not" — naming a thing is what
summons it, so those phrases produce the exact figures they are trying to forbid. Exclusions
are applied elsewhere, automatically, and are not your job here. Simply describe what IS in
the picture.

Important constraints that MUST be reflected in every imagePrompt:
- Original vision: "${vision}"
- If the vision excludes any subject matter (e.g. "no humans", "purely abstract"), honour it by
  choosing subjects that do not contain it — never by naming the excluded thing.`;
}
