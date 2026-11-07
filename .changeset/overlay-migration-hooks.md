---
"@lufia/design-system": minor
---

Add the hooks an app needs to migrate its own modal, confirm dialog and toast onto the package.

- `Modal` and `ConfirmDialog` parts carry a stable `data-lufia-part` and take per-part class names through `classNames`. `ConfirmDialog` also takes `size`, `sheetPlacement` and `classNames`, and `useConfirmDialog().confirm()` passes them through.
- `registerOverlayLayer()` and `isTopOverlayLayer()` expose the focus-trap and dismiss stack, now kept on `globalThis.__lufiaOverlayStack`, so an app's own trap and duplicated copies of the package agree on which layer handles Escape and Tab.
- `ToastProvider` takes `viewportClassName`. New component tokens, with fallbacks equal to the previous values: `--lufia-toast-width`, `-min-width`, `-max-width`, `-gap`, `-padding-block`, `-padding-inline` (and `-start` / `-end`), `-align-items` and `-line-height`.
- `Pagination` takes `disabledMode="native"` to render a real `disabled` attribute on previous and next (default `"aria"`).
- `PeerNav` items accept any `href` type the configured link component accepts (`PeerNavItem<Href>`); strings keep working.
