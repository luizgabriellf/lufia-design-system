# ColumnChart

> Columns on one baseline, single or stacked, with the numbers in a hidden data table.

- Status: beta
- Category: Data display
- Import: `import { ColumnChart } from "@lufia/design-system/components/ColumnChart"`
- Also from: `@lufia/design-system`
- Source: [src/components/ColumnChart](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ColumnChart)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-columnchart--docs)

## Purpose

Columns on one zero baseline, for a weekly strip or a stack of measures per period. One scale for the whole chart, so columns compare.

## When to use

- Hovering or tapping a column should explain it (a holiday, an outlier): `interactive` with `detail`.
- A short run of periods (a week, up to about twelve months) compared on one measure, or split into a few parts.

## When not to use

- Categories with long names or exact values: use `BarList`.
- A trend inside a sentence or a tile: use `Sparkline`.
- Many periods, negative values or several axes: use a chart library or a table.
- Nothing to show: it renders nothing, so use an `EmptyState`.

## API

### `ColumnChart`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` | yes |  | Caption of the figure, and its accessible name. |
| `titleVisibility` | `"hidden" \| "visible"` | no | `"visible"` | `"hidden"` keeps the title as the accessible name for screen readers only. Defaults to `"visible"`. |
| `summary` | `ReactNode` | no |  | A written summary of what the columns show. Shown above them. |
| `series` | `readonly ColumnChartSeries[]` | yes |  | The measures. One series draws plain columns; several stack in this order, the first at the bottom. |
| `columns` | `readonly ColumnChartColumn[]` | yes |  | One column per entry, left to right (right to left in an RTL page). |
| `formatValue` | `(value: number) => string` | no | `String` | How a number is written in the data table ("12 h", "1,240"). Defaults to `String`. Format with your locale here. |
| `legend` | `"hidden" \| "auto"` | no | `"auto"` | The legend of a stacked chart. `"auto"` (default) shows it when there is more than one series. |
| `interactive` | `boolean` | no | `false` | Makes every column a focusable element named "<column label>: <values> · <detail>" that shows a tooltip on hover, focus and tap. Escape dismisses the tooltip. Off by default: the chart is then static and needs no client code. |
| `printValues` | `boolean \| "auto"` | no | `false` | Prints the formatted total above each column. `"auto"` prints it when there are 6 columns or fewer, so a long strip does not crowd; `true` always and `false` (default) never. The numbers repeat the data table, so they are hidden from assistive technology. |
| `bandLabel` | `string` | no | `"Range"` | Names the range row of the data table and the range in the tooltip, when a column has a `band`. Aria and tooltip text, so it has an English default. Defaults to `"Range"`. |
| `columnLabel` | `string` | no | `"column"` | What a screen reader calls each column when `interactive` is set (`aria-roledescription`), so it is announced as a "column", not as an image, which tells people the arrow keys move between columns. Aria-only text, so it has an English default. Defaults to `"column"`. |

Other native element attributes pass through to the root element.

## Types

- `ColumnChartColumn`: `{ key: string; label: ReactNode; values: readonly number[]; detail?: string | undefined; band?: { low: number; high: number; } | undefined; }`
- `ColumnChartSeries`: `{ key: string; label: string; tone?: ChartTone | undefined; pattern?: "hatch" | undefined; }`

## Example

```tsx
import { ColumnChart } from "@lufia/design-system/components/ColumnChart";

// A weekly strip: one series
<ColumnChart
  title="Deliveries this week"
  series={[{ key: "done", label: "Deliveries" }]}
  columns={[
    { key: "mon", label: "Mon", values: [4] },
    { key: "tue", label: "Tue", values: [8] },
  ]}
/>

// Stacked columns: one number per series, the first series at the bottom
<ColumnChart
  title="Orders by delivery state"
  series={[
    { key: "ok", label: "On time", tone: "success" },
    { key: "late", label: "Late", tone: "danger" },
  ]}
  columns={[{ key: "w1", label: "Week 1", values: [6, 2] }]}
  formatValue={(value) => value.toLocaleString("en")}
/>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| `Tab` | Enters the columns at the last one focused (the first at first), and leaves them on the next press |
| `Arrow Right` / `Arrow Left` | Next or previous column and shows its tooltip (swapped in right-to-left) |
| `Home` / `End` | First or last column |
| `Escape` | Dismisses the tooltip; focus stays on the column |

- The data is a table. A visually hidden `table`, named by the `title`, lists every series as a row and every column label as a heading, so a screen reader reads the numbers; the drawing is `aria-hidden` shape on top of it, except when `interactive` is set, where the columns are exposed as named images. Write the numbers with `formatValue`.
- The `figure` is named by its `title`; `titleVisibility="hidden"` keeps that name for screen readers only. A written `summary` says what the columns show.
- Series are named in a visible legend (shown when there are several) and in the table, so colour never carries the meaning alone. Stacked segments are also separated by a hairline.
- The draw-in is `transform` only, plays once on mount and is removed under `prefers-reduced-motion`.
- Columns shrink to fit and their labels wrap, down to 320px. In `forced-colors` mode, where tones collapse to one colour, each series gets its own fill pattern (solid, diagonal stripes, dots, vertical stripes, horizontal stripes, repeating after five) in the columns and in the legend, so the legend stays matchable.
- Negative and non-finite numbers are drawn as 0, but the table shows them as given (through `formatValue`), so bad data is visible rather than hidden.
- Print the figures people need as text beside the chart: the drawing has no value labels, unless you set `printValues`.
- `interactive`: each column is a focusable `role="img"` named `<column label>: <values> · <detail>` and announced as a "column" (`aria-roledescription`, set with `columnLabel`, so people know the arrow keys move between columns) (a series is named when there are several; a `band` adds "`bandLabel` low – high"). The tooltip repeats that text visually, so it is hidden from assistive technology and there is no `aria-describedby`; the detail would be read twice. It follows the WCAG 1.4.13 conditions: Escape dismisses it (and stops there, so a dialog around the chart stays open), the pointer can move onto it, and it stays until the pointer or focus leaves. It is at most two thirds of the plot wide and anchored to the plot edge on the outer thirds, so it does not overflow, down to 320px. It fades in on `opacity`, and not at all under `prefers-reduced-motion`. A column label that is not text names the column from the label element and its values.
- `printValues`: the printed totals repeat the data table, so they are hidden from assistive technology.
- `band`: counted in the scale maximum and listed in the data table, under `bandLabel` (an English default, as it is aria text; set it in your language). It is drawn as a stem with two caps; in `forced-colors` mode it uses `CanvasText`.
- `pattern="hatch"`: diagonal stripes in the card colour over the series colour, in the columns and in the legend. In `forced-colors` mode every series already has its own fill pattern, which replaces the hatch.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-column-chart-plot-height`, `--lufia-font-family-display`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-2xs`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`, `--lufia-radius-md`, `--lufia-radius-sm`, `--lufia-shadow-md`, `--lufia-z-dropdown`.

## Stories

- `components-data-display-columnchart--weekly-strip`
- `components-data-display-columnchart--stacked`
- `components-data-display-columnchart--formatted-values`
- `components-data-display-columnchart--hidden-legend`
- `components-data-display-columnchart--hidden-title`
- `components-data-display-columnchart--tones`
- `components-data-display-columnchart--zero-columns`
- `components-data-display-columnchart--single-column`
- `components-data-display-columnchart--twelve-columns`
- `components-data-display-columnchart--long-portuguese-text`
- `components-data-display-columnchart--interactive`
- `components-data-display-columnchart--interactive-stacked`
- `components-data-display-columnchart--interactive-long-portuguese-text`
- `components-data-display-columnchart--interactive-phone-320`
- `components-data-display-columnchart--interactive-right-to-left`
- `components-data-display-columnchart--printed-values`
- `components-data-display-columnchart--printed-values-auto`
- `components-data-display-columnchart--printed-values-stacked`
- `components-data-display-columnchart--with-band`
- `components-data-display-columnchart--hatched-series`
- `components-data-display-columnchart--everything-on`
- `components-data-display-columnchart--phone-320`
- `components-data-display-columnchart--lower-plot`
- `components-data-display-columnchart--right-to-left`
- `components-data-display-columnchart--all-themes`
