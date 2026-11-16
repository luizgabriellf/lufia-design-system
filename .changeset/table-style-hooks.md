---
"@lufia/design-system": minor
---

Table: add style hooks for tables placed in prose and hide idle scroll covers. New custom properties
`--lufia-table-header-*` (font family, size, weight, letter spacing, text transform; they restyle the column headers and
the card labels), `--lufia-table-caption-color`, `-font-size` and `-font-weight`, `--lufia-table-cell-vertical-align`,
`--lufia-table-cell-color` and `--lufia-table-primary-color`, plus a `captionTone="muted"` prop. Every default is unchanged.
Where the browser supports scroll-driven animations, the scroll covers and shadows are no longer painted when the table does
not overflow, which removes the edge bands on a translucent surface; other browsers keep the previous behaviour.
