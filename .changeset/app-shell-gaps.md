---
"@lufia/design-system": minor
---

AppShell:

- `parseShellState` and `serializeShellState` now live in a pure module, also exported from the new `@lufia/design-system/app-shell-state` subpath, so a React Server Component can import them. The main and `components/AppShell` exports keep them.
- `RouteProgress` takes `pending` and `trackLinks` together: with both, the bar shows while either is in progress. `trackLinks` defaults to `true` without `pending` and `false` with it, as before. `AppShell` passes it through as `routeTrackLinks`.
- `AppShell` `routeTransitionProps`: a `className` and `data-*` attributes for the region that plays the route motion.
- A `success` tone for `badgeTone` and `countTone` (nav items, `SidebarItem`, `ShellFooterItem` `countTone`).
- `MobileFloatBar` follows the visual viewport (`followViewport`, default on): it stays above the on-screen keyboard and covering toolbars, rAF-throttled, and does nothing without `window.visualViewport`.
- Nav items take one level of sub-items (`items`, `expanded`) and a `match` option (`"prefix"`, `"exact"`, `"query"` or a function) for query-string sections. In the rail the sub-items are hidden and their item is marked `aria-current="true"` while one of them is current. `SidebarItem` takes the sub-items as `children`, with `expanded`, `currentBranch` and `highlightedBranch`.
