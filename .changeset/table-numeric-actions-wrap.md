---
"@lufia/design-system": patch
---

`Table`: numeric cells no longer wrap in table layout, so ISO dates and date-times stay on one line. `Td` takes a new `wrap` prop (with `actions`) that lets a row's controls wrap onto a second line, end-aligned, instead of forcing a sideways scroll; the default stays one line.
