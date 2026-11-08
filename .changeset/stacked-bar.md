---
"@lufia/design-system": minor
---

Add `StackedBar`: one bar split into proportional segments, with an optional legend. Each segment has a label, a value and
a chart tone (or a `hatch` pattern). The text alternative lists every label, value and share, `formatValue` and
`formatPercent` format them, a zero total and zero segments are handled, forced-colors gives each segment its own fill
pattern, and the draw-in is removed under reduced motion.
