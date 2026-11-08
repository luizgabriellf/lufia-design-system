---
"@lufia/design-system": minor
---

Make `SegmentedToggle` usable as a status picker. `value={null}` (or `defaultValue={null}`) means nothing is chosen (no checked segment, hidden indicator, and a form reset returns to it), `allowDeselect` clears the choice when the chosen segment is activated again and reports it through the new `onDeselect` callback (`onValueChange` still always receives a `string`), `SegmentedToggleOption.tone` colours the chosen segment with the status tokens, `size="sm"` gives a denser variant, and the hidden `name` input submits nothing while unset. Existing usage is unchanged.
