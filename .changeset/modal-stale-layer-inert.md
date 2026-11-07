---
"@lufia/design-system": minor
---

Fix a modal opened over another modal being left `inert`. A portal `Modal` now renders no layer while it is closed and its exit animation has finished, and the inert bookkeeping is recomputed from the open modals: only the topmost modal's root is live, the roots below it are inert, and nothing stays inert once the last one closes, whatever the order. This also covers a layer that stays mounted (`keepMounted`, or a `useConfirmDialog` that keeps its options after it settles). `Reveal` gains an `onExited` callback, and `notifyTopModalDialogChanged` is now exported from `components/Modal`.

Inert state now lives on a new global key, so an older copy of the package (0.7.0 or earlier) loaded on the same page can never crash or leave the page stuck inert. Known limits while such an older copy has its own modal open: the background can stay interactive until the newer copy's modals close, and a newer modal whose root was already in the body before the older modal opened (`keepMounted`, or a pre-existing `container`) stays inert until the older modal closes. Nothing stays inert once every modal has closed. Upgrading every copy removes these limits.

A `Reveal` exit now also completes after a safety timeout (its animation duration and delay plus a short margin) if `animationend` never fires.
