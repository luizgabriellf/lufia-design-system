---
"@lufia/design-system": minor
---

Add the hooks an app needs to migrate its own modal, confirm dialog and toast onto the package.

- `Modal` and `ConfirmDialog` parts carry a stable `data-lufia-part` and take per-part class names through `classNames`. `ConfirmDialog` also takes `size`, `sheetPlacement` and `classNames`, and `useConfirmDialog().confirm()` passes them through.
- `registerOverlayLayer()` and `isTopOverlayLayer()` expose the focus-trap and dismiss stack, now kept on `globalThis.__lufiaOverlayStack`, so an app's own trap and duplicated copies of the package agree on which layer handles Escape and Tab.
- `ToastProvider` takes `viewportClassName`. New component tokens, with fallbacks equal to the previous values in left-to-right layouts: `--lufia-toast-width`, `-min-width`, `-max-width`, `-gap`, `-padding-block`, `-padding-inline` (and `-start` / `-end`), `-align-items` and `-line-height`.
- `Pagination` takes `disabledMode="native"` to render a real `disabled` attribute on previous and next (default `"aria"`).
- `PeerNav` items accept any `href` type the configured link component accepts (`PeerNavItem<Href>`); strings keep working.
- Toast item padding is now logical (`padding-inline`, start and end), in line with the tone stripe on `border-inline-start`. In right-to-left layouts the larger padding therefore sits on the right, where the old physical shorthand put it on the left. Left-to-right output is unchanged.
- `--lufia-toast-gap` also sets the space between the two stacks (errors and the rest) inside the region.
- The inert bookkeeping of modals is shared on `globalThis` like the layer stack, so duplicated copies of the package agree. A legacy overlay portaled into `document.body` above an open `Modal` must carry `data-lufia-inert-exempt`.
