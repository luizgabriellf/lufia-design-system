# ProgressBar

> A determinate progress bar with a native progressbar role.

- Status: beta
- Category: Data display
- Import: `import { ProgressBar } from "@lufia/design-system/components/ProgressBar"`
- Also from: `@lufia/design-system`
- Source: [src/components/ProgressBar](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/ProgressBar)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-progressbar--docs)

## Purpose

A determinate progress bar: a native `progressbar` role with its value, drawn as a track and a fill.

## When to use

- A known fraction of a whole: storage used, steps done, a quota.
- With `indeterminate`: a wait of a few seconds inside a panel or a step whose length is not known yet, where a bar fits the layout better than a ring.

## When not to use

- A wait inside a button or beside a line of text: use `Spinner`. Content that is about to appear in a known shape: use a `Skeleton`.
- A value against a target tick: use `BulletBar`.

## API

### `ProgressBar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | no |  | Current value, from 0 to `max`. Values outside the range are clamped. Left out only with `indeterminate`. |
| `indeterminate` | `false \| true` | no | `false` | The work has started and its length is not known: a short fill travels along the track and the bar states no value (`aria-valuenow` is absent, which is how assistive technology reads "busy"). Use it for a wait of a few seconds inside a panel; switch to `value` as soon as a fraction is known. Under reduced motion the fill stays in place and fades gently instead of travelling. |
| `max` | `number` | no | `100` | The value that means done. Defaults to 100. |
| `label` | `string` | yes |  | Accessible name of the bar ("Storage used"). Required: a progress bar without a name is announced as a bare number. |
| `valueText` | `string` | no |  | Spoken instead of the percentage when the number alone is not enough ("12 of 40 steps"). |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "neutral"` | no | `"accent"` |  |
| `size` | `"sm" \| "md"` | no | `"md"` |  |
| `animateChanges` | `boolean` | no | `false` | Animate later changes of `value` with a `transform: scaleX` transition. Off by default: `value` then applies at once. The fill keeps its full width and is scaled, so no layout property animates. A non-zero value never draws thinner than 2% of the track. The end cap is scaled with the fill, so it flattens slightly for small values. Removed under reduced motion. |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `indeterminate` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated.

##### `indeterminate: false`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `indeterminate` | `false` | no |  |
| `value` | `number` | yes | Current value, from 0 to `max`. Values outside the range are clamped. Left out only with `indeterminate`. |

##### `indeterminate: true`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `indeterminate` | `true` | yes | The work has started and its length is not known: a short fill travels along the track and the bar states no value (`aria-valuenow` is absent, which is how assistive technology reads "busy"). Use it for a wait of a few seconds inside a panel; switch to `value` as soon as a fraction is known. Under reduced motion the fill stays in place and fades gently instead of travelling. |
| `value` | `undefined` | no |  |

## Types

- `ProgressBarProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> & (ProgressBarValue & { max?: number | undefined; label: string; valueText?: string | undefined; tone?: ChartTone | undefined; size?: "sm" | "md" | undefined; animateChanges?: boolean | undefined; })`

## Example

```tsx
import { ProgressBar } from "@lufia/design-system/components/ProgressBar";

<ProgressBar value={45} label="Storage used" />
<ProgressBar value={12} max={40} label="Steps done" valueText="12 of 40 steps" />
```

## Accessibility

- `role="progressbar"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`. `label` is required: without a name a progress bar is announced as a bare number.
- Use `valueText` when the percentage alone says too little ("12 of 40 steps").
- It states a fraction, so print the figure beside it as text; colour alone must not carry a warning.
- The fill draws in once on mount and is removed under `prefers-reduced-motion`. Later changes of `value` apply at once by default. With `animateChanges` the fill keeps its full width and is scaled with a `transform` transition (`--lufia-motion-duration-enter`), never width; reduced motion applies the new value at once.
- With `indeterminate` the bar has no `aria-valuenow`, which assistive technology reads as busy with no known value; the name still says what is loading. A short fill travels along the track with a `transform` animation and mirrors in right-to-left. Under `prefers-reduced-motion` nothing travels: the fill covers the track and fades gently, so it still reads as work under way and not as done.
- In `forced-colors` mode the track gets a border and the fill is `Highlight`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-subtle`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-in-out`, `--lufia-motion-easing-out`, `--lufia-radius-full`.

## Stories

- `components-data-display-progressbar--default`
- `components-data-display-progressbar--small`
- `components-data-display-progressbar--empty`
- `components-data-display-progressbar--complete`
- `components-data-display-progressbar--warning`
- `components-data-display-progressbar--danger`
- `components-data-display-progressbar--custom-range`
- `components-data-display-progressbar--with-visible-figure`
- `components-data-display-progressbar--animated-changes`
- `components-data-display-progressbar--animated-at-rest`
- `components-data-display-progressbar--indeterminate`
- `components-data-display-progressbar--indeterminate-small`
- `components-data-display-progressbar--right-to-left`
- `components-data-display-progressbar--all-themes`
