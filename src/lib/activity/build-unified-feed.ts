import type { ActivityItem, ActivityItemWithTemporal } from "@/types";

/** The user's own activity, most recent first. */
export function buildUnifiedFeed(
  userItems: ActivityItem[],
  options?: { limit?: number }
): ActivityItemWithTemporal[] {
  const { limit = 25 } = options ?? {};
  const now = Date.now();

  return userItems
    .map((item) => ({ ...item, isFuture: item.timestamp.getTime() > now }))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
