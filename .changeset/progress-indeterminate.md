---
"@lufia/design-system": minor
---

`ProgressBar` gets `indeterminate`, for work whose length is not known yet. The bar states no value (`aria-valuenow` is absent), a short fill travels along the track with a transform-only animation that mirrors in right-to-left, and under reduced motion the fill stays in place and fades gently. `value` is left out with `indeterminate`; every existing use is unchanged.
