---
"@lufia/design-system": minor
---

`MoreActions` gains `presentation="auto" | "popover" | "sheet"`: a full-width bottom sheet in a portal, over a backdrop that covers the viewport, with focus trap, inert page, scroll lock and a `--lufia-overlay-z` stacking hook. `PageActions` uses `auto`, so its menu is a sheet below 60rem. Items without an icon now keep a leading slot when others have one.
