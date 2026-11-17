---
"@lufia/design-system": minor
---

Small controls feel physical. New tokens `--lufia-motion-easing-spring` (a gentle spring: a `linear()` curve where supported, a cubic-bezier elsewhere), `--lufia-motion-scale-press` (0.97) and `--lufia-motion-scale-press-subtle` (0.985); both scales reset to 1 under reduced motion. Button, Switch (the thumb), Checkbox, RadioGroup, SegmentedToggle, PeerNav, Tabs, NavRow, Card (interactive), Pagination and FilterLinks compress while pressed, never when disabled. The switch thumb, the segmented and peer-navigation indicators and the radio dot use the spring; the checkbox check draws in and unchecking is a plain fast fade. The mobile float bar and StatTile press effects now read the tokens, so the float bar press is 0.97 instead of 0.94, and the Button press is a scale instead of a 1px shift. Spring is for small elements travelling under about 2 rem, never for dialogs, sheets, popovers, menus or toasts (docs/MOTION.md).
