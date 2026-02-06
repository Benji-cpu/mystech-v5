import { describe, it, expect } from "vitest";
import { generatedCardSchema, generatedDeckSchema } from "./schemas";

describe("generatedCardSchema", () => {
  const validCard = {
    cardNumber: 1,
    title: "The Wanderer",
    meaning: "A journey of self-discovery",
    guidance: "Trust the path ahead",
    imagePrompt: "A lone figure walking through a misty forest at dawn",
  };

  it("accepts a valid card", () => {
    const result = generatedCardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title, ...card } = validCard;
    const result = generatedCardSchema.safeParse(card);
    expect(result.success).toBe(false);
  });

  it("rejects missing meaning", () => {
    const { meaning, ...card } = validCard;
    const result = generatedCardSchema.safeParse(card);
    expect(result.success).toBe(false);
  });

  it("rejects missing guidance", () => {
    const { guidance, ...card } = validCard;
    const result = generatedCardSchema.safeParse(card);
    expect(result.success).toBe(false);
  });

  it("rejects missing imagePrompt", () => {
    const { imagePrompt, ...card } = validCard;
    const result = generatedCardSchema.safeParse(card);
    expect(result.success).toBe(false);
  });

  it("rejects missing cardNumber", () => {
    const { cardNumber, ...card } = validCard;
    const result = generatedCardSchema.safeParse(card);
    expect(result.success).toBe(false);
  });

  it("rejects non-number cardNumber", () => {
    const result = generatedCardSchema.safeParse({
      ...validCard,
      cardNumber: "one",
    });
    expect(result.success).toBe(false);
  });
});

describe("generatedDeckSchema", () => {
  const validDeck = {
    cards: [
      {
        cardNumber: 1,
        title: "The Wanderer",
        meaning: "A journey of self-discovery",
        guidance: "Trust the path ahead",
        imagePrompt: "A lone figure walking through a misty forest",
      },
      {
        cardNumber: 2,
        title: "The Guardian",
        meaning: "Protection and boundaries",
        guidance: "Stand firm in your truth",
        imagePrompt: "A towering sentinel of light at the gate",
      },
    ],
  };

  it("accepts a valid deck with multiple cards", () => {
    const result = generatedDeckSchema.safeParse(validDeck);
    expect(result.success).toBe(true);
  });

  it("accepts an empty cards array", () => {
    const result = generatedDeckSchema.safeParse({ cards: [] });
    expect(result.success).toBe(true);
  });

  it("rejects missing cards field", () => {
    const result = generatedDeckSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects if a card is invalid", () => {
    const result = generatedDeckSchema.safeParse({
      cards: [{ cardNumber: 1, title: "Incomplete" }],
    });
    expect(result.success).toBe(false);
  });
});

// Journey mode schemas
import { anchorSchema, extractedAnchorsSchema, cardUpdateSchema } from "./schemas";

describe("anchorSchema", () => {
  const validAnchor = {
    theme: "transitions",
    emotion: "bittersweet",
    symbol: "bridge",
  };

  it("accepts a valid anchor", () => {
    const result = anchorSchema.safeParse(validAnchor);
    expect(result.success).toBe(true);
  });

  it("rejects missing theme", () => {
    const { theme, ...anchor } = validAnchor;
    const result = anchorSchema.safeParse(anchor);
    expect(result.success).toBe(false);
  });

  it("rejects missing emotion", () => {
    const { emotion, ...anchor } = validAnchor;
    const result = anchorSchema.safeParse(anchor);
    expect(result.success).toBe(false);
  });

  it("rejects missing symbol", () => {
    const { symbol, ...anchor } = validAnchor;
    const result = anchorSchema.safeParse(anchor);
    expect(result.success).toBe(false);
  });
});

describe("extractedAnchorsSchema", () => {
  const validExtracted = {
    anchors: [
      { theme: "transitions", emotion: "bittersweet", symbol: "bridge" },
      { theme: "growth", emotion: "hope", symbol: "seedling" },
    ],
    summary: "A discussion about life transitions and personal growth",
    readinessAssessment: "Rich material has emerged from our exploration",
  };

  it("accepts a valid extracted anchors object", () => {
    const result = extractedAnchorsSchema.safeParse(validExtracted);
    expect(result.success).toBe(true);
  });

  it("accepts an empty anchors array", () => {
    const result = extractedAnchorsSchema.safeParse({
      ...validExtracted,
      anchors: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing summary", () => {
    const { summary, ...obj } = validExtracted;
    const result = extractedAnchorsSchema.safeParse(obj);
    expect(result.success).toBe(false);
  });

  it("rejects missing readinessAssessment", () => {
    const { readinessAssessment, ...obj } = validExtracted;
    const result = extractedAnchorsSchema.safeParse(obj);
    expect(result.success).toBe(false);
  });
});

describe("cardUpdateSchema", () => {
  const validUpdate = {
    cardNumber: 1,
    title: "The Wanderer",
    meaning: "A journey of self-discovery",
    guidance: "Trust the path ahead",
    imagePrompt: "A lone figure walking through a misty forest at dawn",
  };

  it("accepts a valid card update", () => {
    const result = cardUpdateSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it("rejects missing cardNumber", () => {
    const { cardNumber, ...update } = validUpdate;
    const result = cardUpdateSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it("rejects missing title", () => {
    const { title, ...update } = validUpdate;
    const result = cardUpdateSchema.safeParse(update);
    expect(result.success).toBe(false);
  });
});
