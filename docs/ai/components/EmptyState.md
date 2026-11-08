# EmptyState

> What to show when a list or panel has nothing yet, with the one next step.

- Status: beta
- Category: Feedback
- Import: `import { EmptyState } from "@lufia/design-system/components/EmptyState"`
- Also from: `@lufia/design-system`
- Source: [src/components/EmptyState](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/EmptyState)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-feedback-emptystate--docs)

## Purpose

Placeholder for a list, table or panel that has nothing to show yet: an optional icon, a title, an explanation and a next
step.

## When to use

- First use (nothing created yet), and results that are empty after a search or filter.

## When not to use

- Errors (say what went wrong and how to recover instead) or loading states (use a skeleton or spinner).

## API

### `EmptyState`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `ReactNode` | no |  | Decorative illustration or icon (hidden from assistive technology). |
| `title` | `string` | yes |  |  |
| `body` | `string` | no |  |  |
| `action` | `ReactNode` | no |  | Next step, usually a button or link. |

Other native element attributes pass through to the root element.

## Types

- `EmptyStateProps`: `Omit<HTMLAttributes<HTMLDivElement>, "title"> & { icon?: ReactNode; title: string; body?: string | undefined; action?: ReactNode; }`

## Example

```tsx
import { EmptyState } from "@lufia/design-system/components/EmptyState";

<EmptyState
  title="No documents yet"
  body="Documents you upload will appear here."
  action={<a href="/upload">Upload document</a>}
/>;
```

## Accessibility

- The root is `role="status"`, a polite live region. When the empty state replaces a list after a filter changes, the new message is announced. If it is present on first render it is not announced, which is the right behaviour.
- The icon is decorative (`aria-hidden`). Never put essential information only in the icon.
- Title and body use the text and muted-text tokens, which pass AA on every surface.
- The action slot keeps the keyboard behaviour of the control you pass in.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-display`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-opacity-decorative`, `--lufia-space-1`, `--lufia-space-12`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-6`.

## Content guidelines

All strings are props. Keep the title under about 40 characters and the body to one or two sentences (the body is capped
at 340px wide for readability).

## Stories

- `components-feedback-emptystate--default`
- `components-feedback-emptystate--title-only`
- `components-feedback-emptystate--no-action`
- `components-feedback-emptystate--search-no-results`
- `components-feedback-emptystate--all-themes`
