---
"@lufia/design-system": minor
---

Tabs (beta): views of one page where one is shown at a time, as a WAI-ARIA tablist. `tab` buttons with roving tabindex,
arrow keys, Home and End (Left and Right reversed in right-to-left), `orientation="vertical"`, automatic activation or
`activation="manual"`, controlled (`value`, `onValueChange`) or uncontrolled (`defaultValue`) state, disabled tabs, a name
through `label` or `labelledBy`, panels optionally kept mounted (`keepMounted`), and sideways scrolling inside the row when
the tabs do not fit. When every item has an `href` it renders a `<nav>` of links through the `LufiaProvider` link adapter
with `aria-current="page"` instead of a tablist. Themed with `--lufia-tabs-*` hooks.
