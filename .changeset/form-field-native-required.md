---
"@lufia/design-system": minor
---

FormField: new `nativeRequired` prop (default `true`). With `nativeRequired={false}` a required field gives its control `aria-required="true"` and no native `required`, for forms that run their own validation and messages. `useFormFieldControl` now also returns `aria-required`, and lists each `aria-describedby` id once, in order, when a control repeats an id the field already supplies.
