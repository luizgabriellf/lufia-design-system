# BarList

> Horizontal bars with the name and the value as text, on one shared scale.

- Status: beta
- Category: Data display
- Import: `import { BarList } from "@lufia/design-system/components/BarList"`
- Also from: `@lufia/design-system`
- Source: [src/components/BarList](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/BarList)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-barlist--docs)

## Purpose

Horizontal bars with the name and the value as text above each track. One scale per list: the largest row fills the track.

## When to use

- Comparing a handful of categories by one measure.
- A breakdown that fits a card.

## When not to use

- More than about ten rows: use a table.
- Two measures per row: use a table, or two lists.
- Time series: use `Sparkline`.
- Nothing to show: it renders nothing, so use an `EmptyState`.

## API

### `BarList`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `title` | `ReactNode` | yes |  | Caption of the figure, and its accessible name. |
| `summary` | `ReactNode` | no |  | A written summary of what the bars show. Shown above them. |
| `rows` | `readonly BarListRow[]` | yes |  |  |
| `total` | `{ label: ReactNode; value: ReactNode; }` | no |  | Closes the list with a total line. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { BarList } from "@lufia/design-system/components/BarList";

<BarList
  title="Items by region"
  summary="North has the most items."
  rows={[
    { key: "north", name: "North", note: "12 sites", value: "1,240", amount: 1240 },
    { key: "south", name: "South", value: "860", amount: 860, tone: "warning" },
  ]}
  total={{ label: "Total", value: "2,100" }}
/>;
```

## Accessibility

- The text is the data. It is a `figure` named by its `title`, and every name and value is a list item a screen reader reads in order. The bars are `aria-hidden` shape on top, so no separate table is needed.
- Format `value` yourself (it is what people read); the bar is drawn from `amount`.
- A written `summary` says what the bars show.
- The draw-in is `transform` only and plays once, on mount; it is removed under `prefers-reduced-motion`.
- In `forced-colors` mode tracks get a border and fills use `CanvasText`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-display`, `--lufia-font-line-height-normal`, `--lufia-font-line-height-tight`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-regular`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`, `--lufia-radius-full`.

## Stories

- `components-data-display-barlist--default`
- `components-data-display-barlist--with-total`
- `components-data-display-barlist--tones`
- `components-data-display-barlist--long-names`
- `components-data-display-barlist--all-zero`
- `components-data-display-barlist--empty`
- `components-data-display-barlist--phone-320`
- `components-data-display-barlist--right-to-left`
- `components-data-display-barlist--all-themes`
