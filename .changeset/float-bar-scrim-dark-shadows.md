---
"@lufia/design-system": minor
---

Phone shell bottom: a scrim behind the floating bar, the bar kept on top of the open menu, and dark-mode shadows.

- `MobileFloatBar` draws a scrim by default: the page fades into the canvas behind the bar, from a little above it to the
  bottom edge of the screen, through the safe area. It belongs to the bar (shown only where the bar is, lifted with it
  above the keyboard, never takes a tap). `scrim={false}` turns it off; tune it with `--lufia-float-bar-scrim-block-size`,
  `--lufia-float-bar-scrim-color` and `--lufia-float-bar-scrim-stop`. The pill's surface is now drawn by `::before`.
- `AppShell` `floatScrim` now defaults to `true` and drives the bar's `scrim`; pass `floatScrim={false}` for the old look.
  The phone page's end padding is `--lufia-app-shell-float-clearance` (default unchanged, `6.5rem` plus the safe area).
- `NavSheet` takes a `dock`: a control bar kept in place at the bottom of the screen over the open sheet, inside the dialog
  and its focus trap, out of the drag. With a dock, the header has no close button of its own, the end of the sheet keeps
  clear of it (`--lufia-nav-sheet-dock-clearance`), and the dialog role is on the sheet's layer.
- `AppShell` keeps its floating bar on top of the open phone menu: the menu button turns into the close button
  (`labels.closeMenu`) with a turning cross-fade, and back whichever way the sheet closes (the button, a drag down, a tap
  outside, Escape). Search and the main action on that bar close the menu first. The sheet's own close button is gone.
- Dark modes of `default` and `example-brand` redefine `--lufia-shadow-sm`, `-md` and `-lg`: stronger alpha, and a 1px
  inset top highlight on `md` and `lg`, so floating surfaces read as lifted on dark canvases. Light is unchanged.
