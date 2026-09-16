"use client";

/**
 * A small, page-specific picture of what the app was actually doing when the
 * user pressed Feedback.
 *
 * The activity trail says what happened ("clicked Begin reading", "fetch 500");
 * the screenshot says what it looked like. Neither says which deck, which
 * spread, or how many of the cards had art — and those are the first three
 * questions anyone triaging a MysTech report asks. Three months of reports
 * saying "the reveal hung" had to be answered by guessing.
 *
 * Contributors call `setDomainSnapshot(key, value)` when their surface mounts
 * or changes state; the submitter reads the merged object. Keys are namespaced
 * by surface so two screens cannot clobber each other.
 *
 * Never put anything identifying in here. It is stored beside the message and
 * read by whoever triages — ids and counts, not names, emails or card text.
 */

export type DomainSnapshot = Record<string, unknown>;

const MAX_KEYS = 12;
const snapshot: DomainSnapshot = {};

/** Record (or replace) one surface's slice of state. Pass null to clear it. */
export function setDomainSnapshot(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  if (value === null || value === undefined) {
    delete snapshot[key];
    return;
  }
  if (!(key in snapshot) && Object.keys(snapshot).length >= MAX_KEYS) return;
  snapshot[key] = value;
}

/** The merged snapshot, or undefined when no surface has contributed. */
export function getDomainSnapshot(): DomainSnapshot | undefined {
  const keys = Object.keys(snapshot);
  if (keys.length === 0) return undefined;
  // Serialise defensively: a surface that hands us something circular must not
  // take the whole submission down with it.
  try {
    return JSON.parse(JSON.stringify(snapshot)) as DomainSnapshot;
  } catch {
    return undefined;
  }
}
