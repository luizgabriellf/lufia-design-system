# TableToolbar

> The search, filter and action row above a table.

- Status: beta
- Category: Data display
- Import: `import { TableToolbar } from "@lufia/design-system/components/TableToolbar"`
- Also from: `@lufia/design-system`
- Source: [src/components/TableToolbar](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/TableToolbar)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-tabletoolbar--docs)

## Purpose

Filter chips plus an optional search box for the top of a table or list. Extra controls (for example a dropdown for an
open-ended filter) go in as children.

## When to use

- Narrowing a list by a handful of mutually exclusive statuses, and free-text search.

## When not to use

- Many-valued filters (use a dropdown in `children`) or multi-select faceting (a different pattern).

## API

### `TableToolbar`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `filters` | `FilterOption[]` | no |  |  |
| `activeFilter` | `string` | no |  |  |
| `onFilterChange` | `((key: string) => void)` | no |  |  |
| `search` | `string` | no |  |  |
| `onSearchChange` | `((value: string) => void)` | no |  | The search field renders only when this handler is provided. |
| `searchPlaceholder` | `string` | no |  |  |
| `clearSearchLabel` | `string` | no | `"Clear search"` | Accessible name of the search field's clear button. Required whenever search is shown. |
| `variant` | `"inline" \| "standalone"` | no | `"inline"` | Layout variant: "inline" sits inside a surface (bottom border); "standalone" has outer spacing. |
| `children` | `ReactNode` | no |  | Extra controls, such as dropdowns for open-ended lists, rendered before the search box. |

Other native element attributes pass through to the root element.

## Example

```tsx
import { TableToolbar } from "@lufia/design-system/components/TableToolbar";

<TableToolbar
  filters={[
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
  ]}
  activeFilter={filter}
  onFilterChange={setFilter}
  search={query}
  onSearchChange={setQuery}
  searchPlaceholder="Search items"
  clearSearchLabel="Clear search"
/>;
```

## Accessibility

- Chips are toggle buttons with `aria-pressed`; the group has `role="group"` (add `aria-label` through props to name it).
- The search input is `type="search"` and named by its placeholder text. **Always pass `searchPlaceholder`** (localised);
- The search wrapper shows the focus ring through `:focus-within`, so the native outline is replaced, never removed.
- Chips are at least 44px tall on coarse pointers and narrow screens; the row wraps instead of scrolling at 320px.

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-color-text-subtle`, `--lufia-font-family-mono`, `--lufia-motion-duration-instant`, `--lufia-radius-md`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`.

## Content guidelines

Chip labels are one or two words. Do not put counts in colour alone; include them in the label text if useful.

## Stories

- `components-data-display-tabletoolbar--default`
- `components-data-display-tabletoolbar--with-search-value`
- `components-data-display-tabletoolbar--filters-only`
- `components-data-display-tabletoolbar--search-only`
- `components-data-display-tabletoolbar--standalone`
- `components-data-display-tabletoolbar--with-extra-controls`
- `components-data-display-tabletoolbar--many-filters`
- `components-data-display-tabletoolbar--interactive`
- `components-data-display-tabletoolbar--all-themes`
