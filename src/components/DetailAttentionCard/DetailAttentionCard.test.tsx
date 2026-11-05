import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { DetailAttentionCard } from "./DetailAttentionCard";

describe("DetailAttentionCard", () => {
  it("renders title, description, meta and action", () => {
    render(
      <DetailAttentionCard
        tone="warn"
        title="Review due"
        description="Two items need review."
        meta="Updated today"
        action={<button type="button">Open</button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Review due" })).toBeInTheDocument();
    expect(screen.getByText("Two items need review.")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("exposes the tone as data-tone and names it for assistive technology when toneLabel is set", () => {
    render(<DetailAttentionCard tone="danger" title="Overdue item" toneLabel="Overdue" data-testid="card" />);
    expect(screen.getByTestId("card")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByRole("heading", { name: /Overdue:\s*Overdue item/ })).toBeInTheDocument();
  });

  it("omits optional regions when not provided", () => {
    const { container } = render(<DetailAttentionCard tone="ok" title="All good" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("has no axe violations in any tone", async () => {
    const { container } = render(
      <div>
        {(["ok", "warn", "danger", "critical", "neutral"] as const).map((tone) => (
          <DetailAttentionCard
            key={tone}
            tone={tone}
            title={`Tone ${tone}`}
            toneLabel={tone}
            description="Body"
          />
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
