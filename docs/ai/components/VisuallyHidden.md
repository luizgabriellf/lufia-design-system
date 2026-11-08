# VisuallyHidden

> Hides text visually and keeps it for assistive technology.

- Status: beta
- Category: Utilities
- Import: `import { VisuallyHidden } from "@lufia/design-system/components/VisuallyHidden"`
- Also from: `@lufia/design-system`
- Source: [src/components/VisuallyHidden](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/VisuallyHidden)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-utilities-visuallyhidden--docs)

## Purpose

Text for assistive technology that is not drawn on screen.

## When to use

- A longer or more specific name than the visible text (which row does "Delete" act on?).
- Status text announced from a live region without a visible counterpart.

## When not to use

- Instead of `aria-label` on an element that has no text of its own: the attribute is simpler.
- To hide content that should be visible. Never put focusable elements inside it: they would be reachable but invisible.

## API

### `VisuallyHidden`

No props of its own. Native element attributes pass through.

## Types

- `VisuallyHiddenProps`: `HTMLAttributes<HTMLSpanElement>`

## Example

```tsx
import { VisuallyHidden } from "@lufia/design-system/components/VisuallyHidden";

<button type="button">
  <span aria-hidden="true">Delete</span>
  <VisuallyHidden>Delete invoice 2041</VisuallyHidden>
</button>;
```

## Accessibility

- It uses the clip pattern (not `display: none`), so the text stays in the accessibility tree.
- WCAG 2.5.3 (Label in Name): when the visible label differs from the accessible name, the accessible name must contain the visible text.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `components-utilities-visuallyhidden--default`
- `components-utilities-visuallyhidden--all-themes`
