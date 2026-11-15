---
"@lufia/design-system": patch
---

Tour: `dialogLayout.dock` now resizes only the modal itself and lifts it clear of the card with a bottom margin, so docking into the package `Modal` (either `renderAs`) no longer stretches its header. A wrapper that fills a custom dialog opts in with `data-lufia-tour-shell` (it was the dialog's first child before). The reveal, `clipSpotlight` and docking also work for a portal `Modal`, read only the modal's own header and footer (not ones inside the content), and `clipSpotlight` stops at the sticky header and footer.
