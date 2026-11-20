---
"@lufia/design-system": minor
---

`IconButton` now shows the package tooltip instead of a native `title` attribute: it appears on mouse hover and keyboard focus, is `aria-hidden` (the `aria-label` stays the name) and no `title` attribute is rendered. Consuming apps that query an icon button by title should query by accessible name. New props: `tooltipPlacement` (default `top`) and `tooltip` (default `true`; pass `false` when you wrap the button in your own `Tooltip`). `MoreActions` and `NotificationCenter` hide the tooltip while their popup is open.
