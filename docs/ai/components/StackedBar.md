# StackedBar

> One bar split into proportional segments, with a legend and a text alternative.

- Status: beta
- Category: Data display
- Import: `import { StackedBar } from "@lufia/design-system/components/StackedBar"`
- Also from: `@lufia/design-system`
- Source: [src/components/StackedBar](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/StackedBar)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-stackedbar--docs)

## Purpose

One bar split into proportional segments, with a legend. It shows how a whole divides into parts, such as a plan mix or
accounts by status.

## When to use

- A part-of-whole breakdown of one total, with a handful of segments.
- A compact composition next to a figure or inside a card.

## When not to use

- Several measures per period: use `ColumnChart`.
- One value against a target: use `BulletBar`; one completion fraction: use `ProgressBar`.
- Values that are compared across rows on a shared scale: use `BarList`.
- Many segments (more than about five): the tones run out and the slices become unreadable. Use `BarList`.

## API

### `StackedBar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `segments` | `readonly StackedBarSegment[]` | yes |  | The parts of the whole, in drawing order. Segments with no value are not drawn but stay in the legend and the text. |
| `label` | `string` | yes |  | Accessible name of the whole bar ("Plan mix"). Required: the bar is a group that a screen reader reads by its parts. |
| `formatValue` | `(value: number) => string` | no | `String` | Formats each value for the legend and the text alternative ("1,240", "3 sites"). Defaults to `String(value)`. |
| `formatPercent` | `(percent: number) => string` | no | `defaultPercent` | Formats each share, given as a number from 0 to 100, for the legend and the text alternative. Defaults to the rounded number and `%` ("38%"), and to "<1%" for a segment with a value whose share rounds to 0. Rounded shares may not add up to 100. Pass it to localise the number or the symbol. |
| `legend` | `"hidden" \| "auto"` | no | `"auto"` | `"auto"` prints the legend under the bar: a swatch, the label and the value of every segment. `"hidden"` keeps the same list in the page for screen readers only, so the bar never loses its text alternative. Defaults to `"auto"`. |
| `showPercent` | `boolean` | no | `false` | Prints each share next to its value in the legend. Off by default; the share is always read by assistive technology. |

Other native element attributes pass through to the root element.

## Types

- `StackedBarSegment`: `{ key: string; label: string; value: number; tone?: ChartTone | undefined; pattern?: "hatch" | undefined; }`

## Example

```tsx
import { StackedBar } from "@lufia/design-system/components/StackedBar";

<StackedBar
  label="Accounts by status"
  segments={[
    { key: "active", label: "Active", value: 48, tone: "accent" },
    { key: "trial", label: "Trial", value: 21, tone: "success" },
    { key: "expired", label: "Expired", value: 9, tone: "warning" },
  ]}
  formatValue={(value) => value.toLocaleString("en")}
/>;
```

## Accessibility

- The root is a `role="group"` named by `label` (required). The drawing is `aria-hidden`; the text alternative is a list with one item per segment: its label, its value and its share ("Active 48 (62%)").
- `legend="hidden"` hides the legend visually and keeps that list for screen readers. `showPercent` only changes whether the share is printed.
- Colour is never the only cue: every segment is named in the list, neighbours are separated by a gap, and a `pattern` adds stripes.
- A zero total draws an empty track and every share reads 0%. Zero segments are not drawn but stay in the list.
- A segment with a value whose share rounds to 0 reads "<1%" by default. Rounded shares may not add up to 100.
- A negative or non-finite value is drawn as 0 and its share reads 0, but the list shows the number as given, so bad data stays visible to assistive technology.
- The draw-in is `transform` only and plays once, on mount; it is removed under `prefers-reduced-motion`.
- In `forced-colors` mode each segment, and its legend swatch, gets its own fill pattern in `CanvasText`.
- Layout uses logical properties and the draw-in starts from the inline start, so right-to-left works.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-bg-surface`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`, `--lufia-radius-full`.

## Stories

- `components-data-display-stackedbar--default`
- `components-data-display-stackedbar--with-percent`
- `components-data-display-stackedbar--formatted-values`
- `components-data-display-stackedbar--legend-hidden`
- `components-data-display-stackedbar--zero-segment`
- `components-data-display-stackedbar--zero-total`
- `components-data-display-stackedbar--single-segment`
- `components-data-display-stackedbar--hatched`
- `components-data-display-stackedbar--many-segments`
- `components-data-display-stackedbar--right-to-left`
- `components-data-display-stackedbar--all-themes`
