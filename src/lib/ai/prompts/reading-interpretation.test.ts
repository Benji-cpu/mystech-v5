import { describe, it, expect } from "vitest";
import { buildReadingInterpretationPrompt, buildReadingSystemPrompt, STRUCTURE_TARGETS, ReadingInterpretationSchema } from "./reading-interpretation";
import type { ReadingLength } from "@/types";

const mockCards = [
  {
    positionName: "Past",
    title: "The River",
    meaning: "Change and flow",
    guidance: "Let go of resistance",
  },
  {
    positionName: "Present",
    title: "The Hearth",
    meaning: "Warmth and home",
    guidance: "Find comfort in the familiar",
  },
  {
    positionName: "Future",
    title: "The Star",
    meaning: "Hope and renewal",
    guidance: "Trust the light ahead",
  },
];

describe("ReadingInterpretationSchema", () => {
  it("validates a correct interpretation object", () => {
    const result = ReadingInterpretationSchema.safeParse({
      cardSections: [
        { positionName: "Past", text: "The River flows..." },
        { positionName: "Present", text: "The Hearth warms..." },
      ],
      synthesis: "Together these cards tell us...",
      reflectiveQuestion: "What does this stir in you?",
    });
    expect(result.success).toBe(true);
  });

  it("requires cardSections, synthesis, and reflectiveQuestion", () => {
    const result = ReadingInterpretationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("ignores astrology fields stored on older readings", () => {
    const result = ReadingInterpretationSchema.safeParse({
      cardSections: [
        { positionName: "Past", text: "Text...", astroResonance: { relevantPlacement: "sun" } },
      ],
      synthesis: "Synthesis...",
      reflectiveQuestion: "Question?",
      astroContext: { dominantInfluence: "sun", celestialNote: "Full Moon" },
    });
    expect(result.success).toBe(true);
  });
});

describe("buildReadingInterpretationPrompt", () => {
  it("includes question when provided", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "What should I focus on?",
      cards: mockCards,
    });

    expect(result).toContain("What should I focus on?");
  });

  it("handles null question gracefully", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
    });

    expect(result).toContain("general life guidance");
    expect(result).not.toContain("null");
  });

  it("instructs per-card sections", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
    });

    expect(result).toContain("For each card");
    expect(result).toContain("separate section");
  });

  it("includes sentence guidance for brief", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
    });

    expect(result).toContain("1-2 sentences");
  });

  it("uses standard sentence guidance when specified", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
      readingLength: "standard",
    });

    expect(result).toContain("2-3 sentences maximum");
  });

  it("uses deep sentence guidance when specified", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
      readingLength: "deep",
    });

    expect(result).toContain("3-5 sentences");
  });

  it("includes all card details in output", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Test?",
      cards: mockCards,
    });

    expect(result).toContain("The River");
    expect(result).toContain("Change and flow");
    expect(result).toContain("Let go of resistance");
    expect(result).toContain("Past");

    expect(result).toContain("The Hearth");
    expect(result).toContain("Warmth and home");
    expect(result).toContain("Present");

    expect(result).toContain("The Star");
    expect(result).toContain("Hope and renewal");
    expect(result).toContain("Future");
  });

  it("includes spread type in prompt", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
    });

    expect(result).toContain("three card");
  });

  it("includes user context when provided", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Career advice?",
      cards: mockCards,
      userContext: {
        contextSummary: "User frequently asks about career transitions.",
        recentReadings: [
          { question: "Should I change jobs?", spreadType: "single", feedback: "positive" },
          { question: "What about relationships?", spreadType: "three_card", feedback: null },
        ],
        deckThemes: ["nature", "personal growth"],
      },
    });

    expect(result).toContain("About this seeker:");
    expect(result).toContain("User frequently asks about career transitions.");
    expect(result).toContain("Should I change jobs?");
    expect(result).toContain("nature, personal growth");
    expect(result).toContain("Readings they found resonant");
  });

  it("works without user context (backward compatible)", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Test?",
      cards: mockCards,
    });

    expect(result).not.toContain("About this seeker:");
    expect(result).toContain("Test?");
    expect(result).toContain("The River");
  });

  it("omits context section when user context has no useful data", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Test?",
      cards: mockCards,
      userContext: {
        contextSummary: null,
        recentReadings: [],
        deckThemes: [],
      },
    });

    expect(result).not.toContain("About this seeker:");
  });

  it("instructs synthesis and reflective question", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
    });

    expect(result).toContain("synthesis");
    expect(result).toContain("reflective question");
  });

  it("never asks for astrology", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Test?",
      cards: mockCards,
    });

    expect(result).not.toContain("Astrological context");
    expect(result).not.toContain("Sun in");
    expect(result).not.toContain("astroResonance");
  });
});

describe("buildReadingSystemPrompt", () => {
  it("defaults to brief", () => {
    const result = buildReadingSystemPrompt();
    expect(result).toContain("razor-sharp and efficient");
    expect(result).toContain("1-2 sentences");
  });

  it("includes standard voice modifiers", () => {
    const result = buildReadingSystemPrompt("standard");
    expect(result).toContain("concise and impactful");
    expect(result).toContain("2-3 sentences");
  });

  it("includes deep voice modifiers", () => {
    const result = buildReadingSystemPrompt("deep");
    expect(result).toContain("expansive and poetic");
    expect(result).toContain("3-5 sentences");
  });

  it("always includes Lyra identity", () => {
    const lengths: ReadingLength[] = ["brief", "standard", "deep"];
    for (const length of lengths) {
      const result = buildReadingSystemPrompt(length);
      expect(result).toContain("You are Lyra");
      expect(result).toContain("personal oracle card reading");
    }
  });

  it("instructs per-card structured output", () => {
    const result = buildReadingSystemPrompt();
    expect(result).toContain("separate interpretation section");
    expect(result).toContain("synthesis");
    expect(result).toContain("reflective question");
  });
});

describe("STRUCTURE_TARGETS", () => {
  it("has all three reading lengths", () => {
    expect(STRUCTURE_TARGETS).toHaveProperty("brief");
    expect(STRUCTURE_TARGETS).toHaveProperty("standard");
    expect(STRUCTURE_TARGETS).toHaveProperty("deep");
  });

  it("has increasing paragraph counts within each tier", () => {
    const lengths: ReadingLength[] = ["brief", "standard", "deep"];
    for (const length of lengths) {
      const tier = STRUCTURE_TARGETS[length];
      expect(tier.single.paragraphs).toBeLessThan(tier.three_card.paragraphs);
      expect(tier.three_card.paragraphs).toBeLessThan(tier.five_card.paragraphs);
      expect(tier.five_card.paragraphs).toBeLessThan(tier.celtic_cross.paragraphs);
    }
  });

  it("has increasing maxTokens within each tier", () => {
    const lengths: ReadingLength[] = ["brief", "standard", "deep"];
    for (const length of lengths) {
      const tier = STRUCTURE_TARGETS[length];
      expect(tier.single.maxTokens).toBeLessThan(tier.three_card.maxTokens);
      expect(tier.three_card.maxTokens).toBeLessThan(tier.five_card.maxTokens);
      expect(tier.five_card.maxTokens).toBeLessThan(tier.celtic_cross.maxTokens);
    }
  });

  it("brief is shorter than standard which is shorter than deep", () => {
    expect(STRUCTURE_TARGETS.brief.three_card.paragraphs).toBeLessThan(
      STRUCTURE_TARGETS.standard.three_card.paragraphs
    );
    expect(STRUCTURE_TARGETS.standard.three_card.paragraphs).toBeLessThan(
      STRUCTURE_TARGETS.deep.three_card.paragraphs
    );
    expect(STRUCTURE_TARGETS.brief.three_card.maxTokens).toBeLessThan(
      STRUCTURE_TARGETS.standard.three_card.maxTokens
    );
    expect(STRUCTURE_TARGETS.standard.three_card.maxTokens).toBeLessThan(
      STRUCTURE_TARGETS.deep.three_card.maxTokens
    );
  });
});
