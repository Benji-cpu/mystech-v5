import { getCardPathHistory } from "@/lib/db/queries-paths";

export type ObstacleProposal = {
  triggerCardTitle: string;
  triggerCardId: string;
  appearanceCount: number;
  retreatId: string;
  pattern: string;
};

/**
 * Detect whether any cards in the current reading have appeared 3+ times
 * in the same retreat, suggesting a recurring pattern (obstacle).
 */
export async function detectObstacleCandidate(
  userId: string,
  readingId: string,
  cardIds: string[],
  retreatId: string
): Promise<ObstacleProposal | null> {
  if (cardIds.length === 0) return null;

  const journeyHistory = await getCardPathHistory(
    userId,
    cardIds,
    readingId,
    retreatId
  );

  if (journeyHistory.length === 0) return null;

  // Count appearances per card title
  const titleCounts = new Map<string, { count: number; cardId: string }>();
  for (const memory of journeyHistory) {
    const existing = titleCounts.get(memory.cardTitle);
    if (existing) {
      existing.count++;
    } else {
      // Find the cardId from the drawn cardIds that matches this title
      titleCounts.set(memory.cardTitle, { count: 1, cardId: "" });
    }
  }

  // Find strongest signal (most appearances, needs 2+ past = 3+ total with current)
  let best: { title: string; count: number } | null = null;
  for (const [title, { count }] of titleCounts) {
    // count is past appearances; +1 for current reading = total
    const total = count + 1;
    if (total >= 3 && (!best || count > best.count)) {
      best = { title, count: total };
    }
  }

  if (!best) return null;

  // Find the cardId from the input that matches this title
  // We need to look it up from the journey history results
  const matchingMemory = journeyHistory.find(
    (m) => m.cardTitle === best!.title
  );

  return {
    triggerCardTitle: best.title,
    triggerCardId: matchingMemory ? "" : "", // Will be resolved from drawn cards
    appearanceCount: best.count,
    retreatId,
    pattern: `"${best.title}" has appeared ${best.count} times during this chapter — a pattern may be emerging.`,
  };
}
