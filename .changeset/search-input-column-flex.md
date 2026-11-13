---
"@lufia/design-system": patch
---

Fix `SearchInput` taking 12rem of height inside a column flex container, which includes a `FormField` (the field is a column flex container, so a labelled search box in a filter form was 192px tall). The box now holds its block size at the height of its content, so the flex-basis no longer reaches the block axis: it still grows and wraps in a toolbar row, fills a grid track and keeps its 8rem floor.
