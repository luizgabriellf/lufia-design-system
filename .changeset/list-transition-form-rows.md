---
"@lufia/design-system": patch
---

`ListTransition`: form controls inside a leaving item are disabled, so they no longer take part in form submission or validation during the exit, and a leaving item under a non-rendered ancestor unmounts at once. The item content wrapper is now a `fieldset` with `role="none"` instead of a `div`: it is listed in `form.elements`, and selectors that targeted the inner `div` need updating.
