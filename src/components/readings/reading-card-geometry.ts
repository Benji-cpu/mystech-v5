// Reading card stage — pure geometry.
//
// Every card in the stage is absolutely positioned from a computed slot, in
// both the spread ceremony and the focus presentation. Because the two modes
// produce slots for the *same* card elements, a card physically travels from
// its place in the spread to the rail or to the focus position — no crossfade
// between two separate card systems, no remount.
//
// Pure functions, no React. Unit-tested in `reading-card-geometry.test.ts`.

import type { SpreadType } from "@/types";

export interface Box {
  width: number;
  height: number;
}

export interface Slot {
  /** Centre point, px, relative to the stage box. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  z: number;
  opacity: number;
}

export const CARD_ASPECT = 1.5;
const PAD = 16;
/** Room under the focus card for its title + position label. */
export const FOCUS_LABEL_SPACE = 58;
/**
 * The focus card is presented, not projected. Past roughly this width it stops
 * reading as a card being shown to you and starts reading as wallpaper.
 */
const MAX_FOCUS_CARD_WIDTH = 340;

function clamp(value: number, min: number, max: number): number {
  // A box too small to hold the card at all would invert the bounds; centring
  // is the least-bad answer there.
  if (max < min) return (min + max) / 2;
  return Math.min(Math.max(value, min), max);
}

// ── Spread geometry ─────────────────────────────────────────────────────

/**
 * Percentage-based anchor points per spread, matching the established
 * ceremonial arrangements. `null` means "lay out as a centred row".
 */
const SPREAD_ANCHORS: Partial<
  Record<SpreadType, { x: number; y: number; rotate?: number }[]>
> = {
  five_card: [
    { x: 50, y: 50 }, // 0 Situation (centre)
    { x: 50, y: 16 }, // 1 Challenge (top)
    { x: 50, y: 84 }, // 2 Foundation (bottom)
    { x: 16, y: 50 }, // 3 Recent Past (left)
    { x: 84, y: 50 }, // 4 Near Future (right)
  ],
  celtic_cross: [
    { x: 28, y: 50 }, // 0 Present
    { x: 28, y: 50, rotate: 90 }, // 1 Challenge (crossing)
    { x: 28, y: 82 }, // 2 Foundation
    { x: 10, y: 50 }, // 3 Recent Past
    { x: 28, y: 18 }, // 4 Best Outcome
    { x: 46, y: 50 }, // 5 Near Future
    { x: 72, y: 86 }, // 6 Self
    { x: 72, y: 62 }, // 7 Environment
    { x: 72, y: 38 }, // 8 Hopes & Fears
    { x: 72, y: 14 }, // 9 Final Outcome
  ],
};

/** Rows the arrangement stacks into — used to height-bound the card size. */
const SPREAD_ROWS: Partial<Record<SpreadType, number>> = {
  five_card: 3,
  celtic_cross: 4,
};

/**
 * Largest card width that lets the whole arrangement sit inside `box`.
 */
function spreadCardWidth(spreadType: SpreadType, box: Box, count: number): number {
  const usableW = Math.max(0, box.width - PAD * 2);
  const usableH = Math.max(0, box.height - PAD * 2);

  const rows = SPREAD_ROWS[spreadType] ?? 1;
  const anchors = SPREAD_ANCHORS[spreadType];

  // Height bound: `rows` cards stacked, plus a little air between them.
  const byHeight = (usableH / rows) * 0.88 / CARD_ASPECT;

  // Width bound: how many cards sit side by side on the widest row.
  const columns = anchors
    ? spreadType === "celtic_cross"
      ? 4
      : 3
    : count;
  const gap = columns > 3 ? 6 : 14;
  const byWidth = (usableW - gap * (columns - 1)) / columns;

  return Math.max(40, Math.floor(Math.min(byHeight, byWidth)));
}

/** Slots for the ceremonial arrangement — all cards equal, none favoured. */
export function spreadSlots(
  spreadType: SpreadType,
  box: Box,
  count: number
): Slot[] {
  if (box.width <= 0 || box.height <= 0) return [];

  const width = spreadCardWidth(spreadType, box, count);
  const height = Math.round(width * CARD_ASPECT);
  const anchors = SPREAD_ANCHORS[spreadType];

  if (anchors) {
    return Array.from({ length: count }, (_, i) => {
      const anchor = anchors[i] ?? { x: 50, y: 50 };
      // A rotated card occupies its own height horizontally, so the crossing
      // celtic card needs the larger half-extent on both axes.
      const halfX = (anchor.rotate ? height : width) / 2;
      const halfY = (anchor.rotate ? width : height) / 2;
      return {
        // Percentage anchors describe centres, and a centre near the edge puts
        // half a card outside the box. Clamping keeps outer positions — the
        // celtic "Recent Past" at x:10 especially — fully on stage.
        x: clamp((anchor.x / 100) * box.width, halfX, box.width - halfX),
        y: clamp((anchor.y / 100) * box.height, halfY, box.height - halfY),
        width,
        height,
        rotate: anchor.rotate ?? 0,
        // The crossing card must sit above the card it crosses.
        z: anchor.rotate ? 2 : 1,
        opacity: 1,
      };
    });
  }

  // Centred single row (single, three_card, and any future small spread).
  const gap = 14;
  const totalW = width * count + gap * Math.max(0, count - 1);
  const startX = (box.width - totalW) / 2;

  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (width + gap) + width / 2,
    y: box.height / 2,
    width,
    height,
    rotate: 0,
    z: 1,
    opacity: 1,
  }));
}

// ── Focus geometry ──────────────────────────────────────────────────────

export interface RailMetrics {
  thumbWidth: number;
  thumbHeight: number;
  gap: number;
  startX: number;
  top: number;
  height: number;
}

/**
 * The rail of small cards above the focus card. Slots are fixed by index, so
 * advancing a card never reshuffles the rail — the active card simply lifts
 * out of its slot and the gap it leaves reads as "this one is pulled forward".
 */
export function railMetrics(box: Box, count: number): RailMetrics {
  const gap = count > 6 ? 5 : 8;
  const available = Math.max(0, box.width - PAD * 2);
  // The rail earns its height on desktop, where there is plenty. On a phone
  // every pixel it takes comes straight out of the focus card.
  const maxThumb = box.width >= 480 ? 52 : 34;
  const thumbWidth = Math.max(
    22,
    Math.min(maxThumb, Math.floor((available - gap * (count - 1)) / count))
  );
  const thumbHeight = Math.round(thumbWidth * CARD_ASPECT);
  const totalW = thumbWidth * count + gap * Math.max(0, count - 1);

  return {
    thumbWidth,
    thumbHeight,
    gap,
    startX: (box.width - totalW) / 2,
    top: PAD,
    height: thumbHeight,
  };
}

/**
 * Slots for the focus presentation: the active card centred and large, every
 * other card resting in its rail slot.
 */
export function focusSlots(
  box: Box,
  count: number,
  activeIndex: number
): Slot[] {
  if (box.width <= 0 || box.height <= 0) return [];

  const rail = railMetrics(box, count);
  const showRail = count > 1;

  const areaTop = showRail ? rail.top + rail.height + 18 : PAD;
  const areaHeight = Math.max(120, box.height - areaTop - PAD);

  // Card sized to the area, then capped. Letting it grow to fill the column
  // made it crowd its own caption against the bottom edge and left the card
  // looming rather than presented.
  const boundByHeight = areaHeight - FOCUS_LABEL_SPACE;
  const boundByWidth = (box.width - PAD * 2) * CARD_ASPECT;
  const focusHeight = Math.max(
    120,
    Math.min(boundByHeight, boundByWidth, MAX_FOCUS_CARD_WIDTH * CARD_ASPECT)
  );
  const focusWidth = Math.round(focusHeight / CARD_ASPECT);
  const cardHeight = Math.round(focusWidth * CARD_ASPECT);

  // Centre the card + caption together in the area below the rail.
  const blockHeight = cardHeight + FOCUS_LABEL_SPACE;
  const focusTop = areaTop + Math.max(0, (areaHeight - blockHeight) / 2);

  return Array.from({ length: count }, (_, i) => {
    if (i === activeIndex) {
      return {
        x: box.width / 2,
        y: focusTop + cardHeight / 2,
        width: focusWidth,
        height: cardHeight,
        rotate: 0,
        z: 3,
        opacity: 1,
      };
    }

    return {
      x: rail.startX + i * (rail.thumbWidth + rail.gap) + rail.thumbWidth / 2,
      y: rail.top + rail.thumbHeight / 2,
      width: rail.thumbWidth,
      height: rail.thumbHeight,
      rotate: 0,
      z: 1,
      // Already-read cards stay brighter than ones still to come.
      opacity: i < activeIndex ? 0.72 : 0.42,
    };
  });
}

// ── Stage height ────────────────────────────────────────────────────────

/**
 * How tall the card stage should be on mobile, where it is a fixed band above
 * the reading rather than a full-height column.
 *
 * Derived from the viewport so the focus card is always whole — the previous
 * implementation added up guessed constants and cropped the spread whenever
 * the sums overshot.
 */
export function mobileStageHeight(
  viewportHeight: number,
  spreadType: SpreadType,
  mode: "spread" | "focus" | "closing"
): number {
  // The reading always keeps at least this much room; a card is worthless if
  // there is nowhere to read what it means.
  const minReading = 230;

  // The draw is the moment the cards deserve the screen. Reading one card, the
  // card and its meaning share it. At the close the spread is a bookend — the
  // synthesis is what the reader came back for, so the cards step aside.
  const ratio =
    mode === "closing"
      ? 0.32
      : mode === "focus"
        ? 0.5
        : spreadType === "celtic_cross"
          ? 0.62
          : 0.55;

  return Math.round(
    Math.max(190, Math.min(viewportHeight * ratio, viewportHeight - minReading))
  );
}
