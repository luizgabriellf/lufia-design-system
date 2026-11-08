import { render } from "@testing-library/react";
import { axe } from "../../test/axe";
import { STATUS_TONES, StatusIcon } from "./StatusIcon";

const shapeOf = (root: Element) => root.querySelector("svg")?.innerHTML ?? "";

describe("StatusIcon", () => {
  it("draws a distinct shape for every tone in every variant, so tones differ without colour", () => {
    for (const variant of ["bare", "ring", "mark"] as const) {
      const { container, unmount } = render(
        <>
          {STATUS_TONES.map((tone) => (
            <StatusIcon key={tone} tone={tone} variant={variant} />
          ))}
        </>,
      );
      const shapes = Array.from(container.children).map(shapeOf);
      expect(new Set(shapes).size, variant).toBe(STATUS_TONES.length);
      unmount();
    }
  });

  it("is decorative without a label and a named image with one", () => {
    const { container, getByRole } = render(
      <>
        <StatusIcon tone="warning" />
        <StatusIcon tone="danger" label="Overdue" />
      </>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    const named = getByRole("img", { name: "Overdue" });
    expect(named).not.toHaveAttribute("aria-hidden");
    expect(named.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes tone, variant and size as data attributes and keeps className and rest props", () => {
    const { container } = render(
      <StatusIcon tone="info" variant="ring" size="lg" className="mine" data-testid="status" />,
    );
    const root = container.firstElementChild;
    expect(root).toHaveAttribute("data-tone", "info");
    expect(root).toHaveAttribute("data-variant", "ring");
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveClass("mine");
    expect(root).toHaveAttribute("data-testid", "status");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        {STATUS_TONES.map((tone) => (
          <span key={tone}>
            <StatusIcon tone={tone} />
            <StatusIcon tone={tone} variant="ring" label={tone} />
            <StatusIcon tone={tone} variant="mark" />
          </span>
        ))}
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
