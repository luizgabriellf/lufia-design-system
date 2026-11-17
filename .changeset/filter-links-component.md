---
"@lufia/design-system": minor
---

FilterLinks (beta): a labelled row of links that each apply a filter to one list through the URL, with an optional count. Links render
through the `LufiaProvider` link adapter, the current one is marked `aria-current="true"`, the row wraps onto more lines
without widening the page, and chips are 44px tall under a coarse pointer. It carries no state, so a Server Component can render
it. Themed with `--lufia-filter-links-*` hooks.
