# Pagination

> Previous, next and numbered pages for long lists.

- Status: beta
- Category: Navigation
- Import: `import { Pagination } from "@lufia/design-system/components/Pagination"`
- Also from: `@lufia/design-system`
- Source: [src/components/Pagination](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Pagination)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-pagination--docs)

## Purpose

Page navigation for a list or table: previous and next, numbered pages that collapse into an ellipsis, and a status line.
It is the view for `usePagination`.

## When to use

- Long lists or tables that are paged. Prefer it to infinite scroll when people need to return to a position.

## When not to use

- Fewer than two pages, or feeds without a known end.

## API

### `Pagination`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `page` | `number` | yes |  | Current page, starting at 1. Controlled. |
| `totalPages` | `number` | yes |  |  |
| `total` | `number` | no |  | Total item count, handed to `labels.summary`. |
| `onPageChange` | `(page: number) => void` | yes |  |  |
| `hrefFor` | `((page: number) => string)` | no |  | Makes every control a real link (through the configured `linkComponent`) so pages can be opened in a new tab and crawled. `onPageChange` still fires on a plain click; call `event.preventDefault()` there to handle it in place. |
| `siblingCount` | `number` | no | `1` | Page numbers shown on each side of the current one. Default 1. |
| `labels` | `PaginationLabels` | yes |  |  |
| `variant` | `"default" \| "compact"` | no | `"default"` | `default` shows the numbered pages (they give way to previous and next in containers under 40rem). `compact` is previous and next only, with the status line; the status line then carries the position at every width. |
| `buttonClassName` | `string` | no |  | A class for every control (previous, next and the page numbers), for an app that already has a button look. When set, the built-in control look is left out (layout, the current-page and disabled states stay), so your class is not fighting it. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { Pagination } from "@lufia/design-system/components/Pagination";
import { usePagination } from "@lufia/design-system/components/usePagination";

const { slice, page, totalPages, total, setPage } = usePagination(rows, 10);

<Pagination
  page={page}
  totalPages={totalPages}
  total={total}
  onPageChange={setPage}
  labels={{
    nav: "Results",
    previous: "Previous",
    next: "Next",
    page: (n) => `Page ${n}`,
    summary: (n, count, all) => `Page ${n} of ${count}, ${all} results`,
  }}
/>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves between previous, the page numbers and next |
| Enter (and Space on buttons) | Goes to the focused page |

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-size-sm`, `--lufia-font-weight-semibold`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-opacity-disabled`, `--lufia-radius-control`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`.

## Content guidelines

Keep the status line short and say what is paged: "Page 3 of 12, 118 results".

## Stories

- `components-navigation-pagination--default`
- `components-navigation-pagination--first-page`
- `components-navigation-pagination--last-page`
- `components-navigation-pagination--few-pages`
- `components-navigation-pagination--many-pages`
- `components-navigation-pagination--without-total`
- `components-navigation-pagination--more-siblings`
- `components-navigation-pagination--compact`
- `components-navigation-pagination--compact-links`
- `components-navigation-pagination--custom-button-class`
- `components-navigation-pagination--as-links`
- `components-navigation-pagination--phone-320`
- `components-navigation-pagination--phone-390`
- `components-navigation-pagination--with-use-pagination`
- `components-navigation-pagination--all-themes`
