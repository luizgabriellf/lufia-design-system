---
"@lufia/design-system": patch
---

Badge: keep a status word whole in a squeezed table column. The badge now uses `overflow-wrap: break-word` instead of
`anywhere`, so an auto-layout column can no longer shrink it to one character per line; a word still breaks when it
cannot fit on a line of its own.
