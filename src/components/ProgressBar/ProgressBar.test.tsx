import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { axe } from "../../test/axe";
import { ProgressBar } from "./ProgressBar";

const css = readFileSync("src/components/ProgressBar/ProgressBar.module.css", "utf8");

describe("ProgressBar", () => {
  it("is a progressbar with its name, range and value", () => {
    render(<ProgressBar value={30} label="Storage used" />);
    const bar = screen.getByRole("progressbar", { name: "Storage used" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "30");
  });

  it("uses a custom max and a spoken value", () => {
    render(<ProgressBar value={12} max={40} label="Steps" valueText="12 of 40 steps" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "40");
    expect(bar).toHaveAttribute("aria-valuetext", "12 of 40 steps");
    expect(bar.firstElementChild).toHaveStyle({ inlineSize: "30%" });
  });

  it("clamps out-of-range and non-finite values", () => {
    const { rerender } = render(<ProgressBar value={250} label="Over" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    rerender(<ProgressBar value={-5} label="Under" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("progressbar").firstElementChild).toBeNull();
    rerender(<ProgressBar value={Number.NaN} label="Bad" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("exposes tone and size and passes className", () => {
    render(<ProgressBar value={1} label="x" tone="danger" size="sm" className="extra" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-tone", "danger");
    expect(bar).toHaveAttribute("data-size", "sm");
    expect(bar).toHaveClass("extra");
  });

  it("has no axe violations", async () => {
    const { container } = render(<ProgressBar value={40} label="Storage used" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws in with motion tokens and stops under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*progress-grow var\(--lufia-motion-duration-medium\) var\(--lufia-motion-easing-out\)/,
    );
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
  });
});
