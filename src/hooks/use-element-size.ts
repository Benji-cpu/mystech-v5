"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Measures an element's content box and keeps it in sync via ResizeObserver.
 *
 * The reading stage sizes cards from the box they actually live in rather than
 * from `window.innerWidth`. Viewport-derived guesses were what let cards slide
 * under the fixed header and crop on short mobile screens — the guess had no
 * way to know how much height the header, rail and action bar had already
 * taken.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  const measure = useCallback((el: T) => {
    // `offsetWidth`/`offsetHeight`, NOT `getBoundingClientRect()`. The rect
    // includes ancestor transforms, so a Framer `layout` animation in a parent
    // reports a scaled box mid-flight — and because the border box never
    // actually changed, ResizeObserver never fires again to correct it. That
    // stale reading is what threw the focus card into the corner at a fraction
    // of its size.
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    setSize((prev) =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height }
    );
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    measure(el);

    const observer = new ResizeObserver(() => measure(el));
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  return { ref, size };
}

/**
 * Current viewport height in px, tracking resize and mobile URL-bar changes.
 *
 * Read through `useSyncExternalStore` so the value is available during render
 * instead of arriving via a post-mount `setState`. Returns 0 on the server so
 * callers can skip layout work that would run against an SSR guess.
 */
export function useViewportHeight(): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () => window.removeEventListener("resize", onStoreChange);
    },
    () => window.innerHeight,
    () => 0
  );
}

/** Card art is a 2:3 portrait — height = width * 1.5. */
export const CARD_ASPECT = 1.5;

/**
 * Largest 2:3 card that fits inside `box` once `reserve` px of vertical space
 * has been set aside for labels. Clamped so a card never disappears on very
 * short viewports and never becomes cartoonish on very tall ones.
 */
export function fitCardToBox(
  box: ElementSize,
  { reserve = 0, min = 96, max = 460 }: { reserve?: number; min?: number; max?: number } = {}
): { cardWidth: number; cardHeight: number } {
  if (box.width <= 0 || box.height <= 0) {
    return { cardWidth: 0, cardHeight: 0 };
  }

  const availableHeight = Math.max(0, box.height - reserve);
  const heightIfWidthBound = box.width * CARD_ASPECT;
  const cardHeight = Math.min(availableHeight, heightIfWidthBound, max * CARD_ASPECT);
  const cardWidth = Math.max(min, Math.round(cardHeight / CARD_ASPECT));

  return { cardWidth, cardHeight: Math.round(cardWidth * CARD_ASPECT) };
}
