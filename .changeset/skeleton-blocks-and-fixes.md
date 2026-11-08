---
"@lufia/design-system": minor
---

Add skeleton building blocks and fix two visual details.

- `SkeletonTable` (`rows`, `columns`, `stackBelow`, `still`), `SkeletonCard` (`header`, `lines`, `block`, `padding`,
  `still`) and `SkeletonPageHeader` (`eyebrow`, `description`, `actions`, `still`): decorative loading placeholders that
  keep the layout of the table, the card and the page header they stand for, and never overflow their container.
  A loading key figure keeps using `StatTile`'s `loading` prop.
- New theme tokens `--lufia-skeleton-bg` and `--lufia-skeleton-shine`, used by `Skeleton`. A theme without them keeps the
  previous colours. In dark mode the shine is now lighter than the fill instead of darker.
- `StatusIcon`: the `ring` and `mark` variants draw one simple mark per tone (check, exclamation, cross, serifed "i",
  clock hands, dash, three dots), optically centred and with one stroke weight. Warning no longer draws a triangle inside
  the ring, and danger (a `Toast` error) shows a cross. The `bare` glyphs are unchanged.
- `AppShell`: below 60rem the shell is at least as tall as the viewport, so a short page no longer shows the page
  background under it.
