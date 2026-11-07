---
"@lufia/design-system": patch
---

`useFocusTrap` (and so `Modal`, `ConfirmDialog` and every component built on it) now follows the browser's keyboard Tab order: elements with a negative `tabindex` (for example the inactive items of a roving tab stop) and disabled controls are no longer tab stops inside a trap, and positive `tabindex` values come before the natural DOM order. `getFocusableElements` returns the elements in that order.
