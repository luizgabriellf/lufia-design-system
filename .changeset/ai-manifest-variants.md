---
"@lufia/design-system": minor
---

Extend the agent-facing component manifest. Hooks that return an object type now list its members (`returnMembers`),
props typed as a union of forms now list their `variants` with the discriminant and the props that differ per form, and the
Select and Combobox summaries mention "dropdown". The flat `props` list is unchanged. The `ai:search` lookup also matches
the start of a word.
