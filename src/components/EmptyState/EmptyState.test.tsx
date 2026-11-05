import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("is a status region with title, body and action", () => {
    render(
      <EmptyState
        title="Nothing here"
        body="Add your first item."
        action={<button type="button">Add</button>}
      />,
    );
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Nothing here");
    expect(region).toHaveTextContent("Add your first item.");
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("marks the icon decorative", () => {
    render(<EmptyState title="t" icon={<span data-testid="i">★</span>} />);
    expect(screen.getByTestId("i").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("omits optional parts", () => {
    const { container } = render(<EmptyState title="Only title" />);
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <EmptyState title="t" body="b" icon="★" action={<button type="button">Go</button>} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
