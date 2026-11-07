---
"@lufia/design-system": minor
---

Overlays: export `hasOpenOverlay()` and `overlayDepth()`, public readers of the shared overlay stack, so apps stop reading the global key. `Modal` publishes the height its sticky header covers as `--lufia-modal-header-block-size` on the panel (kept current with a `ResizeObserver`, `0px` with `scrollShadow`), so sticky content in the body can use it as its offset.
