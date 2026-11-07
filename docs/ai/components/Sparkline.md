# Sparkline

> A word-sized trend chart with no axes, drawn in SVG.

- Status: beta
- Category: Data display
- Import: `import { Sparkline } from "@lufia/design-system/components/Sparkline"`
- Also from: `@lufia/design-system`
- Source: [src/components/Sparkline](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Sparkline)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-sparkline--docs)

## Purpose

A word-sized chart with no axes: the trend that sits next to a figure. Drawn in SVG, with no chart library.

## When to use

- The trend next to a figure, in a `StatTile` or a table row.
- A comparison of a few short series at a glance.

## When not to use

- Reading exact values or axes: print a table or use `BarList`.
- Long series that need a scale, gridlines or tooltips.

## API

### `Sparkline`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `values` | `readonly number[]` | yes |  | The series, oldest first. Non-finite numbers count as 0. |
| `variant` | `SparklineVariant` | no | `"columns"` | `columns` draws one bar per value from a zero baseline, `line` a trend line scaled to the range. |
| `tone` | `ChartTone` | no | `"accent"` |  |
| `label` | `string \| null` | yes |  | Accessible name: a sentence that carries the numbers ("Deliveries per week: 3, 5, 4, 8"). Pass `null` to hide the drawing from assistive technology, only when the numbers are printed as text next to it. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { Sparkline } from "@lufia/design-system/components/Sparkline";

<Sparkline values={[3, 5, 4, 8, 6, 9, 12]} label="Deliveries per week: 3, 5, 4, 8, 6, 9, 12" />;

{
  /* The numbers are already printed as text beside it. */
}
<Sparkline values={[3, 5, 4, 8]} variant="line" label={null} />;
```

## Accessibility

- `label` is required. With a string, the drawing is `role="img"` named by that sentence, so put the numbers in it. With `null`, it is hidden from assistive technology: do that only when the numbers are printed as text next to it.
- The tone only reinforces. Never use a tone as the only way to tell good from bad.
- The draw-in is `transform` and stroke only and plays once, on mount. Under `prefers-reduced-motion` it is removed and the finished drawing is there at once.
- In `forced-colors` mode the marks use `CanvasText`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-color-accent-default`, `--lufia-color-border-strong`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-subtle`, `--lufia-motion-duration-instant`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`.

## Stories

- `components-data-display-sparkline--columns`
- `components-data-display-sparkline--line`
- `components-data-display-sparkline--tones`
- `components-data-display-sparkline--with-zeros`
- `components-data-display-sparkline--single-value`
- `components-data-display-sparkline--constant-line`
- `components-data-display-sparkline--many-values`
- `components-data-display-sparkline--empty`
- `components-data-display-sparkline--decorative`
- `components-data-display-sparkline--right-to-left`
- `components-data-display-sparkline--all-themes`
