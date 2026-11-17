---
"@lufia/design-system": minor
---

Button `primary` and `secondary` fills have optional theme hooks, like `danger` already had: `--lufia-button-primary-bg`, `--lufia-button-primary-bg-hover`, `--lufia-button-primary-fg`, `--lufia-button-secondary-bg`, `--lufia-button-secondary-bg-hover`, `--lufia-button-secondary-border` and `--lufia-button-secondary-fg`. Unset, each falls back to the semantic token the variant used before, so nothing changes until a theme sets one.
