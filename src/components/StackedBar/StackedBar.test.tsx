import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { StackedBar, type StackedBarSegment } from "./StackedBar";

const css = readFileSync("src/components/StackedBar/StackedBar.module.css", "utf8");

const segments: StackedBarSegment[] = [
  { key: "a", label: "Active", value: 50 },
  { key: "b", label: "Trial", value: 30, tone: "success" },
  { key: "c", label: "Expired", value: 20, tone: "warning" },
];

const parts = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>("[class*=segment]")];

describe("StackedBar", () => {
  it("is a group named by its label, with the bar hidden from assistive technology", () => {
    const { container } = render(<StackedBar segments={segments} label="Accounts by status" />);
    expect(screen.getByRole("group", { name: "Accounts by status" })).toBeInTheDocument();
    expect(container.querySelector("[class*=track]")).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes every segment's label, value and share as text", () => {
    render(<StackedBar segments={segments} label="Mix" />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Active 50 (50%)",
      "Trial 30 (30%)",
      "Expired 20 (20%)",
    ]);
  });

  it("sizes the segments by their share of the total and gives them default tones", () => {
    const { container } = render(<StackedBar segments={segments} label="Mix" />);
    expect(parts(container).map((part) => part.style.inlineSize)).toEqual(["50%", "30%", "20%"]);
    expect(parts(container).map((part) => part.dataset.tone)).toEqual(["accent", "success", "warning"]);
    const { container: plain } = render(
      <StackedBar
        label="Plain"
        segments={[
          { key: "x", label: "X", value: 1 },
          { key: "y", label: "Y", value: 1 },
        ]}
      />,
    );
    expect(parts(plain).map((part) => part.dataset.tone)).toEqual(["accent", "neutral"]);
  });

  it("does not draw zero segments but keeps them in the text", () => {
    const { container } = render(
      <StackedBar
        label="Mix"
        segments={[
          { key: "a", label: "Active", value: 5 },
          { key: "b", label: "Trial", value: 0 },
        ]}
      />,
    );
    expect(parts(container)).toHaveLength(1);
    expect(parts(container)[0]!.style.inlineSize).toBe("100%");
    expect(screen.getByText("Trial").closest("li")).toHaveTextContent("Trial 0 (0%)");
  });

  it("draws an empty track and reads 0% when the total is zero", () => {
    const { container } = render(
      <StackedBar
        label="Mix"
        segments={[
          { key: "a", label: "Active", value: 0 },
          { key: "b", label: "Trial", value: 0 },
        ]}
      />,
    );
    expect(parts(container)).toHaveLength(0);
    expect(container.querySelector("[class*=bar]")).toBeNull();
    expect(container.querySelector("[data-empty]")).not.toBeNull();
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Active 0 (0%)",
      "Trial 0 (0%)",
    ]);
  });

  it("treats negative and non-finite values as zero", () => {
    const { container } = render(
      <StackedBar
        label="Mix"
        segments={[
          { key: "a", label: "A", value: 4 },
          { key: "b", label: "B", value: -3 },
          { key: "c", label: "C", value: Number.NaN },
          { key: "d", label: "D", value: Number.POSITIVE_INFINITY },
        ]}
      />,
    );
    expect(parts(container)).toHaveLength(1);
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "A 4 (100%)",
      "B -3 (0%)",
      "C NaN (0%)",
      "D Infinity (0%)",
    ]);
  });

  it('reads "<1%" for a value whose share rounds to 0, and plain rounded shares otherwise', () => {
    render(
      <StackedBar
        label="Mix"
        segments={[
          { key: "a", label: "Big", value: 1000 },
          { key: "b", label: "Tiny", value: 1 },
          { key: "c", label: "None", value: 0 },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Big 1000 (100%)",
      "Tiny 1 (<1%)",
      "None 0 (0%)",
    ]);
  });

  it("formats values and shares through the props", () => {
    render(
      <StackedBar
        label="Mix"
        segments={segments}
        formatValue={(value) => `${value} units`}
        formatPercent={(percent) => `${percent.toFixed(1)} %`}
      />,
    );
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Active 50 units (50.0 %)");
  });

  it("keeps the text list but marks the legend as not visible when legend is hidden", () => {
    const { container, rerender } = render(<StackedBar segments={segments} label="Mix" legend="hidden" />);
    expect(container.querySelector("ul")).not.toHaveAttribute("data-visible");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    rerender(<StackedBar segments={segments} label="Mix" />);
    expect(container.querySelector("ul")).toHaveAttribute("data-visible");
  });

  it("prints the share only with showPercent, and always keeps it in the text", () => {
    const { container, rerender } = render(<StackedBar segments={segments} label="Mix" />);
    expect(container.querySelector("[class*=percent]")).not.toHaveAttribute("data-visible");
    rerender(<StackedBar segments={segments} label="Mix" showPercent />);
    expect(container.querySelector("[class*=percent]")).toHaveAttribute("data-visible");
  });

  it("passes the pattern, className and rest props to the right elements", () => {
    const { container } = render(
      <StackedBar
        label="Mix"
        className="extra"
        data-testid="s"
        segments={[{ key: "a", label: "A", value: 1, pattern: "hatch" }]}
      />,
    );
    expect(screen.getByTestId("s")).toHaveClass("extra");
    expect(parts(container)[0]).toHaveAttribute("data-pattern", "hatch");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <StackedBar segments={segments} label="Visible legend" showPercent />
        <StackedBar segments={segments} label="Hidden legend" legend="hidden" />
        <StackedBar segments={[{ key: "a", label: "A", value: 0 }]} label="Empty" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws in with motion tokens and stops under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*stacked-grow var\(--lufia-motion-duration-medium\) var\(--lufia-motion-easing-out\)/,
    );
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
  });

  it("keeps segments apart in forced-colors mode, and flips the draw-in for right-to-left", () => {
    const forced = css.match(/@media \(forced-colors: active\) \{([\s\S]*)\n\}/);
    expect(forced?.[1]).toMatch(/\.segment\[data-series="1"\]/);
    expect(forced?.[1]).toMatch(/CanvasText/);
    expect(css).toMatch(/\.segment \{\s*box-sizing: border-box/);
    expect(css).toMatch(/\.bar:dir\(rtl\)\s*\{\s*transform-origin: right center/);
  });

  it("never lets a swatch background rule outrank the pattern rules (the cascade would hide the patterns)", () => {
    // jsdom does not resolve the cascade, so compare selector specificity (ids, classes and attributes, elements) by hand.
    const specificity = (selector: string): [number, number, number] => {
      const bare = selector.replace(/\[[^\]]*\]/g, ".a").replace(/:dir\([^)]*\)/g, ".a");
      const elements = (bare.match(/::[a-z-]+/g) ?? []).length;
      const classes = (bare.match(/\.[\w-]+/g) ?? []).length;
      return [0, classes, elements];
    };
    const compare = (a: number[], b: number[]) => a[1]! - b[1]! || a[2]! - b[2]!;
    const swatchBackgrounds = (source: string) =>
      [...source.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}@]+)\{([^{}]*)\}/g)]
        .filter(([, , body]) => /\bbackground(-image)?:/.test(body!))
        .flatMap(([, selectors]) => selectors!.split(",").map((selector) => selector.trim()))
        .filter((selector) => selector.includes("::before"));
    const forcedStart = css.indexOf("@media (forced-colors: active)");
    const base = swatchBackgrounds(css.slice(0, forcedStart)).filter(
      (selector) => !selector.includes("data-pattern"),
    );
    const hatch = swatchBackgrounds(css.slice(0, forcedStart)).filter((selector) =>
      selector.includes("data-pattern"),
    );
    const forced = swatchBackgrounds(css.slice(forcedStart));
    expect(base.length).toBeGreaterThan(0);
    expect(hatch.length).toBeGreaterThan(0);
    expect(forced.length).toBeGreaterThan(0);
    for (const plain of base) {
      for (const stronger of [...hatch, ...forced.filter((selector) => selector.includes("data-series"))]) {
        expect(compare(specificity(plain), specificity(stronger)), `${plain} vs ${stronger}`).toBeLessThan(0);
      }
    }
  });
});
