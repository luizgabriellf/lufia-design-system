import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("is a status that says the label when it has one", () => {
    render(<Spinner label="Loading results" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading results");
  });

  it("is decorative without a label", () => {
    const { container } = render(<Spinner />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).not.toHaveAttribute("role");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("sets the size and passes className and rest props to the root", () => {
    const { container } = render(<Spinner size="lg" className="extra" data-testid="s" />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass("extra");
    expect(root).toHaveAttribute("data-testid", "s");
  });

  it("defaults to the medium size", () => {
    const { container } = render(<Spinner />);
    expect(container.firstElementChild).toHaveAttribute("data-size", "md");
  });

  it("has no axe violations in either mode", async () => {
    const { container } = render(
      <div>
        <Spinner label="Loading" />
        <Spinner />
        <button type="button" aria-busy="true">
          Saving <Spinner size="sm" />
        </button>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
