# Badge

> A short status or count label in a semantic tone.

- Status: beta
- Category: Data display
- Import: `import { Badge, StatusBadge } from "@lufia/design-system/components/Badge"`
- Also from: `@lufia/design-system`
- Source: [src/components/Badge](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Badge)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-badge--docs)

## Purpose

A short, non-interactive label for a category, a count or the state of a record. `StatusBadge` is the same component with a
dot on by default.

## When to use

- A status in a table row, a card header or a detail page.
- A count or category next to a heading.

## When not to use

- A message that needs to be read now: use a toast or an alert.
- Anything clickable.
- Long sentences. Past two or three words, write text instead.

## Exports

| Name | Kind |
| --- | --- |
| `Badge` | component |
| `StatusBadge` | component |

## API

### `Badge`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  | The text. Always required: the tone never carries the meaning on its own (WCAG 1.4.1). |
| `tone` | `"neutral" \| "info" \| "success" \| "warning" \| "danger" \| "ai"` | no | `"neutral"` |  |
| `dot` | `boolean` | no | `false` | A small dot before the text, for statuses that read as a state rather than a label. Decorative. |

Other native element attributes pass through to the root element.

### `StatusBadge`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  | The text. Always required: the tone never carries the meaning on its own (WCAG 1.4.1). |
| `tone` | `"neutral" \| "info" \| "success" \| "warning" \| "danger" \| "ai"` | no |  |  |
| `dot` | `boolean` | no | `true` | A small dot before the text, for statuses that read as a state rather than a label. Decorative. |

Other native element attributes pass through to the root element.

## Types

- `BadgeProps`: `Omit<HTMLAttributes<HTMLSpanElement>, "children"> & { children: ReactNode; tone?: BadgeTone | undefined; dot?: boolean | undefined; }`
- `BadgeTone`: `"neutral" | "info" | "success" | "warning" | "danger" | "ai"`

## Example

```tsx
import { Badge, StatusBadge } from "@lufia/design-system/components/Badge";

<Badge tone="info">In review</Badge>
<StatusBadge tone="danger">Overdue</StatusBadge>
```

## Accessibility

Keyboard:

A badge is not interactive and takes no focus. If it needs to act, use a `Button` or `Link`.

- The text is always present and carries the meaning. The tone and the dot only reinforce it (WCAG 1.4.1), so never omit
- The dot is decorative and hidden from assistive technology.
- Every tone's text meets 4.5:1 on its own background in light and dark; the contrast check enforces the status pairs.
- In forced-colors mode the border and dot use system colours, so the shape remains.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-badge-radius`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-border-subtle`, `--lufia-color-status-ai-bg`, `--lufia-color-status-ai-border`, `--lufia-color-status-ai-fg`, `--lufia-color-status-danger-bg`, `--lufia-color-status-danger-border`, `--lufia-color-status-danger-fg`, `--lufia-color-status-neutral-bg`, `--lufia-color-status-neutral-fg`, `--lufia-color-status-success-bg`, `--lufia-color-status-success-border`, `--lufia-color-status-success-fg`, `--lufia-color-status-warning-bg`, `--lufia-color-status-warning-border`, `--lufia-color-status-warning-fg`, `--lufia-color-text-accent`, `--lufia-font-family-body`, `--lufia-font-line-height-normal`, `--lufia-font-size-xs`, `--lufia-font-weight-semibold`, `--lufia-radius-full`.

## Content guidelines

One to three words, sentence case ("In review", not "IN REVIEW"). Say the state, not the colour. Long text wraps instead of
truncating.

## Stories

- `components-data-display-badge--default`
- `components-data-display-badge--with-dot`
- `components-data-display-badge--status`
- `components-data-display-badge--long-text`
- `components-data-display-badge--all-tones`
- `components-data-display-badge--all-tones-with-dot`
- `components-data-display-badge--square-by-token`
- `components-data-display-badge--phone-320`
- `components-data-display-badge--all-themes`
