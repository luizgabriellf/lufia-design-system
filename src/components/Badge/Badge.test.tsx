import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Badge, StatusBadge } from "./Badge";

describe("Badge", () => {
  it("always renders its text and defaults to the neutral tone", () => {
    render(<Badge>Draft</Badge>);
    expect(screen.getByText("Draft")).toHaveAttribute("data-tone", "neutral");
  });

  it.each(["neutral", "info", "success", "warning", "danger", "ai"] as const)(
    "exposes the %s tone",
    (tone) => {
      render(<Badge tone={tone}>Label</Badge>);
      expect(screen.getByText("Label")).toHaveAttribute("data-tone", tone);
    },
  );

  it("draws no dot unless asked, and hides it from assistive technology", () => {
    const { rerender, container } = render(<Badge>Draft</Badge>);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    rerender(<Badge dot>Draft</Badge>);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText("Draft")).toHaveTextContent("Draft");
  });

  it("passes className and rest props to the root", () => {
    render(
      <Badge className="extra" data-testid="b" title="Why">
        X
      </Badge>,
    );
    expect(screen.getByTestId("b")).toHaveClass("extra");
    expect(screen.getByTestId("b")).toHaveAttribute("title", "Why");
  });

  it("StatusBadge shows a dot by default and lets it be turned off", () => {
    const { container, rerender } = render(<StatusBadge tone="success">Paid</StatusBadge>);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    rerender(
      <StatusBadge tone="success" dot={false}>
        Paid
      </StatusBadge>,
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("has no axe violations for every tone", async () => {
    const { container } = render(
      <div>
        {(["neutral", "info", "success", "warning", "danger", "ai"] as const).map((tone) => (
          <Badge key={tone} tone={tone} dot>
            {tone}
          </Badge>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
