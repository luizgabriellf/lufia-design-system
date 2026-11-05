import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { ChangeHighlight } from "./ChangeHighlight";

describe("ChangeHighlight", () => {
  it("does not flash on mount", () => {
    render(<ChangeHighlight value={1}>one</ChangeHighlight>);
    expect(screen.getByText("one")).not.toHaveAttribute("data-flash");
  });

  it("flashes when the value changes and alternates to restart on consecutive changes", () => {
    const { rerender } = render(<ChangeHighlight value={1}>x</ChangeHighlight>);
    rerender(<ChangeHighlight value={2}>x</ChangeHighlight>);
    expect(screen.getByText("x")).toHaveAttribute("data-flash", "a");
    rerender(<ChangeHighlight value={3}>x</ChangeHighlight>);
    expect(screen.getByText("x")).toHaveAttribute("data-flash", "b");
  });

  it("does not flash again when re-rendered with the same value", () => {
    const { rerender } = render(<ChangeHighlight value="a">x</ChangeHighlight>);
    rerender(<ChangeHighlight value="a">y</ChangeHighlight>);
    expect(screen.getByText("y")).not.toHaveAttribute("data-flash");
  });

  it("keeps its children mounted across a change", () => {
    const { rerender } = render(
      <ChangeHighlight value={1}>
        <input aria-label="field" />
      </ChangeHighlight>,
    );
    const input = screen.getByLabelText("field");
    rerender(
      <ChangeHighlight value={2}>
        <input aria-label="field" />
      </ChangeHighlight>,
    );
    expect(screen.getByLabelText("field")).toBe(input);
  });

  it("passes className and rest props", () => {
    render(
      <ChangeHighlight value={1} className="x" data-testid="h">
        x
      </ChangeHighlight>,
    );
    expect(screen.getByTestId("h")).toHaveClass("x");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <p>
        <ChangeHighlight value={1}>Saved</ChangeHighlight>
      </p>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
