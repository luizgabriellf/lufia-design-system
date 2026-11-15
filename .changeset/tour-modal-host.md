---
"@lufia/design-system": minor
---

Tour: a step with no resolved target is now hosted in the topmost open modal (a native `dialog` opened with `showModal()`, else an `aria-modal` region) instead of the body, so its card stays visible and clickable. `compactOnTyping` also accepts `{ hideBelowHeight }` to hide the card (`data-typing-hidden`) while typing on a short visual viewport; the compact card now also hides the note and the step counter. `step.placement` accepts `"auto"` (bottom, top, end, start). The heading is focused again when `targetStatus` turns `ready`, without taking focus from a field or control in use. `CHANGELOG.md` is now part of the published package files.
