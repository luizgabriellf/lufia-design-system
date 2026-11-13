---
"@lufia/design-system": minor
---

Textarea: add the opt-in `autoSize` prop, with `maxRows`, so the box grows with its content from `rows` (the minimum) up to the maximum. It uses CSS `field-sizing: content` where the browser supports it and a small measuring fallback elsewhere, and works controlled and uncontrolled.
