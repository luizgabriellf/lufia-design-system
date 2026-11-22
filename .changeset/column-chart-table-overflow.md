---
"@lufia/design-system": patch
---

`ColumnChart` no longer widens the page on a narrow screen: the data table kept for assistive technology is now clipped by a wrapper, since a table grows to its content whatever its own size. The table and its accessible name are unchanged.
