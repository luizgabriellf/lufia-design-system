# Table

> A data table that scrolls sideways with edge shadows and turns into cards on narrow widths, with clickable rows and an empty state.

- Status: beta
- Category: Data display
- Import: `import { Table, TableBody, TableEmpty, TableHead, TableRow, Td, Th } from "@lufia/design-system/components/Table"`
- Also from: `@lufia/design-system`
- Source: [src/components/Table](https://github.com/luizgabriellf/lufia-design-system/blob/main/src/components/Table)
- Storybook: [docs](https://luizgabriellf.github.io/lufia-design-system/?path=/docs/components-data-display-table--docs)

## Purpose

A data table built from native table elements, styled with CSS only. It scrolls sideways with a shadow on each edge that
has more to see, sets its headers in small monospace capitals and, when its own width is under 40rem, becomes a list
of cards. It holds no state: sorting, filtering and paging stay with the app, which hands in the rows.

## When to use

- Records with several attributes that people compare, scan or open.

## When not to use

- A layout (use CSS grid) or a short list of one value per line (use `DetailList` or a list).
- Data that needs cell editing, selection, a virtual window of many thousand rows or a column model. This is the presentation of a table, not a data grid.

## Exports

| Name | Kind |
| --- | --- |
| `Table` | component |
| `TableBody` | component |
| `TableEmpty` | component |
| `TableHead` | component |
| `TableRow` | component |
| `Td` | component |
| `Th` | component |

## API

### `Table`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | `ReactNode` | yes |  | `TableHead` and `TableBody`. |
| `caption` | `string` | yes |  | The table's accessible name ("Projects"), and the name of the scrollable region around it. It is a real `<caption>`, visually hidden unless `showCaption` is set. |
| `showCaption` | `boolean` | no | `false` | Show the caption above the table instead of hiding it visually. |
| `responsive` | `"scroll" \| "cards"` | no | `"cards"` | What the table does when its own width is under 40rem. `cards` (default) turns every row into a card: the header row is hidden visually, the first cell becomes the title and each other cell shows its `label`. `scroll` keeps the table and scrolls it sideways, with a shadow on each edge that has more to see. |
| `density` | `"compact" \| "comfortable"` | no | `"comfortable"` | Row padding. Default `comfortable`. |
| `footer` | `ReactNode` | no |  | Hosts a `Pagination` (or any footer) under the rows. It is not part of the scrolling area. |
| `tableClassName` | `string` | no |  | Class for the `<table>` element; `className` goes to the outer wrapper. |

Other native element attributes pass through to the root element.

### `TableBody`, `TableHead`, `TableRow`

No props of its own. Native element attributes pass through.

### `TableEmpty`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `ReactNode` | no |  | Decorative illustration or icon (hidden from assistive technology). |
| `title` | `string` | yes |  |  |
| `body` | `string` | no |  |  |
| `action` | `ReactNode` | no |  | Next step, usually a button or link. |
| `colSpan` | `number` | yes |  | The number of columns, so the message spans the whole row. |

Other native element attributes pass through to the root element.

### `Td`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | no |  | The column's name, shown before the value in card mode ("Status"). Use the same text as the column header. Without it the value takes the whole line. Not shown for a `primary` or `actions` cell. |
| `numeric` | `boolean` | no |  | Right-aligned digits in tabular figures. |
| `primary` | `boolean` | no |  | The row's identity: bolder, and the title of the card. Usually the first cell. |
| `actions` | `boolean` | no |  | The row's buttons and links, laid out in a wrapping row. Never activates the row. |
| `href` | `string` | no |  | Makes the row a link. The cell's content becomes a real link (through the `linkComponent` of `LufiaProvider`) whose click area is stretched over the whole row, so it can be opened in a new tab and is announced as a link. Interactive children of other cells (buttons, links) stay on top and do their own thing. One per row. |
| `onActivate` | `(event: MouseEvent<HTMLElement, MouseEvent>) => void` | no |  | Called when the row is activated. With `href` it is the link's click handler (call `event.preventDefault()` to handle the navigation yourself). Without `href` the cell's content becomes a real `<button>` stretched over the row, which Enter and Space both activate. One per row. Needs a Client Component, since it passes a function. |

Other native element attributes pass through to the root element.

### `Th`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `numeric` | `boolean` | no |  | Right-aligned digits in tabular figures: use it on the header of a numeric column, with `numeric` on its cells. |

Other native element attributes pass through to the root element.

## Types

- `TableEmptyProps`: `Omit<HTMLAttributes<HTMLDivElement>, "title"> & { icon?: ReactNode; title: string; body?: string | undefined; action?: ReactNode; } & { colSpan: number; }`
- `TableProps`: `Omit<HTMLAttributes<HTMLDivElement>, "children"> & { children: ReactNode; caption: string; showCaption?: boolean | undefined; responsive?: "scroll" | "cards" | undefined; density?: "compact" | "comfortable" | undefined; footer?: ReactNode; tableClassName?: string | undefined; }`
- `TdProps`: `Omit<TdHTMLAttributes<HTMLTableCellElement>, "role"> & { label?: string | undefined; numeric?: boolean | undefined; primary?: boolean | undefined; actions?: boolean | undefined; href?: string | undefined; onActivate?: ((event: MouseEvent<HTMLElement, MouseEvent>) => void) | undefined; }`
- `ThProps`: `Omit<ThHTMLAttributes<HTMLTableCellElement>, "role"> & { numeric?: boolean | undefined; }`

## Example

```tsx
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@lufia/design-system/components/Table";

<Table caption="Projects">
  <TableHead>
    <TableRow>
      <Th>Project</Th>
      <Th>Status</Th>
      <Th numeric>Budget</Th>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <Td primary label="Project" href="/projects/1">
        Harbour redesign
      </Td>
      <Td label="Status">Active</Td>
      <Td label="Budget" numeric>
        12,400
      </Td>
    </TableRow>
  </TableBody>
</Table>;
```

## Accessibility

Follows the WAI-ARIA Authoring Practices pattern: [Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/).

Keyboard:

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves through the scroll region, each row's link or button, and the controls in its cells |
| Enter | Follows a row's link, or presses its button |
| Space | Presses a row's button (a link answers to Enter only) |
| Arrow keys (on the region) | Scroll the table sideways when it is focused |

## Motion

Its stylesheet has no `prefers-reduced-motion` branch of its own; any motion comes from the motion tokens, which collapse under reduced motion.

## Tokens

Reads these semantic tokens: `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-mono`, `--lufia-font-line-height-normal`, `--lufia-font-size-2xs`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-weight-medium`, `--lufia-font-weight-semibold`, `--lufia-radius-card`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-table-bg`, `--lufia-table-border`, `--lufia-table-row-hover`, `--lufia-table-scroll-shadow`.

## Content guidelines

`caption` says what the rows are: "Projects", "Invoices for March". Keep a `label` identical to its column header. Put the
row's identity in the `primary` cell and make it the one with `href` or `onActivate`; keep the actions to a few short
buttons that wrap well.

## Stories

- `components-data-display-table--default`
- `components-data-display-table--compact`
- `components-data-display-table--visible-caption`
- `components-data-display-table--phone-cards`
- `components-data-display-table--smallest-phone`
- `components-data-display-table--scroll-on-phone`
- `components-data-display-table--sortable-headers`
- `components-data-display-table--sortable-on-phone`
- `components-data-display-table--clickable-rows-as-links`
- `components-data-display-table--clickable-rows-as-buttons`
- `components-data-display-table--clickable-rows-on-phone`
- `components-data-display-table--empty`
- `components-data-display-table--empty-on-phone`
- `components-data-display-table--footer-with-pagination`
- `components-data-display-table--footer-on-phone`
- `components-data-display-table--long-content`
- `components-data-display-table--long-content-on-phone`
- `components-data-display-table--narrow-container`
- `components-data-display-table--all-themes`
