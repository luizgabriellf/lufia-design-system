# useMediaQuery

> Subscribes a component to a CSS media query, safe for server rendering.

- Status: beta
- Category: Hooks
- Import: `import { useMediaQuery } from "@lufia/design-system/components/useMediaQuery"`
- Also from: `@lufia/design-system`
- Source: [src/components/useMediaQuery](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/useMediaQuery)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usemediaquery--docs)

## Purpose

Whether a CSS media query matches right now, updated when it changes. Safe to server-render.

## When to use

- Behaviour that depends on the viewport or the input device: choosing a different interaction, not a different look.

## When not to use

- Styling. A CSS media or container query has no flash, no hydration pass and no JavaScript.
- Reduced motion. Use `usePrefersReducedMotion`.

## API

### `useMediaQuery`

Whether a CSS media query currently matches, following changes. SSR-safe: the server renders `defaultValue`, and React re-reads the real value on hydration without a mismatch warning. Without `matchMedia` it returns `defaultValue`. Prefer CSS media queries for styling; use this when behaviour, not appearance, depends on the viewport.

```ts
useMediaQuery(query: string, { defaultValue }?: UseMediaQueryOptions): boolean
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `query` | `string` | yes |  |
| `__1` | `UseMediaQueryOptions` | no |  |

## Example

```tsx
import { useMediaQuery } from "@lufia/design-system/components/useMediaQuery";

const compact = useMediaQuery("(max-width: 40rem)");
const finePointer = useMediaQuery("(pointer: fine)", { defaultValue: true });
```

## Accessibility

- The server cannot know the query, so it renders `defaultValue` (default `false`). On the client React re-reads the real
- Do not hide content from assistive technology based on a media query; hide it with CSS so the accessibility tree and

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usemediaquery--narrow`
- `hooks-usemediaquery--dark-colour-scheme`
- `hooks-usemediaquery--hover-capable`
