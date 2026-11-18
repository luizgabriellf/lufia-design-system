---
"@lufia/design-system": minor
---

`Button` gains theme hooks for a more expressive surface, with no new props. `--lufia-button-primary-border` and `-border-hover` (also `secondary-border-hover` and `danger-border`) set the border apart from the fill, so a gradient fill no longer degrades the border to `currentcolor`; unset, the border is transparent with the fill painted under it, which renders the same as before. `--lufia-button-{primary,secondary,ghost,danger}-shadow` and `-shadow-hover` add elevation (default `none`), and `--lufia-button-hover-lift` (default `0`) raises a hovered button by a length, only where a pointer can hover, never while disabled or loading, and not under reduced motion; the press scale takes over while held. A theme that set only `--lufia-button-primary-bg` or `--lufia-button-danger-bg` to a translucent colour now gets no separate border ring.
