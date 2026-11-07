---
"@lufia/design-system": patch
---

`Badge` and `Button` labels no longer split a word mid-way when their row is tight: they use `overflow-wrap: break-word` instead of `anywhere`, so a short label keeps its width and only an unbroken long string wraps.
