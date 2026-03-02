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

  it("mentions generating a deck title", () => {
    expect(DECK_GENERATION_SYSTEM_PROMPT.toLowerCase()).toContain(
      "deck title"
    );
  });

  it("mentions generating a deck description", () => {
    expect(DECK_GENERATION_SYSTEM_PROMPT.toLowerCase()).toContain(
      "description"
    );
  });
});

describe("buildDeckGenerationUserPrompt", () => {
  it("includes the vision text", () => {
    const result = buildDeckGenerationUserPrompt(
      "A deck about the cosmos and stargazing",
      10
    );
    expect(result).toContain("A deck about the cosmos and stargazing");
  });

  it("includes the card count", () => {
    const result = buildDeckGenerationUserPrompt(
      "Exploring inner peace",
      7
    );
    expect(result).toContain("7");
  });

  it("mentions sequential numbering", () => {
    const result = buildDeckGenerationUserPrompt(
      "Some vision",
      12
    );
    expect(result).toContain("1 to 12");
  });

  it("instructs AI to generate a deck title", () => {
    const result = buildDeckGenerationUserPrompt(
      "Healing through nature",
      5
    );
    expect(result.toLowerCase()).toContain("deck title");
  });

  it("instructs AI to generate a deck description", () => {
    const result = buildDeckGenerationUserPrompt(
      "Healing through nature",
      5
    );
    expect(result.toLowerCase()).toContain("description");
  });

  it("includes art style context when provided", () => {
    const result = buildDeckGenerationUserPrompt(
      "Some vision",
      5,
      "Watercolor Dream",
      "Soft watercolor washes with delicate, flowing brushstrokes."
    );
    expect(result).toContain("Art Style: Watercolor Dream");
    expect(result).toContain("Soft watercolor washes");
    expect(result).toContain('Complement the "Watercolor Dream" aesthetic');
  });

  it("uses mystical as default when no art style provided", () => {
    const result = buildDeckGenerationUserPrompt(
      "Some vision",
      5
    );
    expect(result).toContain('"mystical"');
    expect(result).not.toContain("Art Style:");
  });
});
