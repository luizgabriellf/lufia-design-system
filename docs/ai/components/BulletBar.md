# BulletBar

> A value as a bar against a target tick, comparable across rows.

- Status: beta
- Category: Data display
- Import: `import { BulletBar } from "@lufia/design-system/components/BulletBar"`
- Also from: `@lufia/design-system`
- Source: [src/components/BulletBar](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/BulletBar)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-bulletbar--docs)

## Purpose

A value as a bar against a target tick. The scale is the target, so the tick sits in the same place on every row and rows compare at a glance.

## When to use

- Progress against a target, repeated on several rows.
- A value that can pass its target.

## When not to use

- A single completion fraction with no target tick: use `ProgressBar`.
- Anything that needs exact values: print them.

## API

### `BulletBar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `number` | yes |  |  |
| `target` | `number` | yes |  | Where the tick sits. The scale is the target, so bars of different rows share one "percent of target" axis. |
| `headroom` | `number` | no | `1.25` | Room past the target, as a multiple of it. Defaults to 1.25. |
| `tone` | `"accent" \| "success" \| "warning" \| "danger" \| "neutral"` | no | `"accent"` |  |
| `label` | `string \| null` | yes |  | Accessible name stating the value, the target and what they mean ("Delivered 80 of 100"). Pass `null` to hide the drawing from assistive technology, only when the numbers are printed as text next to it. |

Other native element attributes pass through to the root element.

## Types

- `BulletBarProps`: `Omit<HTMLAttributes<HTMLSpanElement>, "children" | "role" | "aria-label"> & { value: number; target: number; headroom?: number | undefined; tone?: ChartTone | undefined; label: string | null; }`

## Example

```tsx
import { BulletBar } from "@lufia/design-system/components/BulletBar";

<BulletBar value={80} target={100} label="Delivered 80 of 100" />;
```

## Accessibility

- `label` is required: `role="img"` named by a sentence with the value, the target and what they mean. Pass `null` to hide the bar only when those numbers are printed as text next to it.
- The tick is a dark mark, not a colour: it reads without colour vision.
- The draw-in is `transform` only and plays once, on mount; it is removed under `prefers-reduced-motion`.
- In `forced-colors` mode the fill is `Highlight` and the tick `CanvasText`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-border-subtle`, `--lufia-color-status-danger-solid`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-fg`, `--lufia-color-text-default`, `--lufia-color-text-subtle`, `--lufia-motion-duration-medium`, `--lufia-motion-easing-out`, `--lufia-radius-full`, `--lufia-radius-xs`.

## Stories

- `components-data-display-bulletbar--default`
- `components-data-display-bulletbar--over-target`
- `components-data-display-bulletbar--far-over-target`
- `components-data-display-bulletbar--empty`
- `components-data-display-bulletbar--no-target`
- `components-data-display-bulletbar--rows`
- `components-data-display-bulletbar--right-to-left`
- `components-data-display-bulletbar--all-themes`
