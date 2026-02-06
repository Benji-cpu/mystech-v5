import { describe, it, expect } from "vitest";
import {
  JOURNEY_CONVERSATION_SYSTEM_PROMPT,
  JOURNEY_OPENING_MESSAGE,
  buildAnchorExtractionPrompt,
  buildReadinessFromAnchors,
} from "./conversation";

describe("JOURNEY_CONVERSATION_SYSTEM_PROMPT", () => {
  it("contains mystic personality keywords", () => {
    expect(JOURNEY_CONVERSATION_SYSTEM_PROMPT).toContain("wise mystic guide");
    expect(JOURNEY_CONVERSATION_SYSTEM_PROMPT).toContain(
      "threads of your story"
    );
  });

  it("includes conversation guidelines", () => {
    expect(JOURNEY_CONVERSATION_SYSTEM_PROMPT).toContain("Ask one or two questions");
  });
});

describe("JOURNEY_OPENING_MESSAGE", () => {
  it("contains the opening question", () => {
    expect(JOURNEY_OPENING_MESSAGE).toContain("what draws you to this theme");
  });

  it("welcomes the seeker", () => {
    expect(JOURNEY_OPENING_MESSAGE).toContain("Welcome, seeker");
  });
});

describe("buildAnchorExtractionPrompt", () => {
  it("includes conversation history in output", () => {
    const history = "USER: I love autumn\n\nASSISTANT: Tell me more";
    const result = buildAnchorExtractionPrompt(history);

    expect(result).toContain(history);
  });

  it("contains extraction instructions", () => {
    const result = buildAnchorExtractionPrompt("some conversation");

    expect(result).toContain("ANCHORS");
    expect(result).toContain("SUMMARY");
    expect(result).toContain("READINESS");
  });

  it("asks for emotional threads and symbolic elements", () => {
    const result = buildAnchorExtractionPrompt("some conversation");

    expect(result).toContain("emotional threads");
    expect(result).toContain("symbolic");
  });
});

describe("buildReadinessFromAnchors", () => {
  it("returns beginning message when ratio is 0", () => {
    const result = buildReadinessFromAnchors(0, 10);
    expect(result).toContain("begin exploring");
  });

  it("returns early stage message when ratio < 0.3", () => {
    const result = buildReadinessFromAnchors(2, 10);
    expect(result).toContain("beginning to uncover");
  });

  it("returns emerging message when ratio < 0.5", () => {
    const result = buildReadinessFromAnchors(4, 10);
    expect(result).toContain("themes are starting to emerge");
  });

  it("returns good material message when ratio < 0.7", () => {
    const result = buildReadinessFromAnchors(6, 10);
    expect(result).toContain("good material");
  });

  it("returns nearly ready message when ratio < 0.9", () => {
    const result = buildReadinessFromAnchors(8, 10);
    expect(result).toContain("nearly ready");
  });

  it("returns ready message when ratio >= 0.9", () => {
    const result = buildReadinessFromAnchors(9, 10);
    expect(result).toContain("ready to be created");
  });
});
