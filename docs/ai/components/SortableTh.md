# SortableTh

> A table header cell that sorts a column and announces the order.

- Status: beta
- Category: Data display
- Import: `import { SortableTh } from "@lufia/design-system/components/SortableTh"`
- Also from: `@lufia/design-system`
- Source: [src/components/SortableTh](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/SortableTh)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-sortableth--docs)

## Purpose

A sortable table column header. It renders a `<th>` containing a real `<button>`, so the column can be sorted from the
keyboard, and keeps `aria-sort` on the `<th>`.

## When to use

- Table columns the user can reorder by.

## When not to use

- Columns that are not sortable (use a plain `<th scope="col">`) or card layouts without a header row.

## API

### `SortableTh`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `dir` | `"asc" \| "desc"` | yes |  |  |
| `label` | `string` | yes |  |  |
| `active` | `boolean` | yes |  | Whether the table is currently sorted by this column. |
| `onSort` | `() => void` | yes |  |  |

Other native element attributes pass through to the root element.

## Types

- `SortDirection`: `"asc" | "desc"`
- `SortableThProps`: `Omit<ThHTMLAttributes<HTMLTableCellElement>, "children" | "onClick"> & { label: string; active: boolean; dir: SortDirection; onSort: () => void; }`

## Example

```tsx
import { SortableTh } from "@lufia/design-system/components/SortableTh";

<SortableTh label="Name" active={sort.key === "name"} dir={sort.dir} onSort={() => toggle("name")} />;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Sortable table](https://www.w3.org/WAI/ARIA/apg/patterns/table/).

- Follows the WAI-ARIA Authoring Practices **sortable table** pattern: `aria-sort="ascending" | "descending" | "none"` is
- The direction arrow is `aria-hidden`; `aria-sort` is what assistive technology announces, so the arrow does not
- A visible focus ring (2px, `--lufia-color-focus-ring`) is always present and the target is at least 24px tall.
- The button inherits header typography, so it looks like plain text until focused.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-color-focus-ring`, `--lufia-radius-xs`.

## Content guidelines

`label` is the localised column name. Keep it to one or two words; the header does not wrap by default.

## Stories

- `components-data-display-sortableth--ascending`
- `components-data-display-sortableth--descending`
- `components-data-display-sortableth--inactive`
- `components-data-display-sortableth--interactive-sort`
- `components-data-display-sortableth--all-themes`
