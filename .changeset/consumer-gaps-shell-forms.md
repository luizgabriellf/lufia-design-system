---
"@lufia/design-system": minor
---

Close gaps that kept consuming apps on their own shell, palette, picker and form code.

- `RouteProgress`: `startRouteProgress()` and `doneRouteProgress()` start and end the bar from code through window events
  (`ROUTE_PROGRESS_START_EVENT`, `ROUTE_PROGRESS_DONE_EVENT`); an `events` prop (`routeProgressEvents` on `AppShell`) listens
  for other names. A run started from code combines with `pending` and `trackLinks`.
- `NavSheet` `dragThreshold` (`sheetDragThreshold` on `AppShell`): the release distance (`ratio`, `min`, `max`) and flick
  (`flickVelocity`, `flickDistance`) are configurable; `SHEET_DRAG_THRESHOLD` holds the unchanged defaults.
- Shell primary action: `useShellPrimaryActionState()` reads the current action (to list it in a palette), the action takes
  a `description`, registration runs before paint, and `ShellPrimaryActionOwner` keeps the shell's default hidden on a hard
  load until the page's own action registers.
- `Modal` `footerStackAt="sheet"` stacks a `footerLayout="stack"` footer from 37.5rem, where the dialog becomes a sheet.
- `CommandPalette` `escapeClearsQuery`: the first Escape clears the typed text, the next closes.
- `FileField` `preview`: local thumbnails for chosen images.
- `Combobox` `maxResults` caps the list after the filter; `resultsLabel` also gets the total that matched.
