---
"@lufia/design-system": minor
---

Fix entrance animations leaving a resting `transform`, and add component tokens.

- Fix: `RouteTransition`, `Stagger`, `Reveal` and the entrance animations of `Modal`, `NavSheet`, `CommandPalette`, `Toast`, `Combobox`, `MoreActions` and the chart bars used `animation-fill-mode: both`, which left an identity `transform` on the element after the animation. That made it the containing block of any `position: fixed` descendant rendered inline. They now fill `backwards`, so the resting state is `transform: none`.
- Add component tokens, with defaults equal to the current values: `--lufia-page-header-eyebrow-{color,tracking,dash-size,dash-gap}`, `--lufia-page-header-title-{size,tracking}`, `--lufia-stat-tile-label-{color,size,tracking}`, `--lufia-stat-tile-value-size{,-narrow}`, `--lufia-card-{header-padding,body-padding,shadow,divider-color}` and `--lufia-attention-list-bar-{width,inset}`.
- Add `Card` `divider` and `AttentionList` `barStyle="edge" | "inset"`.
- Document every component token on the new "Theming components" page.
