---
"@lufia/design-system": patch
---

Fix `FormField` controls: an explicit `id` on a control inside a field is kept and the label follows it, and a second control in the same field no longer receives the field's id (it keeps its own or a generated one).
