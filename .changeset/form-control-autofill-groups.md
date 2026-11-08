---
"@lufia/design-system": minor
---

Style browser autofill on every field control from tokens. The new optional `--lufia-color-bg-field-autofill` token
defaults to `bg.field`, so existing themes need no change. An invalid field keeps its inner danger line, read-only and
disabled fields use the surface colour, forced-colors hands the colours to the system, and fields with a prefix or suffix
square their inner corners. `Select` gains a `groups` prop that renders labelled `<optgroup>`s.
