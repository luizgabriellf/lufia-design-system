# SuccessCheck

> An animated check mark for a completed action.

- Status: beta
- Category: Feedback
- Import: `import { SuccessCheck } from "@lufia/design-system/components/SuccessCheck"`
- Also from: `@lufia/design-system`
- Source: [src/components/SuccessCheck](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SuccessCheck)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-successcheck--docs)

## Purpose

A check mark whose stroke draws in once as it appears. The shared "it worked" mark: toasts use it for the success tone.

## When to use

- Confirming that something completed, next to text that says what.

## When not to use

- As the only signal of success, or as a status icon in a list (it animates every time it mounts). Use a status badge.

## API

### `SuccessCheck`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | `number` | no | `16` | Rendered width and height, in px. |

Other native element attributes pass through to the root element.

## Types

- `SuccessCheckProps`: `Omit<SVGAttributes<SVGSVGElement>, "width" | "height" | "viewBox" | "children"> & { size?: number | undefined; }`

## Example

```tsx
import { SuccessCheck } from "@lufia/design-system/components/SuccessCheck";

<p style={{ color: "var(--lufia-color-status-success-fg)" }}>
  <SuccessCheck /> Changes saved
</p>;
```

## Accessibility

- Decorative: `aria-hidden="true"` and `focusable="false"`. The adjacent text carries the meaning, so the check is never
- The draw uses `--lufia-motion-duration-enter` and stops under `prefers-reduced-motion`, leaving the finished check.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-motion-duration-enter`, `--lufia-motion-easing-out`.

## Stories

- `components-feedback-successcheck--default`
- `components-feedback-successcheck--large`
- `components-feedback-successcheck--all-themes`
