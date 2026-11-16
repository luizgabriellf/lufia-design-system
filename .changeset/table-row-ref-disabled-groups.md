---
"@lufia/design-system": minor
---

Table: `TableRow`, `TableHead`, `TableBody`, `Th`, `Td` and the root now type `ref` (and `style`) as the element they render, so a sortable-list library can drive a row. `Td` gains `activateDisabled`: a disabled row control that keeps the button focusable with `aria-disabled="true"` and ignores activation, or renders the link without `href`, in the muted text colour. `TableRow` gains `group` for a group header row (`Th scope="colgroup"` with `colSpan`) inside one of several `TableBody`s; in card mode it is a full-width heading, not a card. A `Th` with `scope="rowgroup"` now has the `rowheader` role.
