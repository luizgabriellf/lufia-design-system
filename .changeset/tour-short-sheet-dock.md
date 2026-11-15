---
"@lufia/design-system": patch
---

Tour: with `dialogLayout.dock` on a phone, a sheet shorter than the viewport (a bottom sheet with a top offset, a native dialog sheet) now docks above the card too, whenever the card would cover it, so its footer stays reachable; it is capped and lifted, not stretched, and handed back when the step changes or the tour ends. With `dialogLayout.beside`, a wide dialog with no room beside, below or above it now gets the card inside it, where it covers the least (never the target or the dialog's header and footer, and as few controls as possible), instead of landing on the target's sibling fields. With `clipSpotlight`, and for a card docked on the bottom edge, the ring's own padding is kept inside the clipped edge, so the ring is no longer partly hidden under the card.
