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
| `formatValue` | `((value: number) => string)` | no | `String` | How a number is written in the data table ("12 h", "1,240"). Defaults to `String`. Format with your locale here. |
| `legend` | `"hidden" \| "auto"` | no | `"auto"` | The legend of a stacked chart. `"auto"` (default) shows it when there is more than one series. |

Other native element attributes pass through to the root element.

## Types

- `ColumnChartColumn`: `{ key: string; label: ReactNode; values: readonly number[]; }`
- `ColumnChartSeries`: `{ key: string; label: string; tone?: ChartTone | undefined; }`

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

- The data is a table. A visually hidden `table`, named by the `title`, lists every series as a row and every column label as a heading, so a screen reader reads the numbers; the drawing is `aria-hidden` shape on top of it. Write the numbers with `formatValue`.
- The `figure` is named by its `title`; `titleVisibility="hidden"` keeps that name for screen readers only. A written `summary` says what the columns show.
- Series are named in a visible legend (shown when there are several) and in the table, so colour never carries the meaning alone. Stacked segments are also separated by a hairline.
- The draw-in is `transform` only, plays once on mount and is removed under `prefers-reduced-motion`.
- Columns shrink to fit and their labels wrap, down to 320px. In `forced-colors` mode, where tones collapse to one colour, each series gets its own fill pattern (solid, diagonal stripes, dots, vertical stripes, repeating after four) in the columns and in the legend, so the legend stays matchable.
- Negative and non-finite numbers are drawn as 0, but the table shows them as given (through `formatValue`), so bad data is visible rather than hidden.
- Print the figures people need as text beside the chart: the drawing has no value labels.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-bg-surface`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-column-chart-plot-height`, `--lufia-font-family-display`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-2xs`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`.

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
- `components-data-display-columnchart--phone-320`
- `components-data-display-columnchart--lower-plot`
- `components-data-display-columnchart--right-to-left`
- `components-data-display-columnchart--all-themes`
