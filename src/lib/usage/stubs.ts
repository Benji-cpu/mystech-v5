/**
 * Placeholder limit checks for future features.
 * These log but don't block — they'll be enforced when their features are built.
 */

// TODO: Feature 12 — Person Cards limit
export function checkPersonCardLimit(_userId: string, _plan: string) {
  // Free: 5 person cards, Pro: 50 person cards
  console.log("[usage:stub] checkPersonCardLimit — not enforced yet (Feature 12)");
  return { allowed: true };
}

// TODO: Feature 16 — Collaboration edit access
export function checkCollaborationAccess(_userId: string, _plan: string) {
  // Free: view only, Pro: full edit
  console.log("[usage:stub] checkCollaborationAccess — not enforced yet (Feature 16)");
  return { allowed: true };
}

// TODO: Feature 15 — Reading history depth
export function getReadingHistoryLimit(_plan: string): number {
  // Free: last 10, Pro: unlimited
  console.log("[usage:stub] getReadingHistoryLimit — not enforced yet (Feature 15)");
  return Infinity;
}
