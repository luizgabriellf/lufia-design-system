# ChangeHighlight

> Briefly highlights content that changed, so the change is noticed.

- Status: beta
- Category: Motion
- Import: `import { ChangeHighlight } from "@lufia/design-system/motion"`
- Also from: `@lufia/design-system`
- Source: [src/motion/ChangeHighlight](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/motion/ChangeHighlight)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-motion-changehighlight--docs)

## Purpose

Flashes a soft background behind its children when `value` changes while they are on screen. Never on mount.

## When to use

- A value that updates by itself (polling, live data, a result of another action) and the person should notice where.

## When not to use

- Values the person just typed or chose: they already know.
- Whole rows or tables that refresh together. Highlight the cell that changed.

## API

### `ChangeHighlight`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | `string \| number \| boolean \| null` | yes |  | Anything comparable. The highlight plays when this changes between renders, never on mount. |

Other native element attributes pass through to the root element.

## Types

- `ChangeHighlightProps`: `HTMLAttributes<HTMLSpanElement> & { value: string | number | boolean | null | undefined; }`

## Example

```tsx
import { ChangeHighlight } from "@lufia/design-system/motion";

<ChangeHighlight value={order.status}>
  <Badge>{order.statusLabel}</Badge>
</ChangeHighlight>;
```

## Accessibility

- Decoration only. It is not announced and carries no meaning by itself: if the change matters, make it readable in
- It does not play under `prefers-reduced-motion`, and is removed in `forced-colors` mode.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-color-accent-subtle`, `--lufia-motion-duration-slow`, `--lufia-motion-easing-out`, `--lufia-radius-xs`.

## Stories

- `components-motion-changehighlight--default`
- `components-motion-changehighlight--all-themes`
