export function buildThresholdCardPrompt({
  retreatName,
  retreatTheme,
  retreatLens,
  pathName,
  readingSummaries,
  artStyleName,
}: {
  retreatName: string;
  retreatTheme: string;
  retreatLens: string;
  pathName: string;
  readingSummaries: string;
  artStyleName?: string;
}): string {
  const styleNote = artStyleName
    ? `\nThe imagePrompt should be in the "${artStyleName}" art style.`
    : "";

  return `You are creating a Threshold Card — a special oracle card earned by completing a retreat. This card captures the essence of what the seeker traversed.

The seeker has completed the "${retreatName}" retreat on the ${pathName} path.

Retreat theme: ${retreatTheme}
Retreat focus: ${retreatLens}

Readings completed during this retreat:
${readingSummaries}

Create ONE oracle card that:
- Has a title that feels like an achievement or passage (e.g., "The Bridge Between", "What the River Taught", "The Keeper of Thresholds")
- Captures the core transformation or insight from this retreat
- Has a meaning that honors what was traversed — not a prediction, but a recognition
- Has guidance that speaks to carrying this wisdom forward
- Has an imagePrompt using threshold/crossing/bridge/gateway imagery — a visual metaphor for passage${styleNote}

The card should feel earned and sacred — like a medal that tells a story.`;
}
