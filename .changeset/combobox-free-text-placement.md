---
"@lufia/design-system": minor
---

Close the gaps that kept apps from replacing a local combobox with `Combobox`. New `freeText` prop: the typed text is the value when no option is chosen (trimmed, `null` when empty), it follows every keystroke, Enter, Tab, Escape and blur settle it, and Enter never picks an unhighlighted first match. The list now opens upward and shortens to the room left in the nearest overflow-clipping ancestor as well as the viewport, and re-measures on scroll and resize (one measure per frame). `maxLength` and a given `id` (`<id>-listbox`, `<id>-option-<value>`) are now covered by tests and docs. Existing usage is unchanged.
