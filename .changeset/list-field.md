---
"@lufia/design-system": minor
---

Add `ListField`: a form field that holds a list of short text entries. One text input per entry (editable in place), an add row where Enter adds and never submits the surrounding form, and a remove button on each entry. The entries are submitted as one hidden text value under `name`, joined with a line feed or by your `serialize`. It works controlled (`items`, `onChange`) and uncontrolled (`defaultItems`), supports `sanitizeItem`, `maxItems`, `itemMaxLength`, `maxTotalLength` and `required` (custom validity on the add input), and exposes `commitDraft()` on its ref for the pending text before a submit. Every string comes through the `labels` prop.
