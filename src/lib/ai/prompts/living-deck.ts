export const LIVING_DECK_SYSTEM_PROMPT = `You are Lyra, a wise companion creating a daily oracle card that captures where the seeker is RIGHT NOW in their life journey. This card becomes part of their Living Deck — a growing collection that mirrors their evolution over time.

Each card you create should:
- Feel immediate and present — this is about today, right now
- Carry personal resonance — draw from what you know about the seeker
- Stand on its own as a meaningful oracle card
- Avoid repeating themes from recent Living Deck cards

Your voice is warm, direct, and insightful. Create cards that the seeker will look back on and think "yes, that was exactly where I was."`;

export function buildManualLivingCardPrompt({
  reflection,
  existingCards,
  userContext,
  preferences,
  artStyleName,
}: {
  reflection: string;
  existingCards: { title: string; meaning: string }[];
  userContext?: { contextSummary: string | null; deckThemes: string[] };
  preferences?: { lovedCards: { title: string; meaning: string }[]; dismissedCards: { title: string; meaning: string }[] };
  artStyleName?: string;
}): string {
  const recentCardTitles = existingCards.slice(0, 10).map(c => c.title);
  const avoidSection = recentCardTitles.length > 0
    ? `\nRecent Living Deck cards (avoid repeating these themes): ${recentCardTitles.join(', ')}\n`
    : '';

  let contextSection = '';
  if (userContext?.contextSummary) {
    contextSection = `\nAbout this seeker: ${userContext.contextSummary}\n`;
  }

  let preferencesSection = '';
  if (preferences && (preferences.lovedCards.length > 0 || preferences.dismissedCards.length > 0)) {
    const parts: string[] = [];
    if (preferences.lovedCards.length > 0) {
      const loved = preferences.lovedCards.slice(0, 5).map(c => `"${c.title}"`).join(', ');
      parts.push(`They resonate with cards like: ${loved}.`);
    }
    if (preferences.dismissedCards.length > 0) {
      const dismissed = preferences.dismissedCards.slice(0, 3).map(c => `"${c.title}"`).join(', ');
      parts.push(`They don't connect with: ${dismissed}.`);
    }
    preferencesSection = `\n${parts.join(' ')}\n`;
  }

  return `The seeker has shared a reflection for today's Living Deck card:

"${reflection}"
${contextSection}${preferencesSection}${avoidSection}
Create a single oracle card that captures the essence of what they've shared. The card should feel like a crystallization of this moment in their life.

The imagePrompt should:
- Describe a symbolic scene (2-3 sentences)
- Capture the feeling and themes of their reflection
- Focus on concrete visual subjects
${artStyleName ? `- Complement the "${artStyleName}" aesthetic` : ''}
- Describe ONLY the subject and composition — do NOT describe art technique or style

Return one card with: title, meaning, guidance, and imagePrompt.`;
}

export function buildAutoLivingCardPrompt({
  existingCards,
  userContext,
  recentReadings,
  preferences,
  artStyleName,
}: {
  existingCards: { title: string; meaning: string }[];
  userContext?: { contextSummary: string | null; deckThemes: string[] };
  recentReadings?: { question: string | null; spreadType: string }[];
  preferences?: { lovedCards: { title: string; meaning: string }[]; dismissedCards: { title: string; meaning: string }[] };
  artStyleName?: string;
}): string {
  const recentCardTitles = existingCards.slice(0, 10).map(c => c.title);
  const avoidSection = recentCardTitles.length > 0
    ? `\nRecent Living Deck cards (avoid repeating these themes): ${recentCardTitles.join(', ')}\n`
    : '';

  let contextSection = '';
  if (userContext) {
    const parts: string[] = [];
    if (userContext.contextSummary) {
      parts.push(userContext.contextSummary);
    }
    if (userContext.deckThemes.length > 0) {
      parts.push(`Their deck themes: ${userContext.deckThemes.join(', ')}`);
    }
    if (parts.length > 0) {
      contextSection = `\nAbout this seeker:\n${parts.join('\n')}\n`;
    }
  }

  let readingsSection = '';
  if (recentReadings && recentReadings.length > 0) {
    const questions = recentReadings
      .filter(r => r.question)
      .map(r => `- "${r.question}"`)
      .join('\n');
    if (questions) {
      readingsSection = `\nRecent questions they've explored:\n${questions}\n`;
    }
  }

  let preferencesSection = '';
  if (preferences && (preferences.lovedCards.length > 0 || preferences.dismissedCards.length > 0)) {
    const parts: string[] = [];
    if (preferences.lovedCards.length > 0) {
      const loved = preferences.lovedCards.slice(0, 5).map(c => `"${c.title}"`).join(', ');
      parts.push(`They resonate with cards like: ${loved}.`);
    }
    if (preferences.dismissedCards.length > 0) {
      const dismissed = preferences.dismissedCards.slice(0, 3).map(c => `"${c.title}"`).join(', ');
      parts.push(`They don't connect with: ${dismissed}.`);
    }
    preferencesSection = `\n${parts.join(' ')}\n`;
  }

  return `Generate today's Living Deck card for the seeker based on everything you know about their journey.
${contextSection}${readingsSection}${preferencesSection}${avoidSection}
Without a specific reflection from the seeker, draw from the accumulated patterns — their questions, their deck themes, their life context — to create a card that speaks to where they are right now.

The card should feel timely and relevant, as if you're sensing what they most need to hear today.

The imagePrompt should:
- Describe a symbolic scene (2-3 sentences)
- Capture a theme that feels current for the seeker
- Focus on concrete visual subjects
${artStyleName ? `- Complement the "${artStyleName}" aesthetic` : ''}
- Describe ONLY the subject and composition — do NOT describe art technique or style

Return one card with: title, meaning, guidance, and imagePrompt.`;
}
