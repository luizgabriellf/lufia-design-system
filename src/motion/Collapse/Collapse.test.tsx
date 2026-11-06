import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Collapse } from "./Collapse";

describe("Collapse", () => {
  it("keeps content in the DOM and exposes the state", () => {
    const { rerender } = render(
      <Collapse open={false} data-testid="c">
        <button type="button">Inside</button>
      </Collapse>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("data-state", "closed");
    expect(screen.getByText("Inside")).toBeInTheDocument();
    rerender(
      <Collapse open data-testid="c">
        <button type="button">Inside</button>
      </Collapse>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("data-state", "open");
  });

  it("makes closed content inert so it leaves the tab order and the accessibility tree", () => {
    const { rerender } = render(
      <Collapse open={false} data-testid="c">
        <button type="button">Inside</button>
      </Collapse>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("inert");
    rerender(
      <Collapse open data-testid="c">
        <button type="button">Inside</button>
      </Collapse>,
    );
    expect(screen.getByTestId("c")).not.toHaveAttribute("inert");
  });

  it("passes id, className and rest props to the root", () => {
    render(
      <Collapse open id="panel" className="x" data-testid="c">
        c
      </Collapse>,
    );
    expect(screen.getByTestId("c")).toHaveAttribute("id", "panel");
    expect(screen.getByTestId("c")).toHaveClass("x");
  });

  it("has no axe violations with a wired trigger", async () => {
    const { container } = render(
      <>
        <button type="button" aria-expanded="true" aria-controls="p">
          Details
        </button>
        <Collapse open id="p">
          <p>Body</p>
        </Collapse>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
