"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query.
 *
 * Uses `useSyncExternalStore` so the match is read during render rather than
 * written back with `setState` from an effect — no cascading render on mount.
 *
 * The server snapshot is `false`, so callers must treat `false` as "not known
 * to match". The reading stage relies on that: its mobile layout is the safe
 * default to hydrate into.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Matches Tailwind's `lg` breakpoint — where the reading stage splits in two. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
