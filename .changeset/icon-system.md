---
"@lufia/design-system": minor
---

A unified icon system, owned by the package, with no new dependency.

- **Icon set**: about fifty named icons (`CloseIcon`, `CheckIcon`, `ChevronDownIcon`, `SearchIcon`, `WarningIcon`,
  `SettingsIcon`, `SignOutIcon`...) on one 24-unit grid, `currentColor` strokes with round caps and joins. The geometry is
  adapted from Lucide (ISC); the notice ships in `THIRD_PARTY_NOTICES.md`. Exported from the new
  `@lufia/design-system/icons` subpath, from `components/Icon` and from the root; each icon is a separate pure export, so a
  bundler keeps only the ones an app imports.
- **`Icon` and `createIcon`**: the primitive the set is built on, and a helper that gives an app's own glyphs the same grid,
  stroke, sizes and accessibility. Decorative by default (`aria-hidden`); `title` or `aria-label` makes an icon an image
  with a name.
- **Tokens**: `--lufia-icon-size-sm|md|lg` (16, 20, 24px), `--lufia-icon-stroke` (1.75) and `--lufia-icon-stroke-sm` (2,
  so a 16px icon keeps the weight of a larger one). `size` takes `sm`, `md` (default), `lg`, `1em` or a number of px.
- **`StatusIcon`**: one family of status markers (`success`, `warning`, `danger`, `info`, `pending`, `neutral`,
  `needsInput`), each with its own shape, in `bare`, `ring` or `mark` variants. `Toast`, the `FormField` error,
  `DetailAttentionCard`, `StatusTimeline` and `Stepper` now draw their markers with it. An optional `drawOn` draws the glyph in
  once on mount (the `SuccessCheck` motion, off under reduced motion); a success toast keeps its animated check with it.
- **Every glyph in the package moved onto the set**: AppShell, Sidebar and NavSheet, Combobox, Select, SearchInput, the
  TableToolbar search field, CommandPalette, FileField, Modal, Toast, NotificationCenter and NotificationPanel,
  MoreActions, Link, NavRow, StatTile, SuccessCheck (it keeps its draw-on motion), Stepper, DetailAttentionCard and
  SortableTh. Text glyphs used as icons are gone, and every icon is `aria-hidden` unless named. Some icons change size
  slightly to land on the 16 or 20px steps.
- **Deprecated**: `DeleteIcon`, `DuplicateIcon`, `PendingIcon`, `OpenIcon`, `ReportIcon` and `ACTION_ICONS` are now aliases
  of `TrashIcon`, `CopyIcon`, `ClockIcon`, `RotateCcwIcon`, `FileTextIcon` and `ICONS`, and will be removed in the next
  minor release. `EditIcon` is the set's own. The action icons now default to `md` (20px); pass `size={13}` for the old
  size. `SuccessCheck` props are now `IconProps`.
- **StatusTimeline**: node states read as `StatusBadge` pills, dates use the body font with tabular figures, and the nodes
  carry `data-state` in place of a per-state class.
- **AppShell / NavSheet dark mode**: the portalled phone sheet now copies `data-lufia-theme` and `data-lufia-mode` from an
  ancestor of the shell, takes `sheetProps` (`className`, `data-*`, `container`) on `AppShell` and `layerProps` on
  `NavSheet` to carry an app's scoped palette, and exposes `data-lufia-part="nav-sheet-layer"`, `"nav-sheet-backdrop"` and
  `"nav-sheet"`.
- **Stepper**: the step list is its own stacking context, so its dots no longer paint over a sticky modal header.
- An ESLint rule rejects hand-drawn inline SVG icons and text glyphs in components.
