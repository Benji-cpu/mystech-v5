import type { PathContextForPrompt, CardPathMemory } from "@/types";

/**
 * Build the "Cards Remember" section for prompt injection.
 * Shows past appearances of drawn cards within the same Retreat.
 */
export function buildCardsRememberSection(
  memories: CardPathMemory[]
): string {
  if (memories.length === 0) return "";

  const lines = memories.map((m) => {
    const dateStr = m.readingDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const questionPart = m.question
      ? `\n  At that time you asked: "${m.question}"`
      : "";
    return `- "${m.cardTitle}" appeared during your ${m.retreatName} chapter (step: ${m.waypointName}, ${dateStr}).${questionPart}`;
  });

  return `
Cards with path memory:
${lines.join("\n")}

When interpreting these cards, honor their path history. Notice continuity, growth, or recurring patterns. Only weave this in where it deepens the reading naturally.`;
}

/**
 * Build the full path context section for the reading interpretation prompt.
 * Follows the same pattern as astroContext and chronicleContext.
 */
export function buildPathContextSection(
  ctx: PathContextForPrompt
): string {
  const cardsRemember = buildCardsRememberSection(ctx.cardsRemember);

  const circleIntro = `The seeker is on the ${ctx.pathName} path`;

  return `

${circleIntro}, currently in the "${ctx.retreatName}" chapter at the "${ctx.waypointName}" step.

Path lens: ${ctx.pathLens}

Chapter focus: ${ctx.retreatLens}

Step intention: ${ctx.waypointLens}
${cardsRemember}

Interpret through the lens of their current path. The path context is seasoning, not the main course — the cards and their personal symbolism remain the focus.`;
}
