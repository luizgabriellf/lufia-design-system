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

## When not to use

- Work of unknown length: use a spinner or a `Skeleton`.
- A value against a target tick: use `BulletBar`.

## API

### `ProgressBar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | yes |  | Current value, from 0 to `max`. Values outside the range are clamped. |
| `max` | `number` | no | `100` | The value that means done. Defaults to 100. |
| `label` | `string` | yes |  | Accessible name of the bar ("Storage used"). Required: a progress bar without a name is announced as a bare number. |
| `valueText` | `string` | no |  | Spoken instead of the percentage when the number alone is not enough ("12 of 40 steps"). |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "neutral"` | no | `"accent"` |  |
| `size` | `"sm" \| "md"` | no | `"md"` |  |

Other native element attributes pass through to the root element.

## Types

- `ProgressBarProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children" | "role"> & { value: number; max?: number | undefined; label: string; valueText?: string | undefined; tone?: ChartTone | undefined; size?: "sm" | "md" | undefined; }`

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
- The fill draws in once on mount and is removed under `prefers-reduced-motion`. Later changes of `value` apply at once, because animating width would move layout.
- In `forced-colors` mode the track gets a border and the fill is `Highlight`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-subtle`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`, `--lufia-radius-full`.

## Stories

- `components-data-display-progressbar--default`
- `components-data-display-progressbar--small`
- `components-data-display-progressbar--empty`
- `components-data-display-progressbar--complete`
- `components-data-display-progressbar--warning`
- `components-data-display-progressbar--danger`
- `components-data-display-progressbar--custom-range`
- `components-data-display-progressbar--with-visible-figure`
- `components-data-display-progressbar--right-to-left`
- `components-data-display-progressbar--all-themes`
