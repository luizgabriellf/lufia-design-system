---
"@lufia/design-system": minor
---

FilterLinks has a `layout="grid"` option: equal columns, as many as fit, where each chip fills its cell with the label at the start and the count at the end. It suits many filters with counts, whose ragged widths are hard to scan when wrapped. The narrowest column is `--lufia-filter-links-column-min` (default `9rem`). `count` also accepts an element, for a count that carries its own emphasis.
