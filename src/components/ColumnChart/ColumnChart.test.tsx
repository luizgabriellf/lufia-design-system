import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { axe } from "../../test/axe";
import { ColumnChart, type ColumnChartColumn, type ColumnChartSeries } from "./ColumnChart";

const css = readFileSync("src/components/ColumnChart/ColumnChart.module.css", "utf8");

const single: ColumnChartSeries[] = [{ key: "done", label: "Deliveries" }];
const week: ColumnChartColumn[] = [
  { key: "mon", label: "Mon", values: [4] },
  { key: "tue", label: "Tue", values: [8] },
  { key: "wed", label: "Wed", values: [0] },
];

const stacked: ColumnChartSeries[] = [
  { key: "ok", label: "On time", tone: "success" },
  { key: "late", label: "Late", tone: "danger" },
  { key: "open", label: "Open" },
];
const stackedColumns: ColumnChartColumn[] = [
  { key: "a", label: "Week 1", values: [6, 2, 2] },
  { key: "b", label: "Week 2", values: [3, 1, 0] },
];

const segments = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>("[data-tone]")];

describe("ColumnChart", () => {
  it("is a figure named by its title with the numbers in a data table", () => {
    render(<ColumnChart title="Deliveries" summary="Tuesday peaks." series={single} columns={week} />);
    expect(screen.getByRole("figure", { name: "Deliveries" })).toBeInTheDocument();
    expect(screen.getByText("Tuesday peaks.")).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Tue" })).toBeInTheDocument();
    const row = within(table).getByRole("row", { name: /Deliveries/ });
    expect(
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["4", "8", "0"]);
  });

  it("draws every column on one scale, the tallest filling the plot", () => {
    const { container } = render(<ColumnChart title="Deliveries" series={single} columns={week} />);
    const bars = segments(container);
    expect(bars).toHaveLength(2);
    expect(bars[0]!.style.blockSize).toBe("50%");
    expect(bars[1]!.style.blockSize).toBe("100%");
  });

  it("marks a zero column with a baseline stub and no segment", () => {
    const { container } = render(<ColumnChart title="Deliveries" series={single} columns={week} />);
    expect(container.querySelectorAll("[data-zero]")).toHaveLength(1);
  });

  it("stacks series on the shared scale with per-series and default tones", () => {
    const { container } = render(<ColumnChart title="Orders" series={stacked} columns={stackedColumns} />);
    const bars = segments(container).filter((el) => el.hasAttribute("style"));
    expect(bars.map((bar) => bar.getAttribute("data-tone"))).toEqual([
      "success",
      "danger",
      "success",
      "success",
      "danger",
    ]);
    expect(bars.map((bar) => bar.style.blockSize)).toEqual(["60%", "20%", "20%", "30%", "10%"]);
  });

  it("defaults tones by position when a series gives none", () => {
    const { container } = render(
      <ColumnChart
        title="Orders"
        series={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
          { key: "c", label: "C" },
        ]}
        columns={[{ key: "x", label: "X", values: [1, 1, 1] }]}
      />,
    );
    const bars = segments(container).filter((el) => el.hasAttribute("style"));
    expect(bars.map((bar) => bar.getAttribute("data-tone"))).toEqual(["accent", "neutral", "success"]);
  });

  it("shows a legend for several series only, and can hide it", () => {
    const { rerender } = render(<ColumnChart title="Orders" series={stacked} columns={stackedColumns} />);
    const legend = screen.getByRole("list");
    expect(
      within(legend)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["On time", "Late", "Open"]);
    rerender(<ColumnChart title="Orders" series={stacked} columns={stackedColumns} legend="hidden" />);
    expect(screen.queryByRole("list")).toBeNull();
    rerender(<ColumnChart title="Orders" series={single} columns={week} />);
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("formats table values with formatValue", () => {
    render(<ColumnChart title="Hours" series={single} columns={week} formatValue={(n) => `${n} h`} />);
    expect(screen.getByRole("cell", { name: "8 h" })).toBeInTheDocument();
  });

  it("treats negative, missing and non-finite numbers as 0", () => {
    const { container } = render(
      <ColumnChart
        title="Odd"
        series={stacked}
        columns={[
          { key: "a", label: "A", values: [4, -3, Number.NaN] },
          { key: "b", label: "B", values: [Number.POSITIVE_INFINITY] },
        ]}
      />,
    );
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    expect(segments(container).filter((el) => el.hasAttribute("style"))).toHaveLength(1);
    expect(container.querySelectorAll("[data-zero]")).toHaveLength(1);
  });

  it("copes with all-zero data", async () => {
    const { container } = render(
      <ColumnChart title="Nothing" series={single} columns={week.map((c) => ({ ...c, values: [0] }))} />,
    );
    expect(container.querySelectorAll("[data-zero]")).toHaveLength(3);
    expect(container.innerHTML).not.toMatch(/NaN/);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders nothing without columns or series", () => {
    const { container, rerender } = render(<ColumnChart title="x" series={single} columns={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ColumnChart title="x" series={[]} columns={week} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("hides the drawing from assistive technology, not the data", () => {
    const { container } = render(<ColumnChart title="Deliveries" series={single} columns={week} />);
    expect(container.querySelector("[aria-hidden='true']")?.getAttribute("class")).toMatch(/plot/);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("keeps the title as the accessible name when hidden", () => {
    render(<ColumnChart title="Deliveries" titleVisibility="hidden" series={single} columns={week} />);
    expect(screen.getByRole("figure", { name: "Deliveries" })).toBeInTheDocument();
    expect(screen.getByText("Deliveries", { selector: "figcaption" })).toHaveAttribute(
      "data-title-visibility",
      "hidden",
    );
  });

  it("passes className, style and rest props to the figure", () => {
    render(
      <ColumnChart
        title="x"
        series={single}
        columns={week}
        className="extra"
        data-testid="c"
        style={{ "--lufia-column-chart-plot-height": "4rem" } as React.CSSProperties}
      />,
    );
    expect(screen.getByTestId("c")).toHaveClass("extra");
    expect(screen.getByTestId("c").style.getPropertyValue("--lufia-column-chart-plot-height")).toBe("4rem");
  });

  it("has no axe violations, single or stacked, with long labels", async () => {
    const { container } = render(
      <>
        <ColumnChart title="Week" summary="Summary" series={single} columns={week} />
        <ColumnChart
          title="Pedidos por semana, agrupados por estado de entrega"
          series={stacked}
          columns={[
            { key: "a", label: "Segunda-feira", values: [6, 2, 2] },
            { key: "b", label: "Terça-feira", values: [3, 1, 0] },
          ]}
        />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("draws in with motion tokens on transform and stops under reduced motion", () => {
    expect(css).toMatch(
      /animation:\s*column-grow var\(--lufia-motion-duration-medium\) var\(--lufia-motion-easing-out\)/,
    );
    expect(css).toMatch(/@keyframes column-grow \{\s*from \{\s*transform: scaleY\(0\)/);
    const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
    expect(reduced?.[1]).toMatch(/animation:\s*none/);
  });

  it("reads the plot height from a component token", () => {
    expect(css).toMatch(/var\(--lufia-column-chart-plot-height, 7rem\)/);
  });
});
