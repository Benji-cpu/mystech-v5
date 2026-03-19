/**
 * Resolve the best display name for a user, with fallback chain:
 * displayName → name → "Seeker"
 */
export function resolveUserName(user: {
  displayName?: string | null;
  name?: string | null;
}): string {
  return user.displayName?.trim() || user.name?.trim() || "Seeker";
}

/**
 * Returns the first word of the resolved name (for casual address).
 */
export function resolveFirstName(user: {
  displayName?: string | null;
  name?: string | null;
}): string {
  const full = resolveUserName(user);
  return full.split(/\s+/)[0];
}
