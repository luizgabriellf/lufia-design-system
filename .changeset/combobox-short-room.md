---
"@lufia/design-system": patch
---

Fix `Combobox` list height in short spaces: the list is never taller than the room left on its side (it was raised to about six rem and clipped), opens on the side with more room when both are short, and re-measures against the visual viewport so an on-screen keyboard that shrinks a dialog is accounted for.
