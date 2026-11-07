---
"@lufia/design-system": minor
---

Fix a modal opened over another modal being left `inert`. A portal `Modal` now renders no layer while it is closed and its exit animation has finished, and the inert bookkeeping is recomputed from the open modals: only the topmost modal's root is live, the roots below it are inert, and nothing stays inert once the last one closes, whatever the order. This also covers a layer that stays mounted (`keepMounted`, or a `useConfirmDialog` that keeps its options after it settles). `Reveal` gains an `onExited` callback, and `notifyTopModalDialogChanged` is now exported from `components/Modal`.
