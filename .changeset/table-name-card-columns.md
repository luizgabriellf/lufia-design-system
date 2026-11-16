---
"@lufia/design-system": minor
---

Table can be named without a visible caption: pass `aria-label` or `aria-labelledby` instead of `caption` (exactly one of the three), and the same name goes on the table and its scroll region. In card mode `cardColumns` (2, 3 or 4, with `cardLayout="grid"`) sets how many labelled cells share a line, for comparison rows. `Th` and `Td` take `emphasis` to highlight a column in table and card mode, with `emphasisLabel` for visually hidden text that carries its meaning, themed through `--lufia-table-emphasis-bg`, `-color` and `-font-weight`. Defaults leave existing tables unchanged.
