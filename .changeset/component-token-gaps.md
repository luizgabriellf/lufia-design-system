---
"@lufia/design-system": minor
---

Add component tokens: `--lufia-page-header-eyebrow-dash-thickness`, `--lufia-page-header-eyebrow-weight`, `--lufia-stat-tile-label-font`, `--lufia-attention-list-bar-inset-inline` and `-block` (the shorthand `--lufia-attention-list-bar-inset` stays the fallback), and `--lufia-card-body-padding-block` and `-inline` (they default to the `padding` prop; when `--lufia-card-body-padding` is set it wins and the axis tokens are ignored). Fallbacks equal the previous values, so nothing changes by default.
