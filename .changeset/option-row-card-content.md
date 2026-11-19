---
"@lufia/design-system": minor
---

Extend `OptionRow` for card-style rows and menu triggers: `eyebrow` and `meta` lines, `truncate` for one-line text with an ellipsis, a visual-only `highlighted` state, an open look for `aria-expanded="true"`, `interactive={false}` for a static non-button row, a `ref` prop, and the `--lufia-option-row-*` size hooks (minimum height, padding, title and description size) that keep the touch floor. Add `size="xl"` (4rem) and `shape="circle"` to `IconButton`, with the `--lufia-icon-button-size` and `--lufia-icon-button-icon-size` hooks. All defaults and existing rendering are unchanged.
