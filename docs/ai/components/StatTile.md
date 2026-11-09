# StatTile

> A key figure with its label, change and hint, optionally a link to its detail.

- Status: beta
- Category: Data display
- Import: `import { StatTile, computeStatDelta } from "@lufia/design-system/components/StatTile"`
- Also from: `@lufia/design-system`
- Source: [src/components/StatTile](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/StatTile)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-stattile--docs)

## Purpose

A key figure with its label, an optional change and hint, and a slot for a small chart: the tile of a dashboard. With `href` or `onClick` the whole tile is one link or button.

## When to use

- A figure people scan first on a dashboard: a count, a rate, an amount.
- A shortcut to the filtered list behind the figure.

## When not to use

- A figure inside a sentence or a table cell: format it as text.
- Several figures in one tile: use one tile per figure.
- A tile whose destination is unrelated to the figure: use a `Card`.

## Exports

| Name | Kind |
| --- | --- |
| `StatTile` | component |
| `computeStatDelta` | function |

## API

### `StatTile`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `ReactNode` | yes |  | What the figure measures. With `href` or `onClick` it is also the text of the tile's single link or button. |
| `value` | `ReactNode` | yes |  | The figure, already formatted. Pass an `AnimatedNumber` to count it up. |
| `tone` | `"neutral" \| "success" \| "warning" \| "danger"` | no | `"neutral"` | `warning` and `danger` tint the whole tile for a figure that needs attention. The label always says why. In the `row` layout only the start edge and the figure take the tone, so a column of rows does not turn into a block of colour. |
| `toneSurface` | `"fill" \| "none"` | no | `"fill"` | Where a `warning` or `danger` tone shows. `fill` (default) tints the whole tile. `none` keeps the plain card and puts the tone only on the accent dash and the figure, for a calm grid where a filled card would shout. |
| `layout` | `"tile" \| "row"` | no | `"tile"` | `tile` (default) stacks label, figure and hint. `row` puts the label and hint at the start and the figure at the end, one line high, for a dense list of figures on a phone; a link or button row also shows a trailing chevron. |
| `labelLines` | `number` | no |  | Lines of label height to hold, so the figures of a row of tiles sit on one line when their labels wrap differently. Set it to the most lines a label takes in the row. The same can be set per breakpoint with the `--lufia-stat-tile-label-lines` custom property on the grid. Ignored by the `row` layout. |
| `quiet` | `boolean` | no | `false` | Steps the figure back, for a value with nothing to act on (usually zero): it takes the muted text colour, which keeps at least 4.5:1 on the surface, and the tone no longer colours it. Pair it with the `neutral` tone. |
| `delta` | `ReactNode` | no |  | The change, already formatted ("+12% vs last week"). |
| `trend` | `"up" \| "down" \| "flat"` | no |  | Direction arrow shown before `delta`. The arrow is decorative: say the direction in `trendLabel` or in `delta`. |
| `trendLabel` | `string` | no |  | Direction in words for screen readers ("Up"). Read before `delta`. |
| `deltaTone` | `"neutral" \| "success" \| "warning" \| "danger"` | no | `"neutral"` | Colour of `delta`. A rise is not always good news, so it is independent of `trend`. |
| `hint` | `ReactNode` | no |  | A line of context under the figure. |
| `sparkline` | `ReactNode` | no |  | A chart beside the figure, usually a `Sparkline`. Give it `label={null}` or a label of its own. |
| `href` | `string` | no |  | Makes the whole tile a link: the label becomes the link and its hit area is stretched over the tile. |
| `onClick` | `MouseEventHandler<HTMLElement>` | no |  | Called on press. Alone, it makes the whole tile a button. Together with `href` it runs before navigation. |
| `pressed` | `boolean` | no |  | Turns a button tile into a toggle, for a row of tiles that filters a list: the button exposes `aria-pressed` and the tile shows a selected state (accent border and background, a thicker inset border and a check mark, so it is not colour alone). Ignored unless the tile is a button, so a link tile, a plain tile and a `loading` tile never get it. |
| `loading` | `boolean` | no | `false` | Shows skeletons in place of the figure, the change, the hint and the chart, and disables the link or button. Each skeleton has the line box of the content it stands for, so the loaded tile has exactly the same height. Pass the same `delta`, `hint` and `sparkline` you will pass once loaded (placeholders are fine): they decide which lines are held. |
| `loadingLabel` | `string` | no |  | Accessible name of the loading state ("Loading pending items"). Without it the skeleton is silent. |

Other native element attributes pass through to the root element.

### `computeStatDelta`

Computes the props of `StatTile` that describe a change against a previous period: `delta`, `trend`, `trendLabel` and `deltaTone`. Spread the result into the tile. Returns `null` when there is no previous value, so the tile shows no change until there is history. It is pure and locale-aware, so it is safe on the server. The default format is a percentage with one decimal under 10% and none above. On a zero or small base (`|previous|` below `minBase`) it switches to the absolute change, so a tile never says "+Infinity%" or "+400%" for going from 1 to 5. It also returns `null` when the change overflows.

```ts
computeStatDelta(input: StatDeltaInput): StatDelta | null
```

## Types

- `StatDelta`: `{ delta: string; trend: StatTileTrend; trendLabel: string; deltaTone: StatTileTone; }`
- `StatDeltaGoodDirection`: `"up" | "down" | "neutral"`
- `StatDeltaLabels`: `{ up: string; down: string; flat: string; comparison: string | ((change: string) => string); }`
- `StatTileLayout`: `"tile" | "row"`
- `StatTileTone`: `"neutral" | "success" | "warning" | "danger"`
- `StatTileToneSurface`: `"fill" | "none"`
- `StatTileTrend`: `"up" | "down" | "flat"`

## Example

```tsx
import { StatTile } from "@lufia/design-system/components/StatTile";
import { AnimatedNumber } from "@lufia/design-system/motion";
import { Sparkline } from "@lufia/design-system/components/Sparkline";

<StatTile
  label="Open items"
  value={<AnimatedNumber value={128} />}
  delta="12% vs last week"
  trend="up"
  trendLabel="Up"
  hint="Across all teams"
  sparkline={<Sparkline values={[3, 5, 4, 8, 6, 9, 12]} label={null} />}
  href="/items"
/>

<StatTile label="Open items" value="--" loading loadingLabel="Loading open items" />
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Tab | Interactive tile: focuses the link or button |
| Enter | Follows the link, or presses the button |
| Space | Presses the button |

- The accessible name of an interactive tile is its `label`. The figure, change and hint are its description.
- `trend` draws a decorative arrow. Say the direction in words with `trendLabel` ("Up") or inside `delta`, so the direction never rests on the arrow or the colour.
- `tone="warning"` and `"danger"` tint the tile (or, with `toneSurface="none"`, only the dash and the figure). The label and hint must say why it needs attention.
- `quiet` uses the muted text colour (at least 4.5:1 on the surface). Keep a quiet tile `neutral`: muted text on a tinted surface is not checked.
- While `loading`, the tile is `aria-busy`, the link or button is removed and each skeleton takes the line box of what it replaces (the figure, the change, the hint, the chart), so the loaded tile has exactly the same height. Pass the same `delta`, `hint` and `sparkline` while loading as you will once loaded: they decide which lines are held. Set `loadingLabel` to announce it once.
- With `pressed`, the button is a toggle: screen readers announce "Open items, toggle button, pressed". Name the filter in the `label`, not in the state.
- In `forced-colors` mode the border is `CanvasText` (`Highlight` when pressed, with the check mark) and the focus ring `Highlight`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-border`, `--lufia-color-status-danger-fg`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-border`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-display`, `--lufia-font-family-mono`, `--lufia-font-line-height-normal`, `--lufia-font-size-2xl`, `--lufia-font-size-2xs`, `--lufia-font-size-3xl`, `--lufia-font-size-sm`, `--lufia-font-size-xl`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-font-weight-semibold`, `--lufia-motion-distance-nudge`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-radius-md`, `--lufia-shadow-md`, `--lufia-shadow-sm`, `--lufia-stat-tile-label-color`, `--lufia-stat-tile-label-font`, `--lufia-stat-tile-label-lines`, `--lufia-stat-tile-label-size`, `--lufia-stat-tile-label-tracking`, `--lufia-stat-tile-row-value-size`, `--lufia-stat-tile-value-size`, `--lufia-stat-tile-value-size-narrow`, `--lufia-target-touch`.

## Stories

- `components-data-display-stattile--default`
- `components-data-display-stattile--themed-by-tokens`
- `components-data-display-stattile--with-delta`
- `components-data-display-stattile--falling-is-good`
- `components-data-display-stattile--computed-percent`
- `components-data-display-stattile--computed-small-base`
- `components-data-display-stattile--computed-flat`
- `components-data-display-stattile--computed-falling-is-good`
- `components-data-display-stattile--computed-no-history`
- `components-data-display-stattile--flat`
- `components-data-display-stattile--with-sparkline`
- `components-data-display-stattile--warning`
- `components-data-display-stattile--danger`
- `components-data-display-stattile--success`
- `components-data-display-stattile--as-link`
- `components-data-display-stattile--as-button`
- `components-data-display-stattile--as-filters`
- `components-data-display-stattile--loading`
- `components-data-display-stattile--loading-keeps-height`
- `components-data-display-stattile--long-label`
- `components-data-display-stattile--with-animated-number`
- `components-data-display-stattile--in-flex-row`
- `components-data-display-stattile--grid`
- `components-data-display-stattile--calm-grid`
- `components-data-display-stattile--narrow-labels-phone-320`
- `components-data-display-stattile--long-figure-phone-320`
- `components-data-display-stattile--phone-320`
- `components-data-display-stattile--right-to-left`
- `components-data-display-stattile--all-themes`
