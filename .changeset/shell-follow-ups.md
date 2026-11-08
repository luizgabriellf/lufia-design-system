---
"@lufia/design-system": minor
---

Close follow-up gaps that consuming apps found after moving onto `AppShell`.

- `AppShell`: the rules that hide the floating bar on wide screens and `ShellPrimaryActionSlot` on phones are scoped under
  the shell, so a `MobileFloatBar` or `Button` stylesheet that loads later no longer shows them in the wrong place.
- `AppShell` `labels.openMenu` names the floating bar's menu button (defaults to `labels.menu`), and `labels.closeMenu`
  names the sheet's close button (defaults to the provider's `close` label).
- `AppShell` `routeTimeout` and `RouteProgress` `timeout`: how long a `pending` or code-driven run may show (default 10
  seconds, `Infinity` allowed). Runs started only by a link click stay capped at 10 seconds.
- `AppShell` `routeTrackLinks="query"` and `RouteProgress` `trackLinks="query"`: a link that changes only the query string
  starts the bar too.
- `ShellPrimaryActionSlot` `size`: a `Button` size, or `touch` for the medium look at 44px.
- `--lufia-shell-item-min-block-size` sets the height of a top-level navigation item (default unchanged).
- The sidebar footer is capped at 40% of the sidebar (`--lufia-shell-footer-max-block-size`) and scrolls on its own, so
  the navigation keeps a usable height in a short window.
- A closed `SidebarGroup` that holds the current page gets `aria-current="true"` with its active look.
- `NavSheet`: a drag can start on a link in the header; past a short slop it becomes a drag and the link's click is
  cancelled, while a plain tap still follows the link.
- `CommandPalette` `className` and `data-*` props go on its portalled outermost layer; `onSubmit(query)` runs on Enter
  while `bodyOverride` is shown; a `keepOpen` command picked with the pointer gives focus back to the field.
- `useBodyScrollLock` restores the scroll with `behavior: "instant"`, so `scroll-behavior: smooth` does not animate it.
- `PendingSubmit` `variant="unstyled"`: a plain button that takes its look from `className` only, for apps that keep their
  own button classes for now.
- `FileField` docs map an app's own file-input props (`label`, `hint`, `error`, `labelClassName`, `ariaLabel`, `onFiles`,
  `clearable`) onto `FormField` and the existing props.
