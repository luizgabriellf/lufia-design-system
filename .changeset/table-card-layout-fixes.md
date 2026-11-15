---
"@lufia/design-system": patch
---

Fix four `Table` layout defects. In card mode a badge wraps instead of being clipped by the value column (a container can opt badges in with `--lufia-badge-white-space: normal`), and under 30rem the label stacks above the value so a long label word is no longer split inside the word. The scroll-shadow covers take their own `--lufia-table-cover-bg` token (opaque; defaults to `--lufia-table-bg`), which `frame="flush"` on a translucent surface needs. In table layout the actions column shrinks to its buttons and end-aligns them.
