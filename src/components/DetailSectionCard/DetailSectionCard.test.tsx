import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { DetailSectionCard } from "./DetailSectionCard";

describe("DetailSectionCard", () => {
  it("renders heading, description, action and children", () => {
    render(
      <DetailSectionCard
        title="Contacts"
        description="Who to call"
        action={<button type="button">Edit</button>}
      >
        <p>Content</p>
      </DetailSectionCard>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Contacts" })).toBeInTheDocument();
    expect(screen.getByText("Who to call")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("hides the icon from assistive technology", () => {
    render(
      <DetailSectionCard title="T" icon={<svg data-testid="icon" />}>
        x
      </DetailSectionCard>,
    );
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("merges className and forwards rest props", () => {
    render(
      <DetailSectionCard title="T" className="extra" data-testid="card">
        x
      </DetailSectionCard>,
    );
    expect(screen.getByTestId("card")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <DetailSectionCard
        title="Contacts"
        description="d"
        icon={<svg />}
        action={<button type="button">Edit</button>}
      >
        body
      </DetailSectionCard>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
