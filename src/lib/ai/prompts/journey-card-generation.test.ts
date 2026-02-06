import { describe, it, expect } from "vitest";
import {
  buildJourneyCardGenerationPrompt,
  buildCardEditPrompt,
  buildCardRegenerationPrompt,
} from "./journey-card-generation";

const TEST_ANCHORS = [
  { theme: "transitions", emotion: "bittersweet", symbol: "bridge" },
  { theme: "growth", emotion: "hope", symbol: "seedling" },
];

describe("buildJourneyCardGenerationPrompt", () => {
  it("includes deck title and theme", () => {
    const result = buildJourneyCardGenerationPrompt(
      "Seasons of My Life",
      "Life transitions",
      10,
      TEST_ANCHORS,
      "A discussion about life transitions"
    );

    expect(result).toContain("Seasons of My Life");
    expect(result).toContain("Life transitions");
  });

  it("includes card count", () => {
    const result = buildJourneyCardGenerationPrompt(
      "Test",
      "Theme",
      7,
      TEST_ANCHORS,
      "Summary"
    );

    expect(result).toContain("7");
  });

  it("includes anchors list", () => {
    const result = buildJourneyCardGenerationPrompt(
      "Test",
      "Theme",
      10,
      TEST_ANCHORS,
      "Summary"
    );

    expect(result).toContain('"transitions"');
    expect(result).toContain('"bittersweet"');
    expect(result).toContain('"bridge"');
    expect(result).toContain('"growth"');
  });

  it("includes conversation summary", () => {
    const result = buildJourneyCardGenerationPrompt(
      "Test",
      "Theme",
      10,
      TEST_ANCHORS,
      "A deep conversation about change"
    );

    expect(result).toContain("A deep conversation about change");
  });
});

describe("buildCardEditPrompt", () => {
  const currentCard = {
    title: "The First Frost",
    meaning: "New beginnings through endings",
    guidance: "Embrace change with grace",
    imagePrompt: "A frost-covered landscape at dawn",
  };

  it("includes current card fields", () => {
    const result = buildCardEditPrompt(currentCard, "Make it warmer");

    expect(result).toContain("The First Frost");
    expect(result).toContain("New beginnings through endings");
    expect(result).toContain("Embrace change with grace");
    expect(result).toContain("A frost-covered landscape at dawn");
  });

  it("includes the instruction", () => {
    const result = buildCardEditPrompt(currentCard, "Make it more hopeful");

    expect(result).toContain("Make it more hopeful");
  });

  it("includes conversation context when provided", () => {
    const result = buildCardEditPrompt(
      currentCard,
      "Make it warmer",
      "We discussed warmth and renewal"
    );

    expect(result).toContain("We discussed warmth and renewal");
    expect(result).toContain("CONVERSATION CONTEXT");
  });

  it("omits conversation context section when not provided", () => {
    const result = buildCardEditPrompt(currentCard, "Make it warmer");

    expect(result).not.toContain("CONVERSATION CONTEXT");
  });
});

describe("buildCardRegenerationPrompt", () => {
  const existingCards = [
    { cardNumber: 1, title: "The First Frost" },
    { cardNumber: 2, title: "Summer's Peak" },
    { cardNumber: 3, title: "Autumn's Whisper" },
  ];

  it("includes card number and deck title", () => {
    const result = buildCardRegenerationPrompt(
      2,
      "Seasons of My Life",
      "Life transitions",
      TEST_ANCHORS,
      existingCards
    );

    expect(result).toContain("#2");
    expect(result).toContain("Seasons of My Life");
  });

  it("includes existing cards excluding the target", () => {
    const result = buildCardRegenerationPrompt(
      2,
      "Seasons",
      "transitions",
      TEST_ANCHORS,
      existingCards
    );

    expect(result).toContain("The First Frost");
    expect(result).toContain("Autumn's Whisper");
    expect(result).not.toContain("Card 2: Summer's Peak");
  });

  it("includes anchors", () => {
    const result = buildCardRegenerationPrompt(
      1,
      "Test",
      "Theme",
      TEST_ANCHORS,
      existingCards
    );

    expect(result).toContain('"transitions"');
    expect(result).toContain('"seedling"');
  });

  it("includes conversation summary when provided", () => {
    const result = buildCardRegenerationPrompt(
      1,
      "Test",
      "Theme",
      TEST_ANCHORS,
      existingCards,
      "We explored life changes"
    );

    expect(result).toContain("We explored life changes");
  });

  it("omits conversation context when not provided", () => {
    const result = buildCardRegenerationPrompt(
      1,
      "Test",
      "Theme",
      TEST_ANCHORS,
      existingCards
    );

    expect(result).not.toContain("CONVERSATION CONTEXT");
  });
});
