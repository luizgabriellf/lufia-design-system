---
"@lufia/design-system": minor
---

Add `Tour`, a non-modal guided tour. A card walks through `steps` with a spotlight on each target (a CSS selector or a ref) that follows scroll and resize, scrolls the target into view, and becomes a centred card when the target is missing or hidden. The page stays operable. Controlled `open` and `stepIndex`, `onStepChange`, `onClose(reason)` and `onFinish`, all labels through props, arrow keys and Escape, focus on the step heading and returned on close, and a polite announcement of the step counter. Persistence stays in the app.
