---
"@lufia/design-system": minor
---

Make `SegmentedToggle` usable as a status picker. `value={null}` means nothing is chosen (no checked segment, hidden indicator), `allowDeselect` clears the choice when the chosen segment is activated again (and types `onValueChange` as `(value: string | null) => void`), `SegmentedToggleOption.tone` colours the chosen segment with the status tokens, `size="sm"` gives a denser variant, and the hidden `name` input submits nothing while unset. Existing usage is unchanged.
