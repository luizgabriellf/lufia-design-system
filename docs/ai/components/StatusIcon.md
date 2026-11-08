# StatusIcon

> One family of status markers, each tone with its own shape so it reads without colour.

- Status: beta
- Category: Feedback
- Import: `import { STATUS_TONES, StatusIcon } from "@lufia/design-system/components/StatusIcon"`
- Also from: `@lufia/design-system`
- Source: [src/components/StatusIcon](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/StatusIcon)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-statusicon--docs)

## Purpose

One family of status markers. Each tone has its own shape, so the status reads without colour. The same glyphs are used by
`Toast`, the field error of `FormField`, `DetailAttentionCard`, `StatusTimeline` and `Stepper`.

## When to use

- Next to the text of a status: a message, a row state, a timeline node.

## When not to use

- For an action or an object: use a named icon from the set.
- As the only signal: pair it with text, or give it a `label`.

## Exports

| Name | Kind |
| --- | --- |
| `STATUS_TONES` | constant |
| `StatusIcon` | component |

## API

### `StatusIcon`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `tone` | `"success" \| "warning" \| "danger" \| "info" \| "pending" \| "neutral" \| "needsInput"` | yes |  | The status. Each tone has its own shape, so it reads without colour (WCAG 1.4.1). |
| `variant` | `"bare" \| "ring" \| "mark"` | no | `"bare"` | `bare` (default): the outlined glyph alone, in the tone colour; for inline messages. `ring`: the inner mark on a tinted disc with a tone border; for toasts, cards and timelines. `mark`: the inner mark alone in `currentColor`, for a host that draws its own container (a stepper dot). |
| `size` | `"sm" \| "md" \| "lg"` | no | `"md"` | `sm`, `md` (default) or `lg`. A bare glyph or a mark is 16, 20 or 24px (`--lufia-icon-size-*`); a ring is 20, 24 or 32px, and `--lufia-status-icon-size` overrides its diameter. |
| `label` | `string` | no |  | Names the status for assistive technology (`role="img"`). Leave it out when visible text next to the icon already names the status: the icon is then decorative. |
| `drawOn` | `boolean` | no | `false` | Draw the glyph's strokes in once when it mounts, the motion of `SuccessCheck` (for a toast or a confirmation that has just appeared). Under `prefers-reduced-motion` the glyph is simply drawn. Default `false`. |

Other native element attributes pass through to the root element.

## Types

- `StatusIconProps`: `Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { tone: StatusTone; variant?: "bare" | "ring" | "mark" | undefined; size?: "sm" | "md" | "lg" | undefined; label?: string | undefined; drawOn?: boolean | undefined; }`
- `StatusTone`: `"success" | "warning" | "danger" | "info" | "pending" | "neutral" | "needsInput"`

## Example

```tsx
import { StatusIcon } from "@lufia/design-system/icons";

<StatusIcon tone="danger" size="sm" />
<StatusIcon tone="success" variant="ring" />
<StatusIcon tone="pending" variant="ring" label="Pending" />
```

## Accessibility

- Decorative by default (`aria-hidden`): text next to it names the status.
- `label` makes it an image with that name (`role="img"`), for a marker that stands alone.
- The tone never relies on colour alone (WCAG 1.4.1): each tone has its own shape.
- The ring colours are the status tokens, mapped to system colours under `forced-colors`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-border-strong`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-border`, `--lufia-color-status-danger-fg`, `--lufia-color-status-neutral-bg`, `--lufia-color-status-neutral-fg`, `--lufia-color-status-success-bg`, `--lufia-color-status-success-border`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-border`, `--lufia-color-status-warning-fg`, `--lufia-color-text-accent`, `--lufia-motion-duration-enter`, `--lufia-motion-easing-out`, `--lufia-radius-full`, `--lufia-status-icon-mark-stroke`, `--lufia-status-icon-ring-border-width`, `--lufia-status-icon-size`.

## Stories

- `components-feedback-statusicon--default`
- `components-feedback-statusicon--tones`
- `components-feedback-statusicon--sizes`
- `components-feedback-statusicon--labelled`
- `components-feedback-statusicon--all-themes`
