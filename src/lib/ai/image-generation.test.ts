import { describe, it, expect } from "vitest";
import { extractNegativeTerms } from "./image-generation";

describe("extractNegativeTerms", () => {
  it("returns empty string when vision has no exclusions", () => {
    expect(extractNegativeTerms("a deck about the cosmos and stargazing")).toBe("");
  });

  it("extracts 'no X' patterns", () => {
    const result = extractNegativeTerms("create a deck with no human subjects");
    expect(result).toContain("human subjects");
  });

  it("extracts 'without X' patterns", () => {
    const result = extractNegativeTerms("a symbolic deck without people");
    expect(result).toContain("people");
  });

  it("extracts 'avoid X' patterns", () => {
    const result = extractNegativeTerms("avoid dark imagery and violent scenes");
    expect(result).toContain("dark imagery");
  });

  it("extracts 'avoiding X' patterns", () => {
    const result = extractNegativeTerms("purely abstract, avoiding human figures");
    expect(result).toContain("human figures");
  });

  it("extracts 'not X' patterns", () => {
    const result = extractNegativeTerms("not any realistic portraits");
    expect(result).toContain("realistic portraits");
  });

  it("handles multiple exclusions in one vision", () => {
    const result = extractNegativeTerms(
      "a deck about overcoming fear without any human subjects — purely symbolic and abstract, no faces, avoid literal scenes"
    );
    expect(result).toContain("human subjects");
    expect(result).toContain("faces");
    expect(result).toContain("literal scenes");
  });

  it("deduplicates repeated terms", () => {
    const result = extractNegativeTerms("no people and without people");
    const terms = result.split(", ");
    const unique = [...new Set(terms)];
    expect(terms.length).toBe(unique.length);
  });

  it("returns empty string for empty input", () => {
    expect(extractNegativeTerms("")).toBe("");
  });
});
