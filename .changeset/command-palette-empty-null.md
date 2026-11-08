---
"@lufia/design-system": patch
---

`CommandPalette` no longer renders an empty row, and its blank gap, when `labels.empty` returns `null`, `undefined`,
`false` or an empty string.
