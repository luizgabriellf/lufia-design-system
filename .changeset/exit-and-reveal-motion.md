---
"@lufia/design-system": minor
---

Three state changes that had no motion now have it. `Banner` takes a new `open` prop: set it to `false` and the banner fades out, is inert while it does, and then unmounts (at once under reduced motion); left out, it behaves as before. A field error eases in when it appears, in every field that shows one. In `Tabs`, the panel that appears after another tab is chosen fades in; nothing animates on first render. All of it is opacity and transform only and is removed under `prefers-reduced-motion`.
