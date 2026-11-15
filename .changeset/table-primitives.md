---
"@lufia/design-system": minor
---

Add `Table`, `Spinner` and `Disclosure` (all `beta`).

`Table` is a CSS-only data table for Server Components: a surface that scrolls sideways with edge shadows, monospace capital headers and, under 40rem of its own width, a list of cards (`responsive="cards"`, or `"scroll"` to keep the table). Parts: `TableHead`, `TableBody`, `TableRow`, `Th`, `Td` (`label`, `numeric`, `primary`, `actions`), `TableEmpty` (a full-width `EmptyState` row) and a `footer` slot for a `Pagination`. A row opens something through a real link (`href`) or button (`onActivate`) in one cell, stretched over the row, so it needs no handler or `role="button"` on the `<tr>`. `SortableTh` works in its header row. It holds no sorting, filtering or paging state.

`Spinner` is a small inline loading ring in three sizes that takes the colour of its text, is a labelled status or decorative, and stands still under reduced motion. The ring of `SearchInput`, `Combobox`, `CommandPalette` and `PendingSubmit` is now this component, with the same look.

`Disclosure` renders a native `<details>` and `<summary>` (so it works without script and in Server Components) with a turning chevron, `defaultOpen`, `name` for exclusive groups and a progressive height animation. `disclosureClasses` exposes its class names to style an existing `<details>`.
