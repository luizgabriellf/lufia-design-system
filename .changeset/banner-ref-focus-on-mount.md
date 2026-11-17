---
"@lufia/design-system": minor
---

Banner: `ref` now reaches the root element (typed), and the opt-in `focusOnMount` gives the root `tabIndex={-1}` and moves
focus to it once when it mounts, for a message that replaces what the person was doing. It never takes focus again on a
re-render. The `live` roles are unchanged and the banner still never takes focus by default; the page documents when to
use `live` and when to use `focusOnMount`. Banner is now a client component, as it owns a ref and an effect.
