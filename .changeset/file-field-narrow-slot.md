---
"@lufia/design-system": patch
---

**FileField:** in a narrow slot (under 28rem, such as a modal on a phone) the choose button now spans the drop area with its icon and label on one row and the drag hint sits under it, instead of the icon dropping above the label beside a floating hint. On a touch-first device (`hover: none` and `pointer: coarse`) the drag hint is hidden. The field's root is now an inline-size query container, so it needs a slot with a definite inline size, as a form field has.
