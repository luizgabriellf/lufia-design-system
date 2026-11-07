import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../test/axe";
import { ColumnChartPlot, tipZone } from "./ColumnChartPlot";
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
    expect(segments(container).filter((el) => el.hasAttribute("style"))).toHaveLength(1);
    expect(container.querySelectorAll("[data-zero]")).toHaveLength(1);
  });

  it("shows odd numbers as given in the table while drawing them as 0", () => {
    render(
      <ColumnChart
        title="Odd"
        series={stacked}
        columns={[{ key: "a", label: "A", values: [4, -3, Number.NaN] }]}
        formatValue={(n) => `<${n}>`}
      />,
    );
    const row = (name: string) => within(screen.getByRole("row", { name: new RegExp(name) }));
    expect(row("Late").getByRole("cell")).toHaveTextContent("<-3>");
    expect(row("Open").getByRole("cell")).toHaveTextContent("<NaN>");
    expect(row("On time").getByRole("cell")).toHaveTextContent("<4>");
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

  it("names the data table after the title", () => {
    render(<ColumnChart title="Deliveries" series={single} columns={week} />);
    expect(screen.getByRole("table", { name: "Deliveries" })).toBeInTheDocument();
  });

  it("gives each series a pattern index for forced-colors mode, in the columns and the legend", () => {
    const { container } = render(<ColumnChart title="Orders" series={stacked} columns={stackedColumns} />);
    const idx = (selector: string) =>
      [...container.querySelectorAll(selector)].map((el) => el.getAttribute("data-series"));
    expect(idx("li")).toEqual(["0", "1", "2"]);
    expect(idx("span[style]").slice(0, 3)).toEqual(["0", "1", "2"]);
    const forced = css.match(/@media \(forced-colors: active\) \{([\s\S]*)\n\}/)![1]!;
    for (const n of [0, 1, 2, 3, 4]) {
      // Scoped to the chart's parts, and set on the legend swatch pseudo-element itself (not inherited through a
      // custom property the swatch would override).
      expect(forced).toContain(`.segment[data-series="${n}"]`);
      expect(forced).toContain(`.legendItem[data-series="${n}"]::before`);
    }
    expect(forced).not.toContain("--pattern");
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

  describe("printValues", () => {
    const printed = (container: HTMLElement) =>
      [...container.querySelectorAll("[data-total]")].map((node) => node.textContent);

    it("prints nothing by default and the formatted total above every column when true", () => {
      const { container, rerender } = render(
        <ColumnChart title="Orders" series={stacked} columns={stackedColumns} />,
      );
      expect(printed(container)).toEqual([]);
      rerender(
        <ColumnChart
          title="Orders"
          series={stacked}
          columns={stackedColumns}
          printValues
          formatValue={(value) => `${value} h`}
        />,
      );
      expect(printed(container)).toEqual(["10 h", "4 h"]);
      expect(container.querySelector("[data-print-values]")).toHaveAttribute("aria-hidden", "true");
    });

    it('prints for 6 columns or fewer and not for 7 with "auto"', () => {
      const columns = (count: number) =>
        Array.from({ length: count }, (_, index) => ({
          key: `c${index}`,
          label: `C${index}`,
          values: [index + 1],
        }));
      const { container, rerender } = render(
        <ColumnChart title="Orders" series={single} columns={columns(6)} printValues="auto" />,
      );
      expect(printed(container)).toHaveLength(6);
      rerender(<ColumnChart title="Orders" series={single} columns={columns(7)} printValues="auto" />);
      expect(printed(container)).toEqual([]);
    });

    it("sits on its column on the shared scale", () => {
      const { container } = render(<ColumnChart title="Orders" series={single} columns={week} printValues />);
      const totals = [...container.querySelectorAll<HTMLElement>("[data-total]")];
      expect(totals.map((node) => node.style.insetBlockEnd)).toEqual(["50%", "100%", "0%"]);
    });
  });

  describe("band", () => {
    const withBand: ColumnChartColumn[] = [
      { key: "mon", label: "Mon", values: [4], band: { low: 3, high: 8 } },
      { key: "tue", label: "Tue", values: [2] },
    ];

    it("is drawn on the shared scale and counts towards the maximum", () => {
      const { container } = render(<ColumnChart title="Orders" series={single} columns={withBand} />);
      const bar = container.querySelector<HTMLElement>("[data-band]")!;
      expect(bar.style.insetBlockEnd).toBe("37.5%");
      expect(bar.style.blockSize).toBe("62.5%");
      // The tallest thing in the chart is the band (8), so the 4 column is half the plot, not full.
      expect(segments(container)[0]!.style.blockSize).toBe("50%");
    });

    it("is listed in the data table under its label", () => {
      render(
        <ColumnChart
          title="Orders"
          series={single}
          columns={withBand}
          bandLabel="Intervalo"
          formatValue={(v) => `${v} h`}
        />,
      );
      const row = within(screen.getByRole("table")).getByRole("row", { name: /Intervalo/ });
      expect(
        within(row)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      ).toEqual(["3 h \u2013 8 h", ""]);
    });

    it("adds no row and no bar without a band, and drops an invalid one", () => {
      const invalid: ColumnChartColumn[] = [
        { key: "a", label: "A", values: [4], band: { low: 9, high: 3 } },
        { key: "b", label: "B", values: [4], band: { low: Number.NaN, high: 3 } },
      ];
      const { container } = render(<ColumnChart title="Orders" series={single} columns={invalid} />);
      expect(container.querySelector("[data-band]")).toBeNull();
      expect(screen.queryByRole("row", { name: /Range/ })).toBeNull();
    });
  });

  describe("pattern", () => {
    it("marks the segments and the legend swatch of a hatched series", () => {
      const { container } = render(
        <ColumnChart
          title="Orders"
          series={[
            { key: "ok", label: "Actual" },
            { key: "fc", label: "Forecast", pattern: "hatch" },
          ]}
          columns={[{ key: "a", label: "A", values: [3, 2] }]}
        />,
      );
      expect(container.querySelectorAll('[data-pattern="hatch"]')).toHaveLength(2);
      expect(container.querySelector("li[data-pattern='hatch']")).toHaveTextContent("Forecast");
    });

    it("is not drawn in forced-colors mode, where the per-series fill patterns apply", () => {
      expect(css).toMatch(
        /\.segment\[data-pattern="hatch"\],\s*\.legendItem\[data-pattern="hatch"\]::before \{\s*background-image: repeating-linear-gradient/,
      );
      const forced = css.match(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/)![1]!;
      // Same specificity as the hatch rule and later in the file, with a background shorthand that resets the image.
      expect(forced).toMatch(
        /\.segment\[data-series="0"\],\s*\.legendItem\[data-series="0"\]::before \{\s*background: /,
      );
      expect(css.indexOf('.segment[data-pattern="hatch"]')).toBeLessThan(
        css.indexOf("@media (forced-colors: active)"),
      );
    });
  });

  describe("interactive", () => {
    const detailed: ColumnChartColumn[] = [
      { key: "mon", label: "Mon", values: [4], detail: "Holiday, shop closed" },
      { key: "tue", label: "Tue", values: [8] },
      { key: "wed", label: "Wed", values: [6], detail: "Stock count" },
    ];
    const tip = () => document.querySelector("[data-zone]");

    it("stays static by default: nothing focusable, the plot hidden from assistive technology", () => {
      const { container } = render(<ColumnChart title="Deliveries" series={single} columns={detailed} />);
      expect(screen.queryAllByRole("img")).toEqual([]);
      expect(container.querySelector("[tabindex]")).toBeNull();
      expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
    });

    it("names each column with its label, formatted values and detail", () => {
      render(
        <ColumnChart
          title="Deliveries"
          series={single}
          columns={detailed}
          interactive
          formatValue={(v) => `${v} h`}
        />,
      );
      expect(screen.getByRole("img", { name: "Mon: 4 h \u00b7 Holiday, shop closed" })).toHaveAttribute(
        "tabindex",
        "0",
      );
      expect(screen.getByRole("img", { name: "Tue: 8 h" })).toBeInTheDocument();
    });

    it("names stacked values by series and adds the range", () => {
      render(
        <ColumnChart
          title="Orders"
          series={stacked}
          columns={[
            { key: "a", label: "Week 1", values: [6, 2, 2], detail: "Peak", band: { low: 9, high: 11 } },
          ]}
          interactive
        />,
      );
      expect(
        screen.getByRole("img", { name: "Week 1: On time 6, Late 2, Open 2, Range 9 \u2013 11 \u00b7 Peak" }),
      ).toBeInTheDocument();
    });

    it("names a column whose label is not text from the label and its values", () => {
      render(
        <ColumnChart
          title="Deliveries"
          series={single}
          columns={[{ key: "a", label: <em>Mon</em>, values: [4], detail: "Closed" }]}
          interactive
        />,
      );
      const column = screen.getByRole("img");
      expect(column).toHaveAccessibleName(/Mon.*4 \u00b7 Closed/);
    });

    it("shows the tooltip on hover and hides it when the pointer leaves", async () => {
      const user = userEvent.setup();
      render(<ColumnChart title="Deliveries" series={single} columns={detailed} interactive />);
      expect(tip()).toBeNull();
      await user.hover(screen.getByRole("img", { name: /^Mon/ }));
      expect(tip()).toHaveTextContent("Mon4Holiday, shop closed");
      await user.hover(screen.getByRole("img", { name: /^Wed/ }));
      expect(tip()).toHaveTextContent("Wed6Stock count");
      await user.unhover(screen.getByRole("img", { name: /^Wed/ }));
      expect(tip()).toBeNull();
    });

    it("shows the tooltip on keyboard focus and Escape dismisses it without closing a dialog around it", async () => {
      const user = userEvent.setup();
      const outer = vi.fn();
      render(
        // A stand-in for the dialog that would listen for Escape.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onKeyDown={(event) => event.key === "Escape" && outer()}>
          <ColumnChart title="Deliveries" series={single} columns={detailed} interactive />
          <button type="button">After</button>
        </div>,
      );
      await user.tab();
      expect(screen.getByRole("img", { name: /^Mon/ })).toHaveFocus();
      expect(tip()).toHaveTextContent("Holiday, shop closed");
      await user.keyboard("{Escape}");
      expect(tip()).toBeNull();
      expect(outer).not.toHaveBeenCalled();
      expect(screen.getByRole("img", { name: /^Mon/ })).toHaveFocus();
      await user.tab();
      expect(tip()).toHaveTextContent("Tue8");
      await user.tab();
      await user.tab();
      expect(tip()).toBeNull();
      // With nothing shown, Escape is the page's own.
      await user.keyboard("{Escape}");
      expect(outer).toHaveBeenCalledTimes(1);
    });

    it("shows on tap, closes on a second tap and on a tap outside", async () => {
      const user = userEvent.setup();
      render(
        <>
          <button type="button">Outside</button>
          <ColumnChart title="Deliveries" series={single} columns={detailed} interactive />
        </>,
      );
      const mon = screen.getByRole("img", { name: /^Mon/ });
      await user.pointer({ keys: "[TouchA]", target: mon });
      expect(tip()).toHaveTextContent("Holiday");
      await user.pointer({ keys: "[TouchA]", target: mon });
      expect(tip()).toBeNull();
      await user.pointer({ keys: "[TouchA]", target: mon });
      expect(tip()).not.toBeNull();
      await user.pointer({ keys: "[TouchA]", target: screen.getByRole("button", { name: "Outside" }) });
      expect(tip()).toBeNull();
    });

    it("keeps the tooltip while the pointer moves onto it, and hides it when the pointer leaves the plot", async () => {
      const user = userEvent.setup();
      render(<ColumnChart title="Deliveries" series={single} columns={detailed} interactive />);
      const mon = screen.getByRole("img", { name: /^Mon/ });
      await user.hover(mon);
      const element = tip() as HTMLElement;
      // user-event leaves relatedTarget empty, which React reads as the pointer leaving the window; send the real move.
      const move = (type: string, from: Element, to: Element | null) => {
        const event = new MouseEvent(type, { bubbles: true, relatedTarget: to });
        Object.defineProperty(event, "pointerType", { value: "mouse" });
        fireEvent(from, event);
      };
      act(() => {
        move("pointerout", mon, element);
        move("pointerover", element, mon);
      });
      expect(tip()).not.toBeNull();
      act(() => {
        move("pointerout", element, document.body);
        move("pointerover", document.body, element);
      });
      expect(tip()).toBeNull();
    });

    it("hides the tooltip from assistive technology: the name already says it", async () => {
      const user = userEvent.setup();
      render(<ColumnChart title="Deliveries" series={single} columns={detailed} interactive />);
      await user.hover(screen.getByRole("img", { name: /^Mon/ }));
      expect(tip()).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("anchors the tooltip on the outer thirds and centres it in the middle, inside the plot", () => {
      expect([0, 1, 2, 3, 4, 5, 6].map((index) => tipZone(index, 7))).toEqual([
        "start",
        "start",
        "center",
        "center",
        "center",
        "end",
        "end",
      ]);
      expect(tipZone(0, 1)).toBe("center");
      // At most two thirds of the plot wide, so a centred tip in the middle third never crosses an edge, even at 320px.
      expect(css).toMatch(/\.tip \{[^}]*inline-size: min\(14rem, 66%\)/);
      expect(css).toMatch(/\.tip\[data-zone="start"\] \{\s*inset-inline-start:/);
      expect(css).toMatch(/\.tip\[data-zone="end"\] \{\s*inset-inline-end:/);
    });

    it("marks the zone on the tooltip it shows", async () => {
      const user = userEvent.setup();
      const columns = Array.from({ length: 7 }, (_, index) => ({
        key: `c${index}`,
        label: `C${index}`,
        values: [index + 1],
      }));
      render(<ColumnChart title="Deliveries" series={single} columns={columns} interactive />);
      const zones: (string | null)[] = [];
      for (const name of ["C0", "C3", "C6"]) {
        await user.hover(screen.getByRole("img", { name: new RegExp(`^${name}:`) }));
        zones.push(tip()!.getAttribute("data-zone"));
      }
      expect(zones).toEqual(["start", "center", "end"]);
    });

    it("fades in on a motion token and has no animation under reduced motion", () => {
      expect(css).toMatch(
        /animation:\s*tip-in var\(--lufia-motion-duration-instant\) var\(--lufia-motion-easing-out\)/,
      );
      expect(css).toMatch(/@keyframes tip-in \{\s*from \{\s*opacity: 0/);
      const reduced = css.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/);
      expect(reduced?.[1]).toMatch(/\.tip/);
      expect(reduced?.[1]).toMatch(/animation:\s*none/);
    });

    it("has no axe violations with the tooltip shown, a band, printed values and a pattern", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ColumnChart
          title="Deliveries"
          series={[
            { key: "ok", label: "Actual" },
            { key: "fc", label: "Forecast", pattern: "hatch" },
          ]}
          columns={[
            { key: "a", label: "Mon", values: [4, 2], detail: "Holiday", band: { low: 5, high: 8 } },
            { key: "b", label: <span>Tue</span>, values: [3, 1] },
          ]}
          interactive
          printValues
        />,
      );
      await user.tab();
      expect(tip()).not.toBeNull();
      expect(await axe(container)).toHaveNoViolations();
    });

    it("passes the plot's own handlers through", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <ColumnChartPlot tips={["a"]} onClick={onClick}>
          <button type="button" data-column="0">
            x
          </button>
        </ColumnChartPlot>,
      );
      await user.click(screen.getByText("x"));
      expect(onClick).toHaveBeenCalled();
    });
  });
});
