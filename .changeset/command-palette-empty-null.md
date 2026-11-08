---
"@lufia/design-system": patch
---

`CommandPalette` no longer renders an empty row when `labels.empty` returns `null`, `undefined`, `false` or an empty
string, and the results area drops its padding when nothing is left to show (no results, no hint, no loading row), so a
notice that explains the state leaves no blank gap.
