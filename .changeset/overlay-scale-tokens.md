---
"@lufia/design-system": minor
---

Three motion tokens name the scale a surface arrives from and leaves to: `--lufia-motion-scale-enter` (0.96, anchored panels), `--lufia-motion-scale-enter-subtle` (0.98, dialogs and palettes) and `--lufia-motion-scale-exit` (0.98). `Menu`, `Popover`, `NotificationCenter`, `Modal` and `CommandPalette` read them instead of repeating the numbers, so an app's own panels can match. The values are unchanged, and like the press tokens they reset to `1` under reduced motion.
