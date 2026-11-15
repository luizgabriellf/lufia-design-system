---
"@lufia/design-system": patch
---

Tour: the tour layer now stacks at its own `--lufia-tour-z` (default: the new `--lufia-z-tour` token, 450, above the modal, sheet, menu and popover layers and below toasts and tooltips), so a sheet, menu or modal opened after the tour started no longer paints over the card or intercepts presses on its buttons. Tab on the card is no longer pulled back into such an overlay's focus trap. `--lufia-overlay-z` no longer affects the tour; set `--lufia-tour-z` to raise it above an app's own fixed elements.
