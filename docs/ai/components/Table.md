# Table

> A data table that scrolls sideways with edge shadows and turns into cards on narrow widths, with clickable rows and an empty state.

- Status: beta
- Category: Data display
- Import: `import { Table, TableBody, TableEmpty, TableFoot, TableHead, TableRow, Td, Th } from "@lufia/design-system/components/Table"`
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
| `TableFoot` | component |
| `TableHead` | component |
| `TableRow` | component |
| `Td` | component |
| `Th` | component |

## API

### `Table`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `caption` | `string` | no |  | The table's accessible name ("Projects"), and the name of the scrollable region around it. It is a real `<caption>`, visually hidden unless `showCaption` is set. |
| `showCaption` | `boolean` | no | `false` | Show the caption above the table instead of hiding it visually. |
| `captionTone` | `"default" \| "muted"` | no | `"default"` | With `showCaption`: `muted` sets the visible caption in the muted text colour, for a table that sits under prose and should not compete with its heading. Default `default`. `--lufia-table-caption-color` overrides either. |
| `aria-label` | `string` | no |  | Names the table and its scroll region without a `<caption>`. |
| `aria-labelledby` | `string` | no |  | Names the table and its scroll region by the id of an element the page already shows (a heading). |
| `children` | `ReactNode` | yes |  | `TableHead`, `TableBody` and, for a total row, `TableFoot`. |
| `responsive` | `"scroll" \| "cards"` | no | `"cards"` | What the table does when its own width is under 40rem. `cards` (default) turns every row into a card: the header row is hidden visually, the `primary` cell becomes the title (first, wherever its column is) and each other cell shows its `label`. `scroll` keeps the table and scrolls it sideways, with a shadow on each edge that has more to see. |
| `frame` | `"flush" \| "framed"` | no | `"framed"` | `framed` (default) draws the table's own border, radius and background. `flush` drops them so the table sits edge to edge inside a container that already has a frame (a card or panel); the header rule and row separators stay. In card mode each card keeps its own border either way. |
| `cardLayout` | `"stack" \| "grid"` | no | `"stack"` | How a card lays out its labelled cells under 40rem. `stack` (default) is one cell per line. `grid` sets labelled cells in two columns of label-over-value pairs, which makes a many-column row far shorter; it falls back to one column when the table is under 20rem wide. The title, the actions and unlabelled cells always take the full width, and a wide value can ask for it with `Td cardSpan="full"`. No effect in `responsive="scroll"` or above 40rem. |
| `cardColumns` | `2 \| 3 \| 4` | no | `2` | With `cardLayout="grid"`: how many labelled cells share a line of the card, 2 (default), 3 or 4, for a comparison row (one title and a value per option). A pair never gets narrower than its own content: when the cells do not fit they wrap onto the next line, so a narrow card does not overflow. With 2 a container under 20rem is one column; with 3 or 4 it keeps the columns and relies on that wrapping. `Td cardSpan="full"` still takes the whole line. |
| `density` | `"compact" \| "comfortable"` | no | `"comfortable"` | Row padding. Default `comfortable`. |
| `footer` | `ReactNode` | no |  | Hosts a `Pagination` (or any footer) under the rows. It is not part of the scrolling area. |
| `tableClassName` | `string` | no |  | Class for the `<table>` element; `className` goes to the outer wrapper. |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `aria-label` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated.

##### `aria-label: undefined`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `aria-label` | `undefined` | no |  |
| `aria-labelledby` | `undefined` | no |  |
| `caption` | `string` | yes | The table's accessible name ("Projects"), and the name of the scrollable region around it. It is a real `<caption>`, visually hidden unless `showCaption` is set. |
| `captionTone` | `"default" \| "muted"` | no | With `showCaption`: `muted` sets the visible caption in the muted text colour, for a table that sits under prose and should not compete with its heading. Default `default`. `--lufia-table-caption-color` overrides either. In every form; only its type differs. |
| `showCaption` | `boolean` | no | Show the caption above the table instead of hiding it visually. In every form; only its type differs. |

##### `aria-label: string`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `aria-label` | `string` | yes | Names the table and its scroll region without a `<caption>`. |
| `aria-labelledby` | `undefined` | no |  |
| `caption` | `undefined` | no |  |
| `captionTone` | `undefined` | no | In every form; only its type differs. |
| `showCaption` | `undefined` | no | In every form; only its type differs. |

##### `aria-label: undefined`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `aria-label` | `undefined` | no |  |
| `aria-labelledby` | `string` | yes | Names the table and its scroll region by the id of an element the page already shows (a heading). |
| `caption` | `undefined` | no |  |
| `captionTone` | `undefined` | no | In every form; only its type differs. |
| `showCaption` | `undefined` | no | In every form; only its type differs. |

### `TableBody`, `TableFoot`, `TableHead`

No props of its own. Native element attributes pass through.

### `TableEmpty`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | `ReactNode` | no |  | Decorative illustration or icon (hidden from assistive technology). |
| `body` | `string` | no |  |  |
| `action` | `ReactNode` | no |  | Next step, usually a button or link. |
| `colSpan` | `number` | yes |  | The number of columns, so the message spans the whole row. |
| `title` | `string` | no |  | Headline of the titled empty state. Leave it out to render `children` as one muted, centred line instead (`icon`, `body` and `action` are then ignored). |

Other native element attributes pass through to the root element.

### `TableRow`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `selected` | `boolean` | no |  | Marks the row as selected: sets `aria-selected` and a selected background. The app owns the selection. |
| `current` | `boolean` | no |  | Marks the row as the current one (the item shown in a detail pane, say): sets `aria-current="true"` and an accent on its start edge. |
| `group` | `boolean` | no |  | Marks a group header row: a row inside `TableBody` whose single `Th scope="colgroup"` has a `colSpan` over every column and names the rows that follow, up to the next group header. In card mode it is a full-width heading above its cards, not a card. Several `TableBody`s in one `Table` work too; put the group header first in each. |

Other native element attributes pass through to the root element.

### `Td`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `label` | `string` | no |  | The column's name, shown before the value in card mode ("Status"). Use the same text as the column header. Without it the value takes the whole line. Not shown for a `primary` or `actions` cell. |
| `numeric` | `boolean` | no |  | Right-aligned digits in tabular figures. |
| `primary` | `boolean` | no |  | The row's identity: bolder, and the title of the card. Usually the first cell. |
| `rowHeader` | `boolean` | no |  | Renders the cell as the row's header (`<th scope="row">`, `role="rowheader"`) instead of a `<td>`, so assistive technology announces it as the name of every other cell in the row. It keeps the look of a body cell (not the column-header capitals) and every other prop works as on a plain `Td`; with `primary` it is the card's title. Use it on the cell that identifies the row, usually the first. |
| `actions` | `boolean` | no |  | The row's buttons and links, laid out in a wrapping row. Never activates the row. |
| `wrap` | `boolean` | no |  | With `actions`: in table layout, lets the controls wrap onto a second line (end-aligned, with a gap) instead of keeping one line that can force a sideways scroll at mid widths. With room the controls still share one line; they wrap only when the table would overflow. Default off: the cell shrinks to its buttons. Use it for up to two or three short actions; for more than two text actions prefer one overflow menu in the cell. Card mode already wraps. |
| `stretch` | `boolean` | no |  | Card mode only: lets block content take the whole width of the value slot (a progress bar, a `flex: 1` child). By default the value is start-aligned and as wide as its content, which keeps a `Badge` or short text at its natural size but shrinks a block child that relies on stretching to its minimum width. Set it on cells whose content is block-level; leave it off for badges and text. Needs a `label`. |
| `cardSpan` | `"full"` | no |  | Card mode only, with `cardLayout="grid"`: `full` makes the cell span every column, for a wide value. Without the grid layout every cell already has the full width. |
| `cardSlot` | `"corner"` | no |  | Card mode only: `corner` takes the cell out of the card's flow and pins it to the card's top end corner (a drag handle or an overflow menu). It leaves no line of its own, the title reserves room beside it so text never runs under it, and it follows the text direction. Its `label` is not shown. Keep the cell small (an icon button); a `primary` cell in the same row is the one that reserves the room. |
| `cardOrder` | `number` | no |  | Card mode only: the cell's position among the card's cells, as CSS `order` (lower first, default 0). The `primary` cell defaults to a position before every other cell, so the title is first whatever the column order; give an `actions` cell a negative number to put it right after the title, or a positive one to keep it last. Visual order only: reading order and Tab order keep following the markup, so keep the markup order sensible and use this for small moves. |
| `hideInCards` | `boolean` | no |  | Card mode only: hides the cell visually, for a column whose value already appears elsewhere in the card (a company column repeated in the title). The cell stays in the accessibility tree, so the row keeps one cell per column header and assistive technology can still read it; hide it from assistive technology yourself only if the value is truly redundant. Pair it with `Th hideInCards`. |
| `emphasis` | `boolean` | no |  | Marks this column as the one to look at (a recommended plan in a comparison): a tinted background, in table and card mode, set with `--lufia-table-emphasis-bg`, `-color` and `-font-weight`. Set it on the `Th` and on every `Td` of the column. A tint alone is not an accessible cue, so when the emphasis carries meaning also pass `emphasisLabel`. |
| `emphasisLabel` | `string` | no |  | With `emphasis`: visually hidden text read after the content, so assistive technology gets what the tint says ("Recommended"). A string from the app, since the package has no copy of its own. Without it the emphasis is visual only. |
| `href` | `string` | no |  | Makes the row a link. The cell's content becomes a real link (through the `linkComponent` of `LufiaProvider`) whose click area is stretched over the whole row, so it can be opened in a new tab and is announced as a link. Interactive children of other cells (buttons, links) stay on top and do their own thing. One per row. |
| `onActivate` | `(event: MouseEvent<HTMLElement, MouseEvent>) => void` | no |  | Called when the row is activated. With `href` it is the link's click handler (call `event.preventDefault()` to handle the navigation yourself). Without `href` the cell's content becomes a real `<button>` stretched over the row, which Enter and Space both activate. One per row. Needs a Client Component, since it passes a function. |
| `activateLabel` | `string` | no |  | The accessible name of the generated link or button (`aria-label`), for a cell with `href` or `onActivate`: "Open details of Harbour redesign". Keep the cell's visible text inside it (WCAG 2.5.3). Without it the control is named by the whole cell content, `description` included. |
| `activateDescribedBy` | `string` | no |  | `aria-describedby` of the generated link or button: ids of elements that describe the row control. |
| `activateDisabled` | `boolean` | no |  | Turns the row control off while keeping it in the page: for a row that cannot be opened right now. The button stays focusable (`aria-disabled="true"`, like `Button` and `Pagination`, so focus is not lost and a reader can still find it) and activation is ignored; the link is rendered without `href`, so it cannot be followed. The cell reads muted. Needs `href` or `onActivate`. |
| `description` | `ReactNode` | no |  | A muted, regular-weight line under the cell's content: a description or an identifier under a `primary` name. In a cell with `href` or `onActivate` it is inside the control, so the whole block stays clickable and, without `activateLabel`, is part of the control's name. In card mode it stays under the value. |
| `after` | `ReactNode` | no |  | Content rendered in the same cell but outside the generated control, lifted above the row's stretched click area: a second link or a mailto next to the name. Interactive content here is valid HTML (never nested in the row's link or button), reachable in DOM order after the control and clickable. It sits on its own line under the content. |

Other native element attributes pass through to the root element.

### `Th`

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `abbr` | `string` | no |  | A short visible text for a long header ("Qty" for "Quantity ordered"). `children` stays the full name: it is what assistive technology reads (the short text is hidden from it and carries the full name as a `title` tooltip when the children are a string), what the revealed header row shows in card mode, and the attribute is also set natively on the `<th>`. Default: the children are shown as they are. |
| `numeric` | `boolean` | no |  | Right-aligned digits in tabular figures: use it on the header of a numeric column, with `numeric` on its cells. |
| `hideInCards` | `boolean` | no |  | Card mode only: drops this header's visible label when the matching `Td hideInCards` is dropped. The header row is already hidden visually in card mode; this also keeps the header out of the revealed row that shows while a sortable header has keyboard focus. It stays in the accessibility tree. |
| `wrap` | `boolean` | no |  | Lets the header text wrap onto a second line (balanced, aligned to the bottom of the header row) instead of staying on one line, so a long header such as a two-word label takes less width and a wide table scrolls sideways less. Default off: headers keep one line. Has no effect in card mode, where the header row is hidden. |
| `emphasis` | `boolean` | no |  | Marks this column as the one to look at (a recommended plan in a comparison): a tinted background, in table and card mode, set with `--lufia-table-emphasis-bg`, `-color` and `-font-weight`. Set it on the `Th` and on every `Td` of the column. A tint alone is not an accessible cue, so when the emphasis carries meaning also pass `emphasisLabel`. |
| `emphasisLabel` | `string` | no |  | With `emphasis`: visually hidden text read after the content, so assistive technology gets what the tint says ("Recommended"). A string from the app, since the package has no copy of its own. Without it the emphasis is visual only. |
| `actions` | `false \| true` | no |  | Header of the column of `Td actions` cells. Its text is visually hidden, so `label` is required. |
| `label` | `string` | no |  | The column's name for assistive technology ("Actions"), visually hidden. |

Other native element attributes pass through to the root element.

#### Variants

The props are a union of forms; `abbr` selects the form. Only the props that differ between forms are listed: a prop with the same type and requirement in every form is not repeated.

##### `abbr: string`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `abbr` | `string` | no | A short visible text for a long header ("Qty" for "Quantity ordered"). `children` stays the full name: it is what assistive technology reads (the short text is hidden from it and carries the full name as a `title` tooltip when the children are a string), what the revealed header row shows in card mode, and the attribute is also set natively on the `<th>`. Default: the children are shown as they are. In every form; only its type differs. |
| `actions` | `false` | no |  |
| `aria-label` | `string` | no | Native attribute in this form. |
| `aria-labelledby` | `string` | no | Native attribute in this form. |
| `children` | `ReactNode` | no | Native attribute in this form. |
| `emphasisLabel` | `string` | no | With `emphasis`: visually hidden text read after the content, so assistive technology gets what the tint says ("Recommended"). A string from the app, since the package has no copy of its own. Without it the emphasis is visual only. In every form; only its type differs. |
| `label` | `undefined` | no |  |
| `wrap` | `boolean` | no | Lets the header text wrap onto a second line (balanced, aligned to the bottom of the header row) instead of staying on one line, so a long header such as a two-word label takes less width and a wide table scrolls sideways less. Default off: headers keep one line. Has no effect in card mode, where the header row is hidden. In every form; only its type differs. |

##### `abbr: undefined`

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `abbr` | `undefined` | no | In every form; only its type differs. |
| `actions` | `true` | yes | Header of the column of `Td actions` cells. Its text is visually hidden, so `label` is required. |
| `emphasisLabel` | `undefined` | no | In every form; only its type differs. |
| `label` | `string` | yes | The column's name for assistive technology ("Actions"), visually hidden. |
| `wrap` | `undefined` | no | In every form; only its type differs. |

## Types

- `TableEmptyProps`: `Omit<EmptyStateProps, "title"> & { colSpan: number; title?: string | undefined; }`
- `TableRowProps`: `Omit<DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>, "role"> & { selected?: boolean | undefined; current?: boolean | undefined; group?: boolean | undefined; }`

## Example

```tsx
import {
  Table,
  TableHead,
  TableBody,
  TableFoot,
  TableRow,
  Th,
  Td,
} from "@lufia/design-system/components/Table";

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

Reads these semantic tokens: `--lufia-badge-white-space`, `--lufia-border-width-thick`, `--lufia-border-width-thin`, `--lufia-color-accent-default`, `--lufia-color-accent-subtle`, `--lufia-color-bg-surface`, `--lufia-color-bg-surface-raised`, `--lufia-color-border-strong`, `--lufia-color-border-subtle`, `--lufia-color-focus-ring`, `--lufia-color-text-default`, `--lufia-color-text-muted`, `--lufia-font-family-mono`, `--lufia-font-line-height-normal`, `--lufia-font-size-2xs`, `--lufia-font-size-md`, `--lufia-font-size-sm`, `--lufia-font-size-xs`, `--lufia-font-weight-bold`, `--lufia-font-weight-medium`, `--lufia-font-weight-regular`, `--lufia-font-weight-semibold`, `--lufia-radius-card`, `--lufia-radius-sm`, `--lufia-space-1`, `--lufia-space-2`, `--lufia-space-3`, `--lufia-space-4`, `--lufia-space-6`, `--lufia-space-8`, `--lufia-table-bg`, `--lufia-table-border`, `--lufia-table-caption-color`, `--lufia-table-caption-font-size`, `--lufia-table-caption-font-weight`, `--lufia-table-cell-color`, `--lufia-table-cell-vertical-align`, `--lufia-table-cover-bg`, `--lufia-table-emphasis-bg`, `--lufia-table-emphasis-color`, `--lufia-table-emphasis-font-weight`, `--lufia-table-header-font-family`, `--lufia-table-header-font-size`, `--lufia-table-header-font-weight`, `--lufia-table-header-letter-spacing`, `--lufia-table-header-text-transform`, `--lufia-table-primary-color`, `--lufia-table-row-hover`, `--lufia-table-row-scroll-margin`, `--lufia-table-scroll-shadow`.

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
- `components-data-display-table--flush-in-panel`
- `components-data-display-table--flush-in-panel-on-phone`
- `components-data-display-table--framed`
- `components-data-display-table--named-row-control`
- `components-data-display-table--named-row-control-on-phone`
- `components-data-display-table--description-line`
- `components-data-display-table--row-header`
- `components-data-display-table--row-header-on-phone`
- `components-data-display-table--total-row`
- `components-data-display-table--total-row-on-phone`
- `components-data-display-table--highlighted-row-and-inline-bar`
- `components-data-display-table--row-state`
- `components-data-display-table--row-state-on-phone`
- `components-data-display-table--plain-empty`
- `components-data-display-table--scroll-margin`
- `components-data-display-table--scroll-margin-on-phone`
- `components-data-display-table--card-long-labels-and-badges`
- `components-data-display-table--few-columns-actions`
- `components-data-display-table--flush-translucent-surface`
- `components-data-display-table--numeric-and-wrapping-actions`
- `components-data-display-table--wrapping-actions-with-room`
- `components-data-display-table--tight-numeric-columns`
- `components-data-display-table--row-with-ref-and-style`
- `components-data-display-table--disabled-row-control`
- `components-data-display-table--disabled-row-control-on-phone`
- `components-data-display-table--grouped-bodies`
- `components-data-display-table--grouped-bodies-on-phone`
- `components-data-display-table--grouped-bodies-scroll`
- `components-data-display-table--card-controls`
- `components-data-display-table--card-controls-grid`
- `components-data-display-table--card-controls-grid-smallest-phone`
- `components-data-display-table--actions-alignment`
- `components-data-display-table--wide-headers-plain`
- `components-data-display-table--wide-headers-wrap`
- `components-data-display-table--wide-headers-abbr`
- `components-data-display-table--wide-headers-abbr-on-phone`
- `components-data-display-table--corner-with-inline-width`
- `components-data-display-table--grid-with-long-pills`
- `components-data-display-table--comparison-table`
- `components-data-display-table--comparison-cards`
- `components-data-display-table--comparison-cards-smallest-phone`
- `components-data-display-table--named-without-caption`
- `components-data-display-table--header-typography-hooks`
- `components-data-display-table--header-typography-hooks-on-phone`
- `components-data-display-table--caption-tone`
- `components-data-display-table--top-aligned-cells`
- `components-data-display-table--dimmer-cells`
- `components-data-display-table--dimmer-cells-on-phone`
- `components-data-display-table--flush-translucent-idle`
