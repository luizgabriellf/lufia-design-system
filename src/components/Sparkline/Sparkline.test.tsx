import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { Sparkline } from "./Sparkline";

const css = readFileSync("src/components/Sparkline/Sparkline.module.css", "utf8");

describe("Sparkline", () => {
  it("is an image named by its label", () => {
    render(<Sparkline values={[3, 5, 4]} label="Deliveries per week: 3, 5, 4" />);
    expect(screen.getByRole("img", { name: "Deliveries per week: 3, 5, 4" })).toBeInTheDocument();
  });

  it("is hidden from assistive technology when the label is null", () => {
    const { container } = render(<Sparkline values={[3, 5, 4]} label={null} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("draws one column per value, a thin one for zero, with a capped stagger index", () => {
    const { container } = render(<Sparkline values={[0, 1, 2, 3, 4, 5, 6, 7, 8]} label="Series" />);
    const rects = container.querySelectorAll("rect");
    expect(rects).toHaveLength(9);
    expect(rects[0]!.getAttribute("class")).toMatch(/zero/);
    expect(rects[0]!.getAttribute("height")).toBe("1.5");
    expect(rects[8]!.style.getPropertyValue("--chart-index")).toBe("6");
    expect(Number(rects[8]!.getAttribute("height"))).toBe(24);
  });

  it("draws a line variant as one path, flat in the middle for a constant series", () => {
    const { container } = render(<Sparkline values={[4, 4, 4]} variant="line" label="Flat" />);
    expect(container.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelector("path")!.getAttribute("d")).toBe("M0 12 L60 12 L120 12");
  });

  it("handles an empty series and non-finite values", () => {
    const { container, rerender } = render(<Sparkline values={[]} label="Nothing" />);
    expect(container.querySelectorAll("rect, path")).toHaveLength(0);
    rerender(<Sparkline values={[Number.NaN, 2]} label="Series" />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(container.innerHTML).not.toMatch(/NaN/);
  });

  it("exposes the tone and passes className and rest props", () => {
    render(<Sparkline values={[1]} label="One" tone="danger" className="extra" data-testid="s" />);
    expect(screen.getByTestId("s")).toHaveAttribute("data-tone", "danger");
    expect(screen.getByTestId("s")).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <Sparkline values={[1, 2, 3]} label="Named" />
        <Sparkline values={[1, 2, 3]} variant="line" label={null} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws in with motion tokens, on compositor properties only, and stops under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*sparkline-grow var\(--lufia-motion-duration-medium\) var\(--lufia-motion-easing-out\)/,
    );
    expect(css).toMatch(/@keyframes sparkline-grow \{\s*from \{\s*transform: scaleY\(0\)/);
    expect(css).toMatch(/@keyframes sparkline-draw \{\s*from \{\s*stroke-dashoffset: 1/);
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/\.column[\s\S]*\.line[\s\S]*animation:\s*none/);
  });
});
