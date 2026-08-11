import { describe, it, expect } from "vitest";
import {
  spreadSlots,
  focusSlots,
  railMetrics,
  mobileStageHeight,
  FOCUS_LABEL_SPACE,
  CARD_ASPECT,
  type Box,
  type Slot,
} from "./reading-card-geometry";
import type { SpreadType } from "@/types";

// Representative stage boxes: a phone band, and a desktop column.
const PHONE: Box = { width: 390, height: 420 };
const DESKTOP: Box = { width: 559, height: 851 };

const SPREADS: { type: SpreadType; count: number }[] = [
  { type: "single", count: 1 },
  { type: "three_card", count: 3 },
  { type: "five_card", count: 5 },
  { type: "celtic_cross", count: 10 },
];

/**
 * Every card's bounding box, given slots are centre-anchored. A card rotated
 * 90° (the celtic crossing card) swaps which dimension extends on which axis.
 */
function bounds(slots: Slot[]) {
  const extents = slots.map((s) => {
    const rotated = Math.abs(s.rotate % 180) === 90;
    return {
      halfX: (rotated ? s.height : s.width) / 2,
      halfY: (rotated ? s.width : s.height) / 2,
      x: s.x,
      y: s.y,
    };
  });

  return {
    left: Math.min(...extents.map((e) => e.x - e.halfX)),
    right: Math.max(...extents.map((e) => e.x + e.halfX)),
    top: Math.min(...extents.map((e) => e.y - e.halfY)),
    bottom: Math.max(...extents.map((e) => e.y + e.halfY)),
  };
}

describe("spreadSlots", () => {
  it.each(SPREADS)(
    "keeps the whole $type arrangement inside the box on desktop",
    ({ type, count }) => {
      const slots = spreadSlots(type, DESKTOP, count);
      const b = bounds(slots);

      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.top).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(DESKTOP.width);
      expect(b.bottom).toBeLessThanOrEqual(DESKTOP.height);
    }
  );

  it.each(SPREADS)(
    "keeps the whole $type arrangement inside the box on a phone",
    ({ type, count }) => {
      const slots = spreadSlots(type, PHONE, count);
      const b = bounds(slots);

      expect(b.left).toBeGreaterThanOrEqual(0);
      expect(b.top).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(PHONE.width);
      expect(b.bottom).toBeLessThanOrEqual(PHONE.height);
    }
  );

  it("gives every card the same size — no card is favoured before the reading", () => {
    const slots = spreadSlots("five_card", DESKTOP, 5);
    const widths = new Set(slots.map((s) => s.width));
    expect(widths.size).toBe(1);
  });

  it("keeps the 2:3 card aspect", () => {
    const [slot] = spreadSlots("three_card", DESKTOP, 3);
    expect(slot.height / slot.width).toBeCloseTo(CARD_ASPECT, 1);
  });

  it("stacks the crossing celtic card above the one it crosses", () => {
    const slots = spreadSlots("celtic_cross", DESKTOP, 10);
    expect(slots[1].rotate).toBe(90);
    expect(slots[1].z).toBeGreaterThan(slots[0].z);
  });

  it("returns nothing for an unmeasured box rather than dividing by zero", () => {
    expect(spreadSlots("three_card", { width: 0, height: 0 }, 3)).toEqual([]);
  });
});

describe("focusSlots", () => {
  it.each([1, 3, 5, 10])(
    "fits the focus card and its caption inside the box (%i cards)",
    (count) => {
      const slots = focusSlots(DESKTOP, count, 0);
      const active = slots[0];
      const captionBottom = active.y + active.height / 2 + FOCUS_LABEL_SPACE;

      expect(active.y - active.height / 2).toBeGreaterThanOrEqual(0);
      expect(captionBottom).toBeLessThanOrEqual(DESKTOP.height);
    }
  );

  it("fits on a short phone band without clipping the caption", () => {
    const slots = focusSlots(PHONE, 3, 1);
    const active = slots[1];
    const captionBottom = active.y + active.height / 2 + FOCUS_LABEL_SPACE;

    expect(active.y - active.height / 2).toBeGreaterThanOrEqual(0);
    expect(captionBottom).toBeLessThanOrEqual(PHONE.height);
  });

  it("centres the active card horizontally", () => {
    const slots = focusSlots(DESKTOP, 3, 2);
    expect(slots[2].x).toBeCloseTo(DESKTOP.width / 2, 5);
  });

  it("makes the active card the largest and lifts it above the rail", () => {
    const slots = focusSlots(DESKTOP, 3, 1);
    expect(slots[1].width).toBeGreaterThan(slots[0].width);
    expect(slots[1].width).toBeGreaterThan(slots[2].width);
    expect(slots[1].z).toBeGreaterThan(slots[0].z);
  });

  it("holds rail slots at fixed positions so advancing never reshuffles them", () => {
    const onFirst = focusSlots(DESKTOP, 3, 0);
    const onSecond = focusSlots(DESKTOP, 3, 1);

    // Card 2 sits in the same rail slot whether or not card 1 is focused.
    expect(onFirst[2].x).toBeCloseTo(onSecond[2].x, 5);
    expect(onFirst[2].y).toBeCloseTo(onSecond[2].y, 5);
  });

  it("dims cards still to come more than cards already read", () => {
    const slots = focusSlots(DESKTOP, 3, 1);
    expect(slots[0].opacity).toBeGreaterThan(slots[2].opacity);
  });

  it("keeps the rail within the box width", () => {
    for (const count of [2, 3, 5, 10]) {
      const rail = railMetrics(PHONE, count);
      const totalWidth =
        rail.thumbWidth * count + rail.gap * (count - 1);
      expect(rail.startX).toBeGreaterThanOrEqual(0);
      expect(rail.startX + totalWidth).toBeLessThanOrEqual(PHONE.width);
    }
  });

  it("returns nothing for an unmeasured box", () => {
    expect(focusSlots({ width: 0, height: 0 }, 3, 0)).toEqual([]);
  });
});

describe("mobileStageHeight", () => {
  const VIEWPORT = 844;

  it("always leaves room to actually read the interpretation", () => {
    for (const mode of ["spread", "focus", "closing"] as const) {
      for (const { type } of SPREADS) {
        const h = mobileStageHeight(VIEWPORT, type, mode);
        expect(VIEWPORT - h).toBeGreaterThanOrEqual(230);
      }
    }
  });

  it("gives the cards the most room during the draw and the least at the close", () => {
    const draw = mobileStageHeight(VIEWPORT, "three_card", "spread");
    const focus = mobileStageHeight(VIEWPORT, "three_card", "focus");
    const closing = mobileStageHeight(VIEWPORT, "three_card", "closing");

    expect(draw).toBeGreaterThan(focus);
    expect(focus).toBeGreaterThan(closing);
  });

  it("still yields a usable stage on a very short viewport", () => {
    const h = mobileStageHeight(568, "three_card", "focus");
    expect(h).toBeGreaterThanOrEqual(190);
    expect(h).toBeLessThan(568);
  });
});
