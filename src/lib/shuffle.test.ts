import { describe, it, expect } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("preserves array length", () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffle(input)).toHaveLength(input.length);
  });

  it("preserves all elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort()).toEqual(input.sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("handles empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("handles single element", () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it("handles two elements", () => {
    const input = [1, 2];
    const result = shuffle(input);
    expect(result).toHaveLength(2);
    expect(result.sort()).toEqual([1, 2]);
  });

  it("produces different orderings over many runs (not always identical)", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(JSON.stringify(shuffle(input)));
    }
    // With 10 elements, 50 shuffles should produce multiple unique orderings
    expect(results.size).toBeGreaterThan(1);
  });

  it("works with non-numeric types", () => {
    const input = ["a", "b", "c"];
    const result = shuffle(input);
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual(["a", "b", "c"]);
  });
});
