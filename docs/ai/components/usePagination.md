# usePagination

> Computes the page range with ellipses for a paginator.

- Status: beta
- Category: Hooks
- Import: `import { DEFAULT_PAGE_SIZE, usePagination } from "@lufia/design-system/components/usePagination"`
- Also from: `@lufia/design-system`
- Source: [src/components/usePagination](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/usePagination)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/hooks-usepagination--docs)

## Purpose

State for paginating a list that is already in memory: the visible slice, the page, and previous/next handlers.

## When to use

- Tables and lists of up to a few thousand rows that the client already holds.

## When not to use

- Server-paginated data: keep the page in the URL and fetch it. This hook slices, it does not fetch.

## Exports

| Name | Kind |
| --- | --- |
| `DEFAULT_PAGE_SIZE` | constant |
| `usePagination` | hook |

## API

### `usePagination`

Client-side pagination of an in-memory list. Page numbers start at 1. Resets to page 1 when `resetKey` changes (pass the active filter or query), and stays inside the valid range when the list shrinks.

```ts
usePagination<T>(items: readonly T[], pageSize?: number, resetKey?: string): { page: number; pageSize: number; total: number; totalPages: number; slice: T[]; setPage: Dispatch<SetStateAction<number>>; hasPrev: boolean; hasNext: boolean; goPrev: () => void; goNext: () => void; show: boolean; }
```

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `items` | `readonly T[]` | yes |  |
| `pageSize` | `number` | no |  |
| `resetKey` | `string` | no |  |

Returned members:

| Member | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | `number` | yes |  |
| `pageSize` | `number` | yes |  |
| `total` | `number` | yes |  |
| `totalPages` | `number` | yes |  |
| `slice` | `T[]` | yes |  |
| `setPage` | `Dispatch<SetStateAction<number>>` | yes |  |
| `hasPrev` | `boolean` | yes |  |
| `hasNext` | `boolean` | yes |  |
| `goPrev` | `() => void` | yes |  |
| `goNext` | `() => void` | yes |  |
| `show` | `boolean` | yes | False when everything fits on one page, so a pager can be left out. |

## Example

```tsx
import { usePagination } from "@lufia/design-system/components/usePagination";

const { slice, page, totalPages, hasPrev, hasNext, goPrev, goNext, show } = usePagination(rows, 10, filter);
```

## Accessibility

- Render the controls in a `nav` with a label, disable (not hide) Previous/Next at the ends, and announce the position with a polite live region ("Page 2 of 3").
- The page is clamped, so a list that shrinks while on the last page shows the new last page instead of an empty one.
- When the page changes, keep keyboard focus on the control that was activated; do not move it into the list.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Its stylesheet reads no `--lufia-*` tokens directly (no CSS module, or it composes other components).

## Stories

- `hooks-usepagination--default`
- `hooks-usepagination--single-page`
