---
"@lufia/design-system": minor
---

`Stagger` can now render as a real list: pass `as="ul"` or `as="ol"` with `li` children and they stay the direct children of the list, so list semantics are intact (the default is still a `div`). In `Menu`, native link items (`native` with `href`, `download`, `target`, `rel`) now add `rel="noopener noreferrer"` automatically for `target="_blank"` when no `rel` is given, and a disabled native item is rendered without `href`.
