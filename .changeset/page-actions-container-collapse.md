---
"@lufia/design-system": minor
---

`PageActions` gains `collapse="container"`, which collapses the secondary actions by the width of the nearest ancestor that declares `container-type: inline-size` (below 50rem) instead of the viewport. `MoreActions` gains `narrowOnlyScope` for the same choice. Menu items and page actions gain `attributes`, a `data-*` passthrough rendered on the item element.
