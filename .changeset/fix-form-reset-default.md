---
"@lufia/design-system": patch
---

Fix a form reset after a form action restoring the previous default. `RadioGroup`, `SegmentedToggle`, `Switch`, `SearchInput`, `Combobox`, `Textarea` and `FileField` reset to the `defaultValue` or `defaultChecked` of the latest render, like native fields do, when React 19 resets the form right after an action commits and the action changed the default. `Checkbox`, `Select` and `SwitchInput` are native inputs and were not affected.
