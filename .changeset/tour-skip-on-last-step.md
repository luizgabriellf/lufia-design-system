---
"@lufia/design-system": minor
---

Tour: add `skipOnLastStep` to keep the skip button (`onClose("skip")`) on the last step. A last `do` step with `showCloseButton={false}` now shows the skip button even without it, so the card is never left with no action.
