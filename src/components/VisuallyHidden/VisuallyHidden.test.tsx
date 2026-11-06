import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { VisuallyHidden } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("keeps its text in the accessibility tree", () => {
    render(
      <button type="button">
        <span aria-hidden="true">x</span>
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeInTheDocument();
  });

  it("passes className and rest props to the root", () => {
    render(
      <VisuallyHidden className="extra" data-testid="v">
        text
      </VisuallyHidden>,
    );
    expect(screen.getByTestId("v")).toHaveClass("root", "extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <button type="button">
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
