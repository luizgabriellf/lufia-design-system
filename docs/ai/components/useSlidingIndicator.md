# useSlidingIndicator

> Measures the active item so an indicator can slide to it.

- Status: beta
- Category: Hooks
- Import: `import { useSlidingIndicator } from "@lufia/design-system/components/useSlidingIndicator"`
- Also from: `@lufia/design-system`
- Source: [src/components/useSlidingIndicator](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useSlidingIndicator)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-useslidingindicator--docs)

## Purpose

Slides a decorative indicator behind the active item of a tab-like row. Only `transform` animates; the items never move.

## When to use

- A small row of peer items where the chosen one should feel like it moved, not like it was swapped.

## When not to use

- Lists that wrap onto several lines or scroll in both axes: the indicator follows one box.

## API

### `useSlidingIndicator`

Slides a decorative indicator behind the active item of `container`. Only `transform` animates; the items themselves never move, so their markup, focus and state are untouched. - `container` must be `position: relative`; the indicator is `position: absolute` at its top-left corner. Positions are measured physical coordinates, so the indicator uses `left: 0` rather than a logical inset. - `activeSelector` finds the active item inside the container. `key` re-measures when it changes (usually the active id). - The indicator starts `hidden` (server render, no script): the active item keeps its own styling until the hook shows the indicator, and CSS can hand the chrome over with `:has(> .indicator:not([hidden]))`. - The slide is enabled by `data-ready` after the first position, so the indicator never glides in from the corner. A resize jumps to the new spot instead of sliding, which would leave it at the old layout's offset for a moment. Returns the ref to put on the indicator element. Give the indicator a `transition` on `transform` under `[data-ready]`, with `--lufia-motion-*` tokens.

```ts
useSlidingIndicator(container: RefObject<HTMLElement | null>, activeSelector: string, key: unknown, { stretch }?: UseSlidingIndicatorOptions): RefObject<HTMLSpanElement | null>
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `container` | `RefObject<HTMLElement \| null>` | yes |  |
| `activeSelector` | `string` | yes |  |
| `key` | `unknown` | yes |  |
| `__3` | `UseSlidingIndicatorOptions` | no |  |

## Types

- `UseSlidingIndicatorOptions`: `{ stretch?: boolean | undefined; }`

## Example

```tsx
import { useSlidingIndicator } from "@lufia/design-system/components/useSlidingIndicator";

const nav = useRef<HTMLElement>(null);
const indicator = useSlidingIndicator(nav, `[data-key="${active}"]`, active);

<nav ref={nav} style={{ position: "relative" }}>
  {/* the items, one with data-key={active} */}
  <span ref={indicator} className={styles.indicator} hidden aria-hidden="true" />
</nav>;
```

## Accessibility

- The indicator is decorative: give it `aria-hidden="true"`. State stays on the items (`aria-current`, `aria-pressed`).
- It starts `hidden`, so with no script or before the first measure the active item keeps its own styling.
- The slide is switched on one frame after the first position, so it never glides in from the corner. A resize jumps
- Positions are measured, physical coordinates; the indicator uses `left: 0` on purpose and follows the items in RTL

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-useslidingindicator--default`
- `hooks-useslidingindicator--stretch`
- `hooks-useslidingindicator--all-themes`
