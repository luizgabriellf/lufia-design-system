---
"@lufia/design-system": minor
---

Menu: a link item can be `native`. It renders a plain `<a>` with `href`, and `download`, `target` and `rel` passed
through, instead of going through the `LufiaProvider` link adapter, so it is never prefetched and never a client-side
transition (file downloads, server routes). Keyboard, type-ahead and closing on activation work as for every other item.
