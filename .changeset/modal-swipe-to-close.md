---
"@lufia/design-system": minor
---

`Modal` phone bottom sheets can be closed by dragging the header down: a grabber shows above the title, a long drag or a quick flick calls `onClose`, and a short drag or a refused close springs back. It applies only where an outside click would also close (`closeOnOutsideClick` on, not `busy`, `role="dialog"`, `sheetPlacement="bottom"`), works in portal, `keepMounted` and `renderAs="dialog"` modes, and Escape and the close button remain the keyboard route. The new `swipeToClose` prop (default `true`) turns it off. The panel has no transform at rest, so `position: fixed` descendants keep their viewport positioning.
