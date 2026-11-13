---
"@lufia/design-system": minor
---

`ListField` closes four gaps for adoption in forms. `includeDraft` (off by default) submits the text still in the add input as if it had been added, without calling `onChange`, and lets a valid draft satisfy `required`; without it the 0.39 behaviour is unchanged, and `required` still ignores a draft. `labels.addInput` names the add input apart from the group and the add button; without it the input keeps the group label. `renderCount({ count, maxItems, length, maxTotalLength })` renders a counter under the hint, linked to the group with `aria-describedby`; nothing is rendered without it. New exported type `ListFieldCount`.
