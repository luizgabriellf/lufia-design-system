# @lufia/design-system

## 0.2.0

### Minor Changes

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `AppShell`: a sidebar with collapsible groups that can shrink to a rail, header and footer slots and an active state from `currentPath`; on phones a top bar, a floating bar (`MobileFloatBar`) and a navigation sheet (`NavSheet`) with swipe-to-dismiss, focus trap, Escape and reduced-motion support. The parts (`Sidebar`, `SidebarGroup`, `SidebarItem`, `ShellNavigation`, `MobileFloatBar`, `NavSheet`) are exported for composition.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Modal` (beta): a portaled dialog with sizes, header and footer slots, focus trap, inert background, scroll lock, Escape and outside-click policies, a busy state and enter/exit motion. It follows the WAI-ARIA APG modal dialog pattern. A native `<dialog>` variant is deliberately not shipped: one API covers both.

- [#13](https://github.com/luizgabriellf/lufia-design-system/pull/13) [`ca6218c`](https://github.com/luizgabriellf/lufia-design-system/commit/ca6218c2b7c4ad115124154e28dec11e3a8cae72) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add motion: `--lufia-motion-distance-*` tokens and a reduced-motion policy that collapses durations and distances; the Reveal, Collapse, Skeleton, AnimatedNumber and ChangeHighlight primitives and the `usePrefersReducedMotion` hook (beta, from `@lufia/design-system/motion`); and the `lufia-verify-motion` command that flags literal durations and easings, animated layout properties and missing reduced-motion handling, with a shrink-only baseline.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ConfirmDialog` and `useConfirmDialog` (beta): an alert dialog with a destructive variant that starts focus on the safe action, and a busy state that refuses to close while the confirmed action runs. `useConfirmDialog` is a promise-based replacement for `window.confirm()`.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `CommandPalette`, a Ctrl/Cmd+K search-and-run overlay built as a combobox with a listbox popup inside a modal dialog, with grouped, accent-insensitive filtering and a custom filter hook for server search.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `ToastProvider`, `useToast` and `useOptionalToast` (beta): stacked notifications in four placements, assertive live region for errors and polite for the rest, auto-dismiss that pauses on hover and focus, errors and actions that persist, an action button, dismiss, de-duplication and a reduced-motion fallback.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `NavRow`, a compact clickable list row with icon, title, badge, description, meta and a chevron, rendered as a link, a button or a plain block.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `Pagination`, keyboard-accessible page navigation with `aria-current`, a constant-width ellipsis window, optional real links and a live status line, built to pair with `usePagination`.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `PeerNav`, a horizontal set of sibling views with an animated active indicator. It renders a link list with `aria-current` when every item has an `href`, and a WAI-ARIA tablist with arrow-key navigation otherwise.

- [#16](https://github.com/luizgabriellf/lufia-design-system/pull/16) [`e51806b`](https://github.com/luizgabriellf/lufia-design-system/commit/e51806b2c33ff44d3401d61a33eed39e4c2af275) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add the foundations for overlays and navigation: `LufiaProvider` (a `linkComponent` adapter and aria-only `labels`) with `useLufia` and `LufiaLink`; the hooks `useFocusTrap` (APG dialog focus handling, optional `inert` background), `useMediaQuery` (SSR-safe), `useModalState` (modal state in the URL through a router-agnostic adapter), `useDismiss`, `usePagination` and `useStepDirection`; and `VisuallyHidden`. `useBodyScrollLock` now compensates the scrollbar width in document mode; its API is unchanged.

- [#18](https://github.com/luizgabriellf/lufia-design-system/pull/18) [`06128ac`](https://github.com/luizgabriellf/lufia-design-system/commit/06128ac078f2e5f764303b80863f7a570e1cbaa1) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `useSlidingIndicator`, a hook that slides a decorative indicator behind the active item of a tab-like row using `transform` only.

- [#17](https://github.com/luizgabriellf/lufia-design-system/pull/17) [`c40f6e8`](https://github.com/luizgabriellf/lufia-design-system/commit/c40f6e88e68d89abd140e21d1aa35f8980a3f53f) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Add `SuccessCheck` (beta): a decorative check mark whose stroke draws in once, and is simply drawn under reduced motion.

### Patch Changes

- [#15](https://github.com/luizgabriellf/lufia-design-system/pull/15) [`b284b43`](https://github.com/luizgabriellf/lufia-design-system/commit/b284b43d433c64d62e4ac79dbc4cbb48c854c786) Thanks [@luizgabriellf](https://github.com/luizgabriellf)! - Build declarations with a larger Node heap so installs from a git tag do not run out of memory.

## 0.1.0

Initial public pre-release (consumed from a git tag; npm publishing is on hold).

- DTCG design tokens built with Style Dictionary: primitive and semantic layers, `default` and `example-brand` themes, light, dark and forced-colors, plus a WCAG AA contrast check in CI.
- First `beta` components: `ActionIcons`, `DetailAttentionCard`, `DetailList`, `DetailSectionCard`, `EmptyState`, `SortableTh`, `StatusTimeline`, `Stepper`, `TableToolbar` and the `useBodyScrollLock` hook.
- Storybook documentation site with theme, mode and viewport controls, deployed to GitHub Pages.

Later releases are generated from changesets.
