# FilterLinks

> A labelled row of links that each apply a filter to one list through the URL, with an optional count.

- Status: beta
- Category: Navigation
- Import: `import { FilterLinks } from "@lufia/design-system/components/FilterLinks"`
- Also from: `@lufia/design-system`
- Source: [src/components/FilterLinks](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/FilterLinks)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-navigation-filterlinks--docs)

## Purpose

A labelled row of links that each apply a different filter to one list, such as "All", "Open" and "Closed", with an optional
count. The filter lives in the URL, so every chip is a real link and the current one is marked `aria-current="true"`.

## When to use

- Chips that narrow one list through the URL (a query string or a path), with an optional count.

## When not to use

- Views of a page that each have their own content: `Tabs` or `PeerNav` in links mode.
- Filters applied in the browser without changing the URL: the filter chips of `TableToolbar`.
- A choice between display modes of the same data: `SegmentedToggle`.

## API

### `FilterLinks`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | yes |  | Accessible name of the group ("Filter by status"). Required: a page can have more than one navigation. |
| `items` | `readonly FilterLinksItem[]` | yes |  |  |
| `value` | `string` | no |  | Key of the current filter. Its link gets `aria-current="true"`. Leave it out when none is current. |
| `layout` | `"wrap" \| "grid"` | no | `"wrap"` | `"wrap"` (default) keeps each chip as wide as its text. `"grid"` lays the chips out in equal columns, each chip filling its cell with the label at the start and the count at the end: use it for many filters with counts, where ragged widths are hard to scan. The narrowest column is `--lufia-filter-links-column-min` (default `9rem`). |
| `ref` | `Ref<HTMLElement>` | no |  |  |

Other native element attributes pass through to the root element.

## Types

- `FilterLinksItem`: `{ key: string; label: ReactNode; href: string; count?: ReactNode; native?: boolean | undefined; }`
- `FilterLinksProps`: `Omit<HTMLAttributes<HTMLElement>, "children"> & { label: string; items: readonly FilterLinksItem[]; value?: string | undefined; layout?: "wrap" | "grid" | undefined; ref?: Ref<HTMLElement> | undefined; }`

## Example

```tsx
import { FilterLinks } from "@lufia/design-system/components/FilterLinks";

<FilterLinks
  label="Filter by status"
  value="open"
  items={[
    { key: "all", label: "All", href: "?status=all", count: 128 },
    { key: "open", label: "Open", href: "?status=open", count: 42 },
    { key: "resolved", label: "Resolved", href: "?status=resolved", count: 79 },
  ]}
/>;
```

## Accessibility

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves between the links |
| Enter | Follows the focused link (the browser's own) |

- A `<nav>` with the `label` as its name, around a list of links. Give a `label` that says what is filtered.
- The current filter has `aria-current="true"`, not `"page"`: the page is the same, only the filter changes. It also differs by weight and border, so it reads without colour. The focus ring is visible and kept in `forced-colors` mode.
- Chips are at least 2rem tall, and 2.75rem (`--lufia-target-touch`) under a coarse pointer.
- Colour changes are the only transition and are removed under `prefers-reduced-motion`.

## Motion

Its stylesheet has a `prefers-reduced-motion` branch.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-border`, `--lufia-color-accent-subtle`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-accent`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-filter-links-column-min`, `--lufia-filter-links-current-bg`, `--lufia-filter-links-current-border`, `--lufia-filter-links-current-color`, `--lufia-filter-links-focus-width`, `--lufia-filter-links-gap`, `--lufia-filter-links-min-block-size`, `--lufia-filter-links-radius`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-font-weight-medium`, `--lufia-motion-duration-instant`, `--lufia-motion-easing-out`, `--lufia-motion-scale-press-subtle`, `--lufia-radius-md`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-target-touch`.

## Content guidelines

Labels are one or two words, in sentence case. Keep counts short.

## Stories

- `components-navigation-filterlinks--default`
- `components-navigation-filterlinks--without-counts`
- `components-navigation-filterlinks--none-current`
- `components-navigation-filterlinks--native-item`
- `components-navigation-filterlinks--wrapping`
- `components-navigation-filterlinks--grid`
- `components-navigation-filterlinks--grid-phone-320`
- `components-navigation-filterlinks--phone-320`
- `components-navigation-filterlinks--right-to-left`
- `components-navigation-filterlinks--all-themes`
