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

  it("validates with optional astroResonance per card", () => {
    const result = ReadingInterpretationSchema.safeParse({
      cardSections: [
        {
          positionName: "Past",
          text: "The River flows...",
          astroResonance: {
            relevantPlacement: "sun",
            rulingSign: "Scorpio",
            rulingPlanet: "Pluto",
            elementHarmony: "aligned",
          },
        },
        { positionName: "Present", text: "The Hearth warms..." },
      ],
      synthesis: "Together...",
      reflectiveQuestion: "What stirs?",
      astroContext: {
        dominantInfluence: "sun",
        celestialNote: "Waxing Crescent in Gemini",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates without astrology fields (backward compatible)", () => {
    const result = ReadingInterpretationSchema.safeParse({
      cardSections: [
        { positionName: "Past", text: "Text..." },
      ],
      synthesis: "Synthesis...",
      reflectiveQuestion: "Question?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid astroResonance values", () => {
    const result = ReadingInterpretationSchema.safeParse({
      cardSections: [
        {
          positionName: "Past",
          text: "Text...",
          astroResonance: {
            relevantPlacement: "invalid",
            rulingSign: "Scorpio",
            rulingPlanet: "Pluto",
            elementHarmony: "aligned",
          },
        },
      ],
      synthesis: "Synthesis...",
      reflectiveQuestion: "Question?",
    });
    expect(result.success).toBe(false);
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

  it("includes astrology context when provided", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Career advice?",
      cards: mockCards,
      astroContext: {
        sunSign: "Scorpio",
        moonSign: "Pisces",
        risingSign: "Leo",
        elementBalance: { fire: 2, earth: 1, air: 3, water: 4 },
        currentMoonPhase: "Waxing Crescent",
        currentMoonSign: "Gemini",
      },
    });

    expect(result).toContain("Sun in Scorpio");
    expect(result).toContain("Moon in Pisces");
    expect(result).toContain("Leo Rising");
    expect(result).toContain("Fire 2, Earth 1, Air 3, Water 4");
    expect(result).toContain("Waxing Crescent in Gemini");
    expect(result).toContain("astroResonance");
    expect(result).toContain("astroContext");
  });

  it("omits astrology section when no astroContext provided", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: "Test?",
      cards: mockCards,
    });

    expect(result).not.toContain("Astrological context");
    expect(result).not.toContain("Sun in");
    expect(result).not.toContain("astroResonance");
  });

  it("handles partial astrology context (sun only)", () => {
    const result = buildReadingInterpretationPrompt({
      spreadType: "three_card",
      question: null,
      cards: mockCards,
      astroContext: {
        sunSign: "Aries",
        moonSign: null,
        risingSign: null,
        elementBalance: null,
        currentMoonPhase: "Full Moon",
        currentMoonSign: "Libra",
      },
    });

    expect(result).toContain("Sun in Aries");
    // Birth chart line should not include "Moon in" placement (null moonSign)
    const birthChartLine = result.split("\n").find((l: string) => l.includes("Birth chart:"));
    expect(birthChartLine).not.toContain("Moon in");
    expect(birthChartLine).not.toContain("Rising");
    expect(result).not.toContain("Element balance");
    expect(result).toContain("Full Moon in Libra");
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
