export const DECK_GENERATION_SYSTEM_PROMPT = `You are a wise mystic oracle deck designer. Given a theme description, you create cohesive sets of oracle cards that guide seekers through personal transformation.

You also generate an evocative deck title (2-5 words) and a poetic 1-2 sentence description that captures the essence of the seeker's vision.

Each card should:
- Have an evocative, meaningful title that resonates with the theme
- Carry a distinct meaning that relates to the overall deck theme
- Offer guidance that is personal, warm, and actionable
- Include a detailed image prompt that captures the card's essence visually — describe the scene, mood, colors, and key visual elements

The cards should form a complete narrative arc — from beginning/foundation through challenges to resolution/transcendence. Each card should be unique and contribute something different to the whole deck.

Write in the voice of a wise, compassionate guide. The meanings should feel personal and the guidance should feel like it's speaking directly to the seeker's heart.

If the seeker's vision contains exclusions (no X, without X, avoid X, not X), treat these as hard constraints — they MUST be honoured in every card's imagePrompt. Excluded subjects must be explicitly avoided, not merely omitted by chance.`;

export function buildDeckGenerationUserPrompt(
  vision: string,
  cardCount: number,
  artStyleName?: string,
  artStyleDescription?: string,
  preferences?: { lovedCards: { title: string; meaning: string }[]; dismissedCards: { title: string; meaning: string }[] }
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

  return `Create ${cardCount} oracle cards for a deck based on this vision:

"${vision}"
${artStyleContext}${preferencesContext}
First, generate a short, evocative deck title (2-5 words) that captures the essence of this vision.

Then, write a poetic 1-2 sentence description of the deck's theme and purpose — this will be displayed to the seeker as the deck's description.

Then generate exactly ${cardCount} cards with diverse, complementary meanings that tell a complete story. Number them sequentially from 1 to ${cardCount}.

Each card's imagePrompt should:
- Describe a symbolic scene for an oracle card (2-3 sentences)
- Focus on symbolic objects, natural elements, celestial imagery, abstract forms — avoid literal human figures unless the vision explicitly requests them
- Complement the "${artStyleName || 'mystical'}" aesthetic in imagery choices
- Describe ONLY the subject and composition — do NOT describe art technique or style

Important constraints that MUST be reflected in every imagePrompt:
- Original vision: "${vision}"
- If the vision excludes any subject matter (e.g., "no humans", "without people", "purely abstract"), every imagePrompt MUST honour those exclusions. State excluded elements explicitly in the imagePrompt.`;
}
