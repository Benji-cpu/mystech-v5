import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReadingColumn, type PartialReading } from "./reading-column";

const OBJECT: PartialReading = {
  cardSections: [
    { positionName: "Past", text: "In the past I see you weaving clear understanding." },
    { positionName: "Present", text: "Now the Unyielding Vow rises." },
  ],
  synthesis: "You have woven the threads of conscious connection.",
  reflectiveQuestion: "What unwritten truth is ready to be spoken?",
};

const base = {
  isStreaming: false,
  presentingCardIndex: 0,
  isCurrentSectionComplete: true,
};

describe("ReadingColumn error handling", () => {
  it("takes over the column only when the break left nothing to read", () => {
    render(<ReadingColumn {...base} object={undefined} error={new Error("stream died")} />);

    expect(screen.getByText("The thread broke")).toBeInTheDocument();
    expect(
      screen.getByText("Something went wrong generating your interpretation.")
    ).toBeInTheDocument();
  });

  it("keeps the text that already streamed when the break comes mid-reading", () => {
    render(
      <ReadingColumn
        {...base}
        object={OBJECT}
        error={new Error("stream died")}
        onRetry={() => {}}
      />
    );

    // The words Lyra managed to speak survive — this is the regression that
    // cost a whole reading: the error card used to replace them.
    expect(
      screen.getByText(/In the past I see you weaving clear understanding/)
    ).toBeInTheDocument();
    expect(screen.getByText("The thread broke here.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pick it back up/i })).toBeInTheDocument();
  });

  it("offers the retry from the closing section too", () => {
    render(<ReadingColumn {...base} object={OBJECT} error={new Error("x")} isClosing />);

    expect(
      screen.getByText(/You have woven the threads of conscious connection/)
    ).toBeInTheDocument();
    expect(screen.getByText("The thread broke here.")).toBeInTheDocument();
  });

  it("fires onRetry rather than unmounting the reading", () => {
    const onRetry = vi.fn();
    render(<ReadingColumn {...base} object={OBJECT} error={new Error("x")} onRetry={onRetry} />);

    fireEvent.click(screen.getByRole("button", { name: /pick it back up/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders normally when there is no error", () => {
    render(<ReadingColumn {...base} object={OBJECT} error={undefined} />);

    expect(screen.getByText(/In the past I see you weaving/)).toBeInTheDocument();
    expect(screen.queryByText("The thread broke here.")).not.toBeInTheDocument();
    expect(screen.queryByText("The thread broke")).not.toBeInTheDocument();
  });
});
