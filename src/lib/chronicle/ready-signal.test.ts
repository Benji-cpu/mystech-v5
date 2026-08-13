import { describe, it, expect } from "vitest";
import {
  CHRONICLE_READY_SIGNAL,
  hasReadySignal,
  stripReadySignal,
} from "./ready-signal";

describe("hasReadySignal", () => {
  it("detects the signal at the end of a wrap-up message", () => {
    expect(
      hasReadySignal(`The threads are woven. ${CHRONICLE_READY_SIGNAL}`)
    ).toBe(true);
  });

  it("is false for an ordinary probing reply", () => {
    expect(hasReadySignal("What stayed with you from today?")).toBe(false);
  });

  it("is false for a partially streamed signal", () => {
    expect(hasReadySignal("The threads are woven. [[REA")).toBe(false);
  });
});

describe("stripReadySignal", () => {
  it("removes the signal and the space before it", () => {
    expect(
      stripReadySignal(`The threads are woven. ${CHRONICLE_READY_SIGNAL}`)
    ).toBe("The threads are woven.");
  });

  it("removes the signal wherever it lands", () => {
    expect(
      stripReadySignal(`${CHRONICLE_READY_SIGNAL}\nIt's yours to forge.`)
    ).toBe("\nIt's yours to forge.");
  });

  it("holds back a partial signal so it never flashes mid-stream", () => {
    expect(stripReadySignal("It's yours to forge. [[REA")).toBe(
      "It's yours to forge."
    );
    expect(stripReadySignal("It's yours to forge. [")).toBe(
      "It's yours to forge."
    );
  });

  it("keeps text that merely starts with a bracket", () => {
    expect(stripReadySignal("She said [loudly] that it was done")).toBe(
      "She said [loudly] that it was done"
    );
  });

  it("leaves an ordinary message untouched", () => {
    const text = "What did that 'nowhere' feel like in your body today?";
    expect(stripReadySignal(text)).toBe(text);
  });

  it("streams monotonically — cleaned output only ever grows", () => {
    const full = `A locked door you built yourself. ${CHRONICLE_READY_SIGNAL}`;
    let previous = "";
    for (let i = 1; i <= full.length; i++) {
      const cleaned = stripReadySignal(full.slice(0, i));
      expect(cleaned.startsWith(previous)).toBe(true);
      previous = cleaned;
    }
    expect(previous).toBe("A locked door you built yourself.");
  });
});
