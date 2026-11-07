import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders the title as a level 2 heading by default, with description and actions", () => {
    render(<SectionHeader title="Recent" description="Last five" actions={<a href="/all">View all</a>} />);
    expect(screen.getByRole("heading", { level: 2, name: "Recent" })).toBeInTheDocument();
    expect(screen.getByText("Last five")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all" })).toBeInTheDocument();
  });

  it.each([2, 3, 4, 5, 6] as const)("renders a level %i heading", (level) => {
    render(<SectionHeader title="Recent" headingLevel={level} />);
    expect(screen.getByRole("heading", { level })).toBeInTheDocument();
  });

  it("renders no description or actions wrapper when they are omitted", () => {
    const { container } = render(<SectionHeader title="Recent" />);
    expect(container.querySelector("p")).toBeNull();
    expect(container.firstElementChild!.children).toHaveLength(1);
  });

  it("gives the heading an id for aria-labelledby", () => {
    render(
      <section aria-labelledby="recent-title">
        <SectionHeader title="Recent" titleId="recent-title" />
      </section>,
    );
    expect(screen.getByRole("region", { name: "Recent" })).toBeInTheDocument();
  });

  it("passes className and rest props to the root", () => {
    render(<SectionHeader title="Recent" className="extra" data-testid="h" />);
    expect(screen.getByTestId("h")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SectionHeader title="Recent" description="Last five" actions={<button type="button">Add</button>} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
