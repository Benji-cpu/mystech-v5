import { describe, it, expect } from "vitest";
import {
  DECK_GENERATION_SYSTEM_PROMPT,
  buildDeckGenerationUserPrompt,
} from "./deck-generation";

describe("DECK_GENERATION_SYSTEM_PROMPT", () => {
  it("is a non-empty string", () => {
    expect(DECK_GENERATION_SYSTEM_PROMPT).toBeTruthy();
    expect(typeof DECK_GENERATION_SYSTEM_PROMPT).toBe("string");
  });

  it("mentions oracle cards", () => {
    expect(DECK_GENERATION_SYSTEM_PROMPT.toLowerCase()).toContain("oracle");
  });

  it("mentions image prompt requirements", () => {
    expect(DECK_GENERATION_SYSTEM_PROMPT.toLowerCase()).toContain(
      "image prompt"
    );
  });
});

describe("buildDeckGenerationUserPrompt", () => {
  it("includes the deck title", () => {
    const result = buildDeckGenerationUserPrompt(
      "My Cosmic Deck",
      "A deck about the cosmos",
      10
    );
    expect(result).toContain("My Cosmic Deck");
  });

  it("includes the description", () => {
    const result = buildDeckGenerationUserPrompt(
      "Test Deck",
      "Exploring inner peace",
      5
    );
    expect(result).toContain("Exploring inner peace");
  });

  it("includes the card count", () => {
    const result = buildDeckGenerationUserPrompt(
      "Test Deck",
      "Some description",
      7
    );
    expect(result).toContain("7");
  });

  it("mentions sequential numbering", () => {
    const result = buildDeckGenerationUserPrompt(
      "Test",
      "Description",
      12
    );
    expect(result).toContain("1 to 12");
  });
});
