---
"@lufia/design-system": patch
---

DateField: the native control reads `--lufia-target-touch` with the 2.75rem fallback, like every other component, so it keeps its minimum height on a page that has not loaded the tokens.
