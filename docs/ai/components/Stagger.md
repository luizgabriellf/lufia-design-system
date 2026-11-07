# Stagger

> Children that enter one after another, capped in length and still under reduced motion.

- Status: beta
- Category: Motion
- Import: `import { Stagger } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/Stagger](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/Stagger)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-stagger--docs)

## Purpose

Children that enter in sequence on mount: each fades in and rises a few pixels, one step after the previous.

## When to use

- A grid of tiles or cards that appear together when a page opens.
- A short list entering after a skeleton.

## When not to use

- Long lists or tables: the stagger is capped, and a wall of motion is noise.
- Content people are already aiming at, such as controls that were visible before.
- A whole page changing: use `RouteTransition`.

## API

### `Stagger`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `limit` | `number` | no | `5` | How many children get their own step. Children after the limit enter together with the last one, so the whole sequence is at most `limit - 1` steps long (about 120 ms of delay at the default). Defaults to 5, and values above 8 are treated as 8, so the total delay stays short whatever is passed. |

Other native element attributes pass through to the root element.

## Types

- `StaggerProps`: `HTMLAttributes<HTMLDivElement> & { limit?: number | undefined; }`

## Example

```tsx
import { Stagger } from "@lufia/design-system/motion";

<Stagger style={{ display: "grid", gap: "0.75rem" }}>
  <StatTile label="Open" value="12" />
  <StatTile label="Overdue" value="4" />
  <StatTile label="Done" value="96%" />
</Stagger>;
```

## Accessibility

- Only `opacity` and `transform` move. The layout is final from the first frame, so nothing shifts (no layout shift) and focus order is untouched.
- Each step is a quarter of the instant duration token (about 30 ms), and children past `limit` enter together with the last step, so a long list never makes people wait: the default total is about 120 ms of delay plus the 240 ms enter.
- Under `prefers-reduced-motion` the children are simply there: no animation, no delay.
- Content is in the DOM and readable at once; screen readers are not affected by the entrance.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-distance-rise`, `--lufia-motion-duration-enter`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`.

## Stories

- `components-motion-stagger--default`
- `components-motion-stagger--long-list`
- `components-motion-stagger--low-limit`
- `components-motion-stagger--as-list`
- `components-motion-stagger--all-themes`
