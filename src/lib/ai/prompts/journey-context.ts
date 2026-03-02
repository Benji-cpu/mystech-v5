import type { JourneyContextForPrompt, CardJourneyMemory } from "@/types";

/**
 * Build the "Cards Remember" section for prompt injection.
 * Shows past appearances of drawn cards within the same Retreat.
 */
export function buildCardsRememberSection(
  memories: CardJourneyMemory[]
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
    return `- "${m.cardTitle}" appeared during your ${m.retreatName} retreat (waypoint: ${m.waypointName}, ${dateStr}).${questionPart}`;
  });

  return `
Cards with journey memory:
${lines.join("\n")}

When interpreting these cards, honor their journey history. Notice continuity, growth, or recurring patterns. Only weave this in where it deepens the reading naturally.`;
}

/**
 * Build the full journey context section for the reading interpretation prompt.
 * Follows the same pattern as astroContext and chronicleContext.
 */
export function buildJourneyContextSection(
  ctx: JourneyContextForPrompt
): string {
  const cardsRemember = buildCardsRememberSection(ctx.cardsRemember);

  return `

The seeker is on the ${ctx.pathName} path, currently in the "${ctx.retreatName}" retreat at the "${ctx.waypointName}" waypoint.

Path lens: ${ctx.pathLens}

Retreat focus: ${ctx.retreatLens}

Waypoint intention: ${ctx.waypointLens}
${cardsRemember}

Interpret through the lens of their current journey. The journey context is seasoning, not the main course — the cards and their personal symbolism remain the focus.`;
}
