---
"@lufia/design-system": patch
---

The overlays that vanished on close now animate out, with the exit duration and easing, a fade and the reverse of their entrance: the `MoreActions` sheet and its backdrop, the `NotificationCenter` sheet, the `Combobox` popup (which holds its list as it was while it leaves), the app shell's rail tooltip, a `Modal` rendered as a native `dialog` (it stays open while it leaves, then closes and returns focus to the opener), and a `keepMounted` `Modal` panel and backdrop. A leaving surface is inert and takes no pointer, opening it again during the exit goes straight to open, and under reduced motion it goes at once. The shared presence hook also gets a timeout for an `animationend` that never arrives.
