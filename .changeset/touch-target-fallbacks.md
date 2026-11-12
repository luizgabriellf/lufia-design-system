---
"@lufia/design-system": patch
---

Touch targets: every component now reads `--lufia-target-touch` with a 2.75rem fallback, so the table toolbar search input, the combobox toggle and the other narrow-width controls keep their minimum size on a page that has not loaded the tokens. The file field remove button takes the touch size at narrow widths and on coarse pointers. The navigation sheet scrolls a focused item clear of its docked bar (`scroll-padding-block-end`).
