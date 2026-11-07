import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { BarList, type BarListRow } from "./BarList";

const css = readFileSync("src/components/BarList/BarList.module.css", "utf8");

const rows: BarListRow[] = [
  { key: "a", name: "North", note: "12 sites", value: "1,200", amount: 1200 },
  { key: "b", name: "South", value: "600", detail: "half", amount: 600, tone: "warning" },
  { key: "c", name: "East", value: "0", amount: 0 },
];

describe("BarList", () => {
  it("is a figure named by its title, with the numbers as text list items", () => {
    render(
      <BarList
        title="Items by region"
        summary="North leads."
        rows={rows}
        total={{ label: "Total", value: "1,800" }}
      />,
    );
    expect(screen.getByRole("figure", { name: "Items by region" })).toBeInTheDocument();
    expect(screen.getByText("North leads.")).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(within(items[0]!).getByText("1,200")).toBeInTheDocument();
    expect(within(items[0]!).getByText("12 sites")).toBeInTheDocument();
    expect(within(items[1]!).getByText("half")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("1,800")).toBeInTheDocument();
  });

  it("draws every bar on one scale: the largest fills the track", () => {
    const { container } = render(<BarList title="Items" rows={rows} />);
    const fills = container.querySelectorAll<HTMLElement>("[data-tone]");
    expect(fills).toHaveLength(2);
    expect(fills[0]!.style.inlineSize).toBe("100%");
    expect(fills[1]!.style.inlineSize).toBe("50%");
    expect(fills[1]).toHaveAttribute("data-tone", "warning");
  });

  it("hides the bars from assistive technology", () => {
    const { container } = render(<BarList title="Items" rows={rows} />);
    for (const track of container.querySelectorAll("[aria-hidden]")) {
      expect(track.getAttribute("class")).toMatch(/track/);
    }
  });

  it("renders nothing without rows, and copes with all-zero amounts", () => {
    const { container, rerender } = render(<BarList title="Items" rows={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<BarList title="Items" rows={[{ key: "z", name: "Zero", value: "0", amount: 0 }]} />);
    expect(container.querySelectorAll("[data-tone]")).toHaveLength(0);
  });

  it("treats non-finite amounts as 0", () => {
    const { container } = render(
      <BarList
        title="Items"
        rows={[
          { key: "a", name: "A", value: "10", amount: 10 },
          { key: "b", name: "B", value: "?", amount: Number.NaN },
          { key: "c", name: "C", value: "inf", amount: Number.POSITIVE_INFINITY },
        ]}
      />,
    );
    const fills = container.querySelectorAll<HTMLElement>("[data-tone]");
    expect(fills).toHaveLength(1);
    expect(fills[0]!.style.inlineSize).toBe("100%");
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it("passes className and rest props to the figure", () => {
    render(<BarList title="Items" rows={rows} className="extra" data-testid="b" />);
    expect(screen.getByTestId("b")).toHaveClass("extra");
  });

  it("lets the value wrap only when asked, by capping its column at half the row", async () => {
    const long = [{ key: "a", name: "North", value: "12 of 40 sites checked, 3 critical", amount: 12 }];
    const { container, rerender } = render(<BarList title="Items" rows={long} />);
    expect(container.querySelector("[data-value-wrap]")).toBeNull();
    rerender(<BarList title="Items" rows={long} valueWrap />);
    expect(container.querySelectorAll("[data-value-wrap]")).toHaveLength(1);
    expect(css).toMatch(/\.row\[data-value-wrap\] \{[^}]*fit-content\(50%\)/);
    expect(css).toMatch(/\.row\[data-value-wrap\] \.value \{[^}]*white-space: normal/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <BarList title="Items" summary="Summary" rows={rows} total={{ label: "Total", value: "1,800" }} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws in with motion tokens on transform and stops under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*bar-grow var\(--lufia-motion-duration-medium\) var\(--lufia-motion-easing-out\)/,
    );
    expect(css).toMatch(/@keyframes bar-grow \{\s*from \{\s*transform: scaleX\(0\)/);
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
  });

  describe("reference", () => {
    it("draws a dashed tick on every track on the shared scale, with an accessible legend", async () => {
      const { container } = render(
        <BarList title="Items" rows={rows} reference={{ amount: 600, label: "Target 600" }} />,
      );
      const ticks = container.querySelectorAll<HTMLElement>("[data-reference]");
      expect(ticks).toHaveLength(3);
      expect(ticks[0]!.style.getPropertyValue("--bar-reference")).toBe("50%");
      expect(ticks[0]!.closest("[aria-hidden]")).not.toBeNull();
      const figure = screen.getByRole("figure", { name: "Items" });
      expect(figure).toHaveAccessibleDescription("Target 600");
      expect(await axe(container)).toHaveNoViolations();
    });

    it("counts the reference towards the scale", () => {
      const { container } = render(
        <BarList title="Items" rows={rows} reference={{ amount: 2400, label: "Target" }} />,
      );
      const fills = container.querySelectorAll<HTMLElement>("[data-tone]");
      expect(fills[0]!.style.inlineSize).toBe("50%");
      expect(
        container.querySelector<HTMLElement>("[data-reference]")!.style.getPropertyValue("--bar-reference"),
      ).toBe("100%");
    });

    it("draws nothing by default and copes with a non-finite amount", () => {
      const { container, rerender } = render(<BarList title="Items" rows={rows} />);
      expect(container.querySelector("[data-reference]")).toBeNull();
      expect(screen.getByRole("figure")).not.toHaveAttribute("aria-describedby");
      rerender(<BarList title="Items" rows={rows} reference={{ amount: Number.NaN, label: "Target" }} />);
      expect(container.innerHTML).not.toMatch(/NaN/);
    });

    it("keeps the tick inside the track at the end", () => {
      expect(css).toMatch(/\.tick \{[^}]*min\(var\(--bar-reference, 0%\), calc\(100% - 0\.125rem\)\)/);
    });
  });

  describe("titleVisibility", () => {
    it("keeps the title as the accessible name when hidden", async () => {
      const { container } = render(<BarList title="Items" rows={rows} titleVisibility="hidden" />);
      expect(screen.getByRole("figure", { name: "Items" })).toBeInTheDocument();
      expect(screen.getByText("Items").getAttribute("class")).toMatch(/titleHidden/);
      expect(screen.getByText("Items")).toHaveAttribute("data-title-visibility", "hidden");
      expect(await axe(container)).toHaveNoViolations();
    });

    it("is visible by default", () => {
      render(<BarList title="Items" rows={rows} />);
      expect(screen.getByText("Items").getAttribute("class")).not.toMatch(/titleHidden/);
    });
  });
});
