export function buildObstacleCardPrompt({
  triggerCardTitle,
  triggerCardMeaning,
  triggerCardGuidance,
  appearanceCount,
  retreatName,
  pathName,
  artStyleName,
}: {
  triggerCardTitle: string;
  triggerCardMeaning: string;
  triggerCardGuidance: string;
  appearanceCount: number;
  retreatName: string;
  pathName: string;
  artStyleName?: string;
}): string {
  const styleNote = artStyleName
    ? `\nThe imagePrompt should be in the "${artStyleName}" art style.`
    : "";

  return `You are creating an Obstacle Card — a special oracle card forged when a pattern is detected in the seeker's journey.

The card "${triggerCardTitle}" has appeared ${appearanceCount} times during the "${retreatName}" retreat on the ${pathName} path.

Original card:
- Title: ${triggerCardTitle}
- Meaning: ${triggerCardMeaning}
- Guidance: ${triggerCardGuidance}

This recurrence is a signal. Create ONE oracle card that:
- Names the resistance or pattern the seeker keeps encountering — this isn't punishment, it's a mirror
- Has a title that suggests a test, threshold-not-yet-crossed, or cycle (e.g., "The Comfortable Lie", "What Refuses to Be Ignored", "The Same Door, Again")
- Has a meaning that speaks to WHY this pattern keeps showing up — with compassion, not judgment
- Has guidance about how to face this pattern consciously rather than repeat it
- Has an imagePrompt using imagery of barriers, mirrors, tests, or cycles — the visual metaphor of encountering the same challenge${styleNote}

The card should feel honest and confronting but ultimately kind — like a friend who cares enough to name what you keep avoiding.`;
}
