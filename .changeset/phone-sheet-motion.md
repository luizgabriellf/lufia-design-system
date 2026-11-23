---
"@lufia/design-system": patch
---

Bottom sheets on phones move like sheets. `NotificationCenter` and `MoreActions` sheets can be swiped down from their grabber to dismiss, and enter with the drawer easing. `Modal` sheets on phones slide in from the edge they are anchored to instead of scaling and fading. `useSheetDrag` also drives any panel marked `data-sheet-panel`.
