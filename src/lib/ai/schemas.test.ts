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
