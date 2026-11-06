import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title as a level 1 heading inside a header", () => {
    render(<PageHeader title="Overview" />);
    expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeInTheDocument();
  });

  it("uses the requested heading level", () => {
    render(<PageHeader title="Overview" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("renders eyebrow, description and actions only when given", () => {
    const { rerender } = render(<PageHeader title="T" />);
    expect(screen.queryByText("Section")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(
      <PageHeader
        title="T"
        eyebrow="Section"
        description="Some context"
        actions={<button type="button">New</button>}
      />,
    );
    expect(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.getByText("Some context")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });

  it("passes className and rest props to the root", () => {
    render(<PageHeader title="T" className="extra" data-testid="h" />);
    expect(screen.getByTestId("h")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <PageHeader title="T" eyebrow="E" description="D" actions={<button type="button">Act</button>} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
