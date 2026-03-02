import { describe, it, expect } from "vitest";
import {
  readingFlowReducer,
  initialReadingFlowState,
  isSetupPhase,
  isCardPhase,
  isPresentingPhase,
} from "./reading-flow-state";
import type { ReadingFlowState } from "./reading-flow-state";
import type { Card } from "@/types";

const mockCard: Card = {
  id: "c1",
  deckId: "d1",
  cardNumber: 1,
  title: "The River",
  meaning: "Change",
  guidance: "Let go",
  imageUrl: null,
  imagePrompt: null,
  imageStatus: "completed",
  createdAt: new Date(),
};

describe("readingFlowReducer", () => {
  describe("SELECT_DECK", () => {
    it("sets selectedDeckId and selectedDeckIds", () => {
      const state = readingFlowReducer(initialReadingFlowState, {
        type: "SELECT_DECK",
        deckId: "d1",
      });
      expect(state.selectedDeckId).toBe("d1");
      expect(state.selectedDeckIds).toEqual(["d1"]);
      expect(state.error).toBeNull();
    });
  });

  describe("TOGGLE_DECK", () => {
    it("adds a deck to selectedDeckIds", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        selectedDeckIds: ["d1"],
        selectedDeckId: "d1",
      };
      const state = readingFlowReducer(prev, {
        type: "TOGGLE_DECK",
        deckId: "d2",
      });
      expect(state.selectedDeckIds).toEqual(["d1", "d2"]);
      expect(state.selectedDeckId).toBe("d1");
    });

    it("removes a deck from selectedDeckIds", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        selectedDeckIds: ["d1", "d2"],
        selectedDeckId: "d1",
      };
      const state = readingFlowReducer(prev, {
        type: "TOGGLE_DECK",
        deckId: "d1",
      });
      expect(state.selectedDeckIds).toEqual(["d2"]);
      expect(state.selectedDeckId).toBe("d2");
    });

    it("prevents removing the last deck", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        selectedDeckIds: ["d1"],
        selectedDeckId: "d1",
      };
      const state = readingFlowReducer(prev, {
        type: "TOGGLE_DECK",
        deckId: "d1",
      });
      // State should be unchanged
      expect(state).toBe(prev);
      expect(state.selectedDeckIds).toEqual(["d1"]);
    });

    it("clears error on toggle", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        selectedDeckIds: ["d1"],
        selectedDeckId: "d1",
        error: "some error",
      };
      const state = readingFlowReducer(prev, {
        type: "TOGGLE_DECK",
        deckId: "d2",
      });
      expect(state.error).toBeNull();
    });
  });

  describe("RESTORE_DEFAULTS", () => {
    it("restores deck IDs and spread type", () => {
      const state = readingFlowReducer(initialReadingFlowState, {
        type: "RESTORE_DEFAULTS",
        deckIds: ["d1", "d2"],
        spread: "three_card",
      });
      expect(state.selectedDeckIds).toEqual(["d1", "d2"]);
      expect(state.selectedDeckId).toBe("d1");
      expect(state.selectedSpread).toBe("three_card");
    });

    it("keeps existing state when deckIds is empty", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        selectedDeckIds: ["d1"],
        selectedDeckId: "d1",
      };
      const state = readingFlowReducer(prev, {
        type: "RESTORE_DEFAULTS",
        deckIds: [],
        spread: "single",
      });
      expect(state.selectedDeckIds).toEqual(["d1"]);
      expect(state.selectedSpread).toBe("single");
    });

    it("keeps existing spread when spread is null", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        selectedSpread: "five_card",
      };
      const state = readingFlowReducer(prev, {
        type: "RESTORE_DEFAULTS",
        deckIds: ["d1"],
        spread: null,
      });
      expect(state.selectedSpread).toBe("five_card");
      expect(state.selectedDeckIds).toEqual(["d1"]);
    });
  });

  describe("Phase transitions", () => {
    it("SELECT_SPREAD sets spread", () => {
      const state = readingFlowReducer(initialReadingFlowState, {
        type: "SELECT_SPREAD",
        spread: "three_card",
      });
      expect(state.selectedSpread).toBe("three_card");
    });

    it("SET_QUESTION sets question", () => {
      const state = readingFlowReducer(initialReadingFlowState, {
        type: "SET_QUESTION",
        question: "What should I focus on?",
      });
      expect(state.question).toBe("What should I focus on?");
    });

    it("BEGIN_READING transitions to creating", () => {
      const state = readingFlowReducer(initialReadingFlowState, {
        type: "BEGIN_READING",
      });
      expect(state.phase).toBe("creating");
      expect(state.error).toBeNull();
    });

    it("CREATION_SUCCESS transitions to drawing with cards", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "creating",
      };
      const cards = [{ card: mockCard, positionName: "Past" }];
      const state = readingFlowReducer(prev, {
        type: "CREATION_SUCCESS",
        readingId: "r1",
        cards,
      });
      expect(state.phase).toBe("drawing");
      expect(state.readingId).toBe("r1");
      expect(state.drawnCards).toEqual(cards);
    });

    it("CREATION_ERROR transitions back to setup", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "creating",
      };
      const state = readingFlowReducer(prev, {
        type: "CREATION_ERROR",
        error: "Something went wrong",
      });
      expect(state.phase).toBe("setup");
      expect(state.error).toBe("Something went wrong");
    });

    it("START_PRESENTING transitions to presenting with index 0", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "drawing",
        drawnCards: [
          { card: mockCard, positionName: "Past" },
          { card: { ...mockCard, id: "c2" }, positionName: "Present" },
        ],
      };
      const state = readingFlowReducer(prev, { type: "START_PRESENTING" });
      expect(state.phase).toBe("presenting");
      expect(state.presentingCardIndex).toBe(0);
      expect(state.activeCardIndex).toBe(0);
      expect(state.showSynthesis).toBe(false);
    });

    it("ADVANCE_CARD increments presentingCardIndex", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "presenting",
        presentingCardIndex: 0,
        activeCardIndex: 0,
        drawnCards: [
          { card: mockCard, positionName: "Past" },
          { card: { ...mockCard, id: "c2" }, positionName: "Present" },
          { card: { ...mockCard, id: "c3" }, positionName: "Future" },
        ],
      };
      const state = readingFlowReducer(prev, { type: "ADVANCE_CARD" });
      expect(state.presentingCardIndex).toBe(1);
      expect(state.activeCardIndex).toBe(1);
    });

    it("ADVANCE_CARD does not exceed last card index", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "presenting",
        presentingCardIndex: 1,
        activeCardIndex: 1,
        drawnCards: [
          { card: mockCard, positionName: "Past" },
          { card: { ...mockCard, id: "c2" }, positionName: "Present" },
        ],
      };
      const state = readingFlowReducer(prev, { type: "ADVANCE_CARD" });
      expect(state).toBe(prev); // no change
    });

    it("SHOW_SYNTHESIS sets showSynthesis and clears activeCardIndex", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "presenting",
        presentingCardIndex: 2,
        activeCardIndex: 2,
      };
      const state = readingFlowReducer(prev, { type: "SHOW_SYNTHESIS" });
      expect(state.showSynthesis).toBe(true);
      expect(state.activeCardIndex).toBeNull();
    });

    it("COMPLETE transitions to complete and preserves activeCardIndex", () => {
      const prev: ReadingFlowState = {
        ...initialReadingFlowState,
        phase: "presenting",
        activeCardIndex: 2,
      };
      const state = readingFlowReducer(prev, { type: "COMPLETE" });
      expect(state.phase).toBe("complete");
      expect(state.activeCardIndex).toBe(2);
    });
  });

  describe("RESET", () => {
    it("resets to initial state", () => {
      const prev: ReadingFlowState = {
        phase: "complete",
        selectedDeckId: "d1",
        selectedDeckIds: ["d1", "d2"],
        selectedSpread: "three_card",
        question: "test?",
        readingId: "r1",
        drawnCards: [{ card: mockCard, positionName: "Past" }],
        error: null,
        activeCardIndex: 2,
        presentingCardIndex: 2,
        showSynthesis: true,
        chronicleCardId: null,
        journeyPathId: null,
        journeyRetreatId: null,
        journeyWaypointId: null,
        journeySuggestedIntention: null,
      };
      const state = readingFlowReducer(prev, { type: "RESET" });
      expect(state).toEqual(initialReadingFlowState);
    });
  });
});

describe("isSetupPhase", () => {
  it("returns true for setup", () => {
    expect(isSetupPhase("setup")).toBe(true);
  });

  it("returns false for other phases", () => {
    expect(isSetupPhase("creating")).toBe(false);
    expect(isSetupPhase("drawing")).toBe(false);
    expect(isSetupPhase("presenting")).toBe(false);
  });
});

describe("isCardPhase", () => {
  it("returns true for card phases", () => {
    expect(isCardPhase("drawing")).toBe(true);
    expect(isCardPhase("presenting")).toBe(true);
    expect(isCardPhase("complete")).toBe(true);
  });

  it("returns false for non-card phases", () => {
    expect(isCardPhase("setup")).toBe(false);
    expect(isCardPhase("creating")).toBe(false);
  });
});

describe("isPresentingPhase", () => {
  it("returns true for presenting and complete", () => {
    expect(isPresentingPhase("presenting")).toBe(true);
    expect(isPresentingPhase("complete")).toBe(true);
  });

  it("returns false for other phases", () => {
    expect(isPresentingPhase("setup")).toBe(false);
    expect(isPresentingPhase("creating")).toBe(false);
    expect(isPresentingPhase("drawing")).toBe(false);
  });
});
